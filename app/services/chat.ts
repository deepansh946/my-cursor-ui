import { Message, MessageType, TokenUsage, LlmModel } from "../types";
import { apiFetch } from "../lib/apiClient";
import { getSession } from "next-auth/react";
import { contentToString } from "../lib/content";

function isToolErrorContent(content: string): boolean {
  if (
    content.startsWith("Error") ||
    content.includes("ToolException") ||
    content.startsWith("File not found") ||
    content.startsWith("Missing ") ||
    content.startsWith("Error committing") ||
    content.startsWith("Error pushing") ||
    content.startsWith("Error creating PR") ||
    content.startsWith("Error cloning")
  ) {
    return true;
  }
  try {
    const parsed = JSON.parse(content) as unknown;
    const items = Array.isArray(parsed) ? parsed : [parsed];
    return items.some(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        "error" in (item as Record<string, unknown>),
    );
  } catch {
    return false;
  }
}

export function formatToolErrorContent(content: string): string {
  try {
    const parsed = JSON.parse(content) as unknown;
    const items = Array.isArray(parsed) ? parsed : [parsed];
    const errors = items
      .filter(
        (item) =>
          item !== null &&
          typeof item === "object" &&
          "error" in (item as Record<string, unknown>),
      )
      .map((item) => String((item as { error: unknown }).error));
    if (errors.length > 0) return errors.join("\n");
  } catch {
    /* not json */
  }
  return content;
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
      tool_target?: string;
      tool_call_id?: string;
      subtype?: string;
    }>;
  };
  return (data.messages ?? []).map((m) => {
      const raw = contentToString(m.content);
      const isError = m.type === "ToolMessage" ? isToolErrorContent(raw) : false;
      const content =
        m.type === "ToolMessage" && isError ? formatToolErrorContent(raw) : raw;
      return {
        id: m.id,
        type: m.type as MessageType,
        content,
        toolName: m.tool_name,
        toolTarget: m.tool_target,
        toolCallId: m.tool_call_id,
        subtype: m.subtype,
        isError,
      };
    });
}

export async function fetchModels(): Promise<{ models: LlmModel[]; default: string }> {
  const res = await apiFetch("/models");
  if (!res.ok) return { models: [], default: "auto" };
  return (await res.json()) as { models: LlmModel[]; default: string };
}

export async function cloneRepo(
  threadId: string,
  repo: string,
): Promise<void> {
  const session = await getSession();
  const res = await apiFetch(
    `/thread/${encodeURIComponent(threadId)}/clone`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repo,
        github_token: session?.accessToken ?? "",
      }),
    },
  );
  if (!res.ok) {
    let detail = "Clone failed";
    try {
      const data = (await res.json()) as { detail?: string };
      if (data.detail) detail = data.detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
}

type StreamChunk = {
  type: string;
  content?: unknown;
  node?: string;
  tool_name?: string;
  tool_target?: string;
  tool_call_id?: string;
  subtype?: string;
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
};

interface StreamContext {
  text: string;
  updateMessages: (updater: (prev: Message[]) => Message[]) => void;
  onUsage?: (usage: TokenUsage) => void;
  onPlanComplete?: () => void;
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
      } else if (chunk.type === "plan_complete") {
        ctx.updateMessages((prev) => {
          const lastAiIdx = [...prev]
            .reverse()
            .findIndex((m) => m.type === "AIMessage");
          if (lastAiIdx === -1) return prev;
          const idx = prev.length - 1 - lastAiIdx;
          return prev.map((m, i) =>
            i === idx ? { ...m, isPlan: true } : m,
          );
        });
        ctx.onPlanComplete?.();
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
      } else if (chunk.type === "tool_call") {
        currentAiId = null;
        const callId = chunk.tool_call_id ?? crypto.randomUUID();
        ctx.updateMessages((prev) => [
          ...prev.filter(
            (m) => m.type !== "AIMessage" || m.content.trim().length > 0,
          ),
          {
            id: callId,
            type: "ToolMessage",
            content: "",
            toolName: chunk.tool_name,
            toolTarget: chunk.tool_target,
            toolCallId: chunk.tool_call_id,
          },
        ]);
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
        const raw = contentToString(chunk.content);
        const isError =
          chunk.type === "ToolMessage" && isToolErrorContent(raw);
        const content =
          chunk.type === "ToolMessage" && isError
            ? formatToolErrorContent(raw)
            : raw;
        const callId = chunk.tool_call_id;
        ctx.updateMessages((prev) => {
          const base = prev.filter(
            (m) => m.type !== "AIMessage" || m.content.trim().length > 0,
          );
          if (chunk.type === "ToolMessage" && callId) {
            const idx = base.findIndex((m) => m.toolCallId === callId);
            if (idx !== -1) {
              return base.map((m, i) =>
                i === idx
                  ? {
                      ...m,
                      content,
                      isError,
                      toolName: chunk.tool_name ?? m.toolName,
                      toolTarget: chunk.tool_target ?? m.toolTarget,
                      subtype: chunk.subtype ?? m.subtype,
                    }
                  : m,
              );
            }
          }
          return [
            ...base,
            {
              id: crypto.randomUUID(),
              type: chunk.type as MessageType,
              content,
              toolName: chunk.tool_name,
              toolTarget: chunk.tool_target,
              toolCallId: chunk.tool_call_id,
              subtype: chunk.subtype,
              isError,
            },
          ];
        });
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
  onPlanComplete?: () => void;
  onDone?: () => void;
  onStreamEnd?: () => void | Promise<void>;
}

let activeAbort: AbortController | null = null;

export function abortStream() {
  activeAbort?.abort();
}

async function streamChat(
  path: string,
  body: Record<string, unknown>,
  text: string,
  opts: StreamChatOptions,
): Promise<void> {
  activeAbort?.abort();
  const controller = new AbortController();
  activeAbort = controller;
  opts.setStreaming(true);
  try {
    const res = await apiFetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok || !res.body) throw new Error("Request failed");

    await processSseStream(res.body, {
      text,
      updateMessages: opts.updateMessages,
      onUsage: opts.onUsage,
      onPlanComplete: opts.onPlanComplete,
    });
  } catch (err) {
    if (controller.signal.aborted) return;
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
    const isCurrent = activeAbort === controller;
    if (isCurrent) activeAbort = null;
    if (!isCurrent) return;
    await opts.onStreamEnd?.();
    opts.setStreaming(false);
    opts.onDone?.();
  }
}

interface CallApiOptions extends StreamChatOptions {
  text: string;
  modelId: string;
  planMode?: boolean;
}

export async function callApi({
  text,
  threadId,
  repo = null,
  modelId,
  planMode = false,
  updateMessages,
  setStreaming,
  onUsage,
  onPlanComplete,
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
      model_id: modelId,
      plan_mode: planMode,
      github_token: session?.accessToken ?? "",
    },
    text,
    {
      threadId,
      repo,
      updateMessages,
      setStreaming,
      onUsage,
      onPlanComplete,
      onDone,
      onStreamEnd,
    },
  );
}
