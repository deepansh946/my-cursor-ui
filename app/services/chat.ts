import { Message, MessageType } from "../types";
import { apiFetch } from "../lib/apiClient";
import { getSession } from "next-auth/react";
import { contentToString } from "../lib/content";

function isToolErrorContent(content: string): boolean {
  return (
    content.startsWith("Error") ||
    content.includes("ToolException") ||
    content.startsWith("File not found") ||
    content.startsWith("Missing ") ||
    content.startsWith("Error committing") ||
    content.startsWith("Error pushing") ||
    content.startsWith("Error creating PR") ||
    content.startsWith("Error cloning")
  );
}

export async function deleteThread(threadId: string): Promise<boolean> {
  const res = await apiFetch(`/thread/${encodeURIComponent(threadId)}`, {
    method: "DELETE",
  });
  return res.ok;
}

export async function fetchThreadMessages(threadId: string): Promise<Message[]> {
  const res = await apiFetch(
    `/thread/${encodeURIComponent(threadId)}/messages`,
  );
  if (!res.ok) return [];
  const data = (await res.json()) as {
    messages: Array<{
      id: string;
      type: string;
      content: string;
      tool_name?: string;
      subtype?: string;
    }>;
  };
  return (data.messages ?? []).map((m) => {
    const content = contentToString(m.content);
    return {
      id: m.id,
      type: m.type as MessageType,
      content,
      toolName: m.tool_name,
      subtype: m.subtype,
      isError:
        m.type === "ToolMessage" ? isToolErrorContent(content) : false,
    };
  });
}

interface CallApiOptions {
  text: string;
  threadId: string;
  repo?: string | null;
  updateMessages: (updater: (prev: Message[]) => Message[]) => void;
  setStreaming: (v: boolean) => void;
  onDone?: () => void;
  onStreamEnd?: () => void | Promise<void>;
}

export async function callApi({
  text,
  threadId,
  repo = null,
  updateMessages,
  setStreaming,
  onDone,
  onStreamEnd,
}: CallApiOptions) {
  setStreaming(true);
  try {
    const session = await getSession();
    const res = await apiFetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        thread_id: threadId,
        repo: repo ?? null,
        github_token: session?.accessToken ?? "",
      }),
    });

    if (!res.ok || !res.body) throw new Error("Request failed");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let currentAiId: string | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (raw === "[DONE]") break;

        let chunk: {
          type: MessageType;
          content: unknown;
          node: string;
          tool_name?: string;
          subtype?: string;
        };
        try {
          chunk = JSON.parse(raw);
        } catch {
          continue;
        }

        if (chunk.type === "AIMessage" || chunk.type === "AIMessageChunk") {
          const piece = contentToString(chunk.content);
          if (currentAiId === null) {
            currentAiId = crypto.randomUUID();
            updateMessages((prev) => [
              ...prev,
              { id: currentAiId!, type: "AIMessage", content: piece },
            ]);
          } else {
            updateMessages((prev) =>
              prev.map((m) =>
                m.id === currentAiId
                  ? { ...m, content: m.content + piece }
                  : m,
              ),
            );
          }
        } else if (chunk.type === "error") {
          currentAiId = null;
          updateMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              type: "AIMessage",
              content: `Error: ${contentToString(chunk.content)}`,
              isError: true,
              toolName: chunk.tool_name,
              retryText: text,
            },
          ]);
        } else {
          currentAiId = null;
          const content = contentToString(chunk.content);
          const isError =
            chunk.type === "ToolMessage" && isToolErrorContent(content);
          updateMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              type: chunk.type,
              content,
              toolName: chunk.tool_name,
              subtype: chunk.subtype,
              isError,
            },
          ]);
        }
      }
    }
  } catch (err) {
    updateMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "AIMessage",
        content: `Error: ${err instanceof Error ? err.message : "Something went wrong"}`,
        isError: true,
        retryText: text,
      },
    ]);
  } finally {
    setStreaming(false);
    await onStreamEnd?.();
    onDone?.();
  }
}
