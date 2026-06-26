"use client";

import { RotateCcw } from "lucide-react";
import { Message } from "../types";
import { ToolBlock } from "./ToolBlock";
import { TerminalBlock } from "./TerminalBlock";
import { CodeBlock } from "./CodeBlock";
import { parseContent } from "../lib/parseContent";
import { Label } from "./ui/Label";

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
  const isToolError = isTool && message.isError;

  if (isTool && !isToolError) {
    return (
      <div className="w-full max-w-2xl mx-auto px-6 pb-4">
        {message.subtype === "terminal" || message.subtype === "git" ? (
          <TerminalBlock content={message.content} isStreaming={!!isStreaming} />
        ) : (
          <ToolBlock
            toolName={message.toolName ?? "unknown"}
            isStreaming={!!isStreaming}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex w-full max-w-2xl mx-auto px-6 pb-4 ${isHuman ? "justify-end" : "justify-start"}`}
    >
      <div className="flex flex-col gap-1 max-w-[80%]">
        <Label>{isHuman ? "You" : "Piper"}</Label>

        {message.isError && message.toolName && (
          <span className="text-xs font-medium w-fit px-2 py-0.5 rounded-[var(--radius-sm)] bg-destructive/10 text-destructive border border-destructive/20">
            {message.toolName}
          </span>
        )}

        <div
          className={`px-3 py-2 text-sm leading-relaxed rounded-[var(--radius-lg)] border ${
            isHuman
              ? "bg-surface-raised border-border text-foreground"
              : message.isError
                ? "bg-destructive/10 border-destructive/20 text-destructive"
                : "bg-surface border-border text-foreground"
          }`}
        >
          {parseContent(message.content).map((seg, i) =>
            seg.kind === "code" ? (
              <CodeBlock key={i} lang={seg.lang} code={seg.code} />
            ) : (
              <div
                key={i}
                className="markdown"
                dangerouslySetInnerHTML={{ __html: seg.html }}
              />
            ),
          )}
        </div>

        {message.isError && message.retryText && onRetry && (
          <button
            type="button"
            onClick={() => onRetry(message.retryText!, message.id)}
            className="self-start flex items-center gap-1.5 text-xs text-destructive opacity-60 hover:opacity-100 transition-opacity"
          >
            <RotateCcw size={12} />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
