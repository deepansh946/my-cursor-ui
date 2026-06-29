import { Message, MessageType, TokenUsage } from "../types";
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

type StreamChunk = {
  type: string;
  content?: unknown;
  node?: string;
  tool_name?: string;
  subtype?: string;
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
};

interface StreamContext {
  text: string;
  updateMessages: (updater: (prev: Message[]) => Message[]) => void;
  onUsage?: (usage: TokenUsage) => void;
}

async function processSseStream(
  body: ReadableStream<Uint8Array>,
  ctx: StreamContext,
): Promise<void> {
  const reader = body.getReader();
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
      if (raw === "[DONE]") return;

      let chunk: StreamChunk;
      try {
        chunk = JSON.parse(raw);
      } catch {
        continue;
      }

      if (chunk.type === "usage") {
        ctx.onUsage?.({
          input_tokens: chunk.input_tokens ?? 0,
          output_tokens: chunk.output_tokens ?? 0,
          total_tokens: chunk.total_tokens ?? 0,
        });
      } else if (chunk.type === "AIMessage" || chunk.type === "AIMessageChunk") {
        const piece = contentToString(chunk.content);
        if (!piece.trim()) continue;

        if (currentAiId === null) {
          currentAiId = crypto.randomUUID();
          ctx.updateMessages((prev) => [
            ...prev,
            { id: currentAiId!, type: "AIMessage", content: piece },
          ]);
        } else {
          ctx.updateMessages((prev) =>
            prev.map((m) =>
              m.id === currentAiId
                ? { ...m, content: m.content + piece }
                : m,
            ),
          );
        }
      } else if (chunk.type === "error") {
        currentAiId = null;
        ctx.updateMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            type: "AIMessage",
            content: `Error: ${contentToString(chunk.content)}`,
            isError: true,
            toolName: chunk.tool_name,
            retryText: ctx.text,
          },
        ]);
      } else if (
        chunk.type === "ToolMessage" ||
        chunk.type === "HumanMessage"
      ) {
        currentAiId = null;
        const content = contentToString(chunk.content);
        const isError =
          chunk.type === "ToolMessage" && isToolErrorContent(content);
        ctx.updateMessages((prev) => [
          ...prev.filter(
            (m) => m.type !== "AIMessage" || m.content.trim().length > 0,
          ),
          {
            id: crypto.randomUUID(),
            type: chunk.type as MessageType,
            content,
            toolName: chunk.tool_name,
            subtype: chunk.subtype,
            isError,
          },
        ]);
      }
    }
  }
}

interface StreamChatOptions {
  threadId: string;
  repo?: string | null;
  updateMessages: (updater: (prev: Message[]) => Message[]) => void;
  setStreaming: (v: boolean) => void;
  onUsage?: (usage: TokenUsage) => void;
  onDone?: () => void;
  onStreamEnd?: () => void | Promise<void>;
}

async function streamChat(
  path: string,
  body: Record<string, unknown>,
  text: string,
  opts: StreamChatOptions,
): Promise<void> {
  opts.setStreaming(true);
  try {
    const res = await apiFetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) throw new Error("Request failed");

    await processSseStream(res.body, {
      text,
      updateMessages: opts.updateMessages,
      onUsage: opts.onUsage,
    });
  } catch (err) {
    opts.updateMessages((prev) => [
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
    await opts.onStreamEnd?.();
    opts.setStreaming(false);
    opts.onDone?.();
  }
}

interface CallApiOptions extends StreamChatOptions {
  text: string;
}

export async function callApi({
  text,
  threadId,
  repo = null,
  updateMessages,
  setStreaming,
  onUsage,
  onDone,
  onStreamEnd,
}: CallApiOptions) {
  const session = await getSession();
  await streamChat(
    "/chat",
    {
      message: text,
      thread_id: threadId,
      repo: repo ?? null,
      github_token: session?.accessToken ?? "",
    },
    text,
    { threadId, repo, updateMessages, setStreaming, onUsage, onDone, onStreamEnd },
  );
}
