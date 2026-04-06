"use client";

import { FaRedo } from "react-icons/fa";
import { Message } from "../types";
import { ToolBlock } from "./ToolBlock";
import { TerminalBlock } from "./TerminalBlock";
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
      <div className="w-full max-w-2xl mx-auto px-6 pb-4">
        {message.subtype === "terminal" ? (
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
        <span
          className="text-[10px] tracking-[0.15em] uppercase"
          style={{ color: isHuman ? "var(--accent)" : "var(--text-dim)" }}
        >
          {isHuman ? "you" : "piper"}
        </span>

        <div
          className="px-4 py-3 text-sm leading-relaxed rounded-lg"
          style={
            isHuman
              ? {
                  background: "var(--human-bg)",
                  border: "1px solid var(--human-border)",
                  color: "var(--text)",
                  borderRadius: "12px 12px 4px 12px",
                }
              : message.isError
                ? {
                    background: "var(--error-dim)",
                    border: "1px solid rgba(248,113,113,0.2)",
                    color: "var(--error)",
                    borderRadius: "12px 12px 12px 4px",
                  }
                : {
                    background: "var(--bg-muted)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    borderRadius: "12px 12px 12px 4px",
                  }
          }
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
            onClick={() => onRetry(message.retryText!, message.id)}
            className="self-start flex items-center gap-1.5 text-[10px] tracking-wide transition-opacity opacity-60 hover:opacity-100"
            style={{ color: "var(--error)" }}
          >
            <FaRedo className="text-[9px]" />
            <span>retry</span>
          </button>
        )}
      </div>
    </div>
  );
}
