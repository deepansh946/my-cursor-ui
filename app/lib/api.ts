import { Message, MessageType } from "../types";
import { config } from "./config";

export async function deleteThread(threadId: string): Promise<boolean> {
  const res = await fetch(
    `${config.apiBaseUrl}/thread/${encodeURIComponent(threadId)}`,
    { method: "DELETE" },
  );
  return res.ok;
}

export async function fetchThreadMessages(threadId: string): Promise<Message[]> {
  const res = await fetch(
    `${config.apiBaseUrl}/thread/${encodeURIComponent(threadId)}/messages`,
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
  return (data.messages ?? []).map((m) => ({
    id: m.id,
    type: m.type as MessageType,
    content: m.content,
    toolName: m.tool_name,
    subtype: m.subtype,
  }));
}

interface CallApiOptions {
  text: string;
  threadId: string;
  updateMessages: (updater: (prev: Message[]) => Message[]) => void;
  setStreaming: (v: boolean) => void;
  onDone?: () => void;
}

export async function callApi({
  text,
  threadId,
  updateMessages,
  setStreaming,
  onDone,
}: CallApiOptions) {
  setStreaming(true);
  try {
      const res = await fetch(`${config.apiBaseUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, thread_id: threadId }),
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
          content: string;
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
          if (currentAiId === null) {
            currentAiId = crypto.randomUUID();
            updateMessages((prev) => [
              ...prev,
              { id: currentAiId!, type: "AIMessage", content: chunk.content },
            ]);
          } else {
            updateMessages((prev) =>
              prev.map((m) =>
                m.id === currentAiId
                  ? { ...m, content: m.content + chunk.content }
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
              content: `Error: ${chunk.content}`,
              isError: true,
              retryText: text,
            },
          ]);
        } else {
          currentAiId = null;
          updateMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              type: chunk.type,
              content:
                typeof chunk.content === "string"
                  ? chunk.content
                  : JSON.stringify(chunk.content, null, 2),
              toolName: chunk.tool_name,
              subtype: chunk.subtype,
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
    onDone?.();
  }
}
