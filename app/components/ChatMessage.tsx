"use client";

import { FaRedo } from "react-icons/fa";
import { Message } from "../types";
import { ToolBlock } from "./ToolBlock";
import { CodeBlock } from "./CodeBlock";
import { parseContent } from "../lib/parseContent";

export function ChatMessage({
  message,
  onRetry,
  isStreaming,
}: {
  message: Message;
  onRetry?: (text: string, id: string) => void;
  isStreaming?: boolean;
}) {
  const isHuman = message.type === "HumanMessage";
  const isTool = message.type === "ToolMessage";

  if (isTool) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4">
        <ToolBlock
          toolName={message.toolName ?? "unknown"}
          isStreaming={!!isStreaming}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex w-full max-w-2xl mx-auto px-4 ${isHuman ? "justify-end" : "justify-start"}`}
    >
      <div className="flex flex-col gap-1 max-w-[80%]">
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isHuman
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-br-sm"
              : message.isError
                ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400 rounded-bl-sm"
                : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 rounded-bl-sm"
          }`}
        >
          {parseContent(message.content).map((seg, i) =>
            seg.kind === "code" ? (
              <CodeBlock key={i} lang={seg.lang} code={seg.code} />
            ) : (
              <div
                key={i}
                className="markdown text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: seg.html }}
              />
            ),
          )}
        </div>
        {message.isError && message.retryText && onRetry && (
          <button
            onClick={() => onRetry(message.retryText!, message.id)}
            className="self-start flex items-center gap-1 text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors px-1"
          >
            <FaRedo className="text-[10px]" />
            <span>Retry</span>
          </button>
        )}
      </div>
    </div>
  );
}
