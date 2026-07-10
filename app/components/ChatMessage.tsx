"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { Message } from "../types";
import { ToolBlock } from "./ToolBlock";
import { TerminalBlock } from "./TerminalBlock";
import { CodeBlock } from "./CodeBlock";
import { ThinkingDots, StreamCursor } from "./StreamingIndicator";
import { parseContent } from "../lib/parseContent";
import { stripWorkspacePathInText } from "../lib/displayPath";
import { Label } from "./ui/Label";

const COLLAPSE_MAX_PX = 600;

function BubbleShell({
  isHuman,
  isError,
  children,
  onCopy,
  copied,
}: {
  isHuman: boolean;
  isError?: boolean;
  children: React.ReactNode;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="relative group/bubble">
      {!isHuman && onCopy && (
        <button
          type="button"
          onClick={onCopy}
          className="absolute top-1.5 right-1.5 p-1 rounded-[var(--radius-sm)] opacity-0 group-hover/bubble:opacity-100 transition-opacity text-muted-foreground hover:text-foreground bg-surface-raised border border-border"
          aria-label="Copy message"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      )}
      <div
        className={`px-3 py-2 text-sm leading-relaxed border ${
          isHuman
            ? "rounded-[var(--radius-lg)] rounded-br-sm bg-surface-raised border-border text-foreground"
            : isError
              ? "rounded-[var(--radius-lg)] rounded-bl-sm bg-destructive/10 border-destructive/20 text-destructive"
              : "rounded-[var(--radius-lg)] rounded-bl-sm bg-surface border-border border-l-2 border-l-primary/30 text-foreground"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function CollapsibleContent({
  isHuman,
  isError,
  content,
  isStreaming,
  onCopy,
  copied,
}: {
  isHuman: boolean;
  isError?: boolean;
  content: string;
  isStreaming?: boolean;
  onCopy?: () => void;
  copied?: boolean;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(true);
  const [needsCollapse, setNeedsCollapse] = useState(false);

  useEffect(() => {
    const el = innerRef.current;
    if (!el || isHuman) return;
    setNeedsCollapse(el.scrollHeight > COLLAPSE_MAX_PX);
  }, [content, isHuman]);

  const displayContent = stripWorkspacePathInText(content);

  const body = (
    <>
      {parseContent(displayContent).map((seg, i) =>
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
      {isStreaming && content.trim() && <StreamCursor />}
    </>
  );

  return (
    <BubbleShell isHuman={isHuman} isError={isError} onCopy={onCopy} copied={copied}>
      <div
        ref={innerRef}
        className={
          !isHuman && needsCollapse && collapsed
            ? "max-h-[600px] overflow-hidden relative"
            : undefined
        }
      >
        {body}
        {!isHuman && needsCollapse && collapsed && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-surface to-transparent pointer-events-none" />
        )}
      </div>
      {!isHuman && needsCollapse && collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="mt-2 text-xs text-primary hover:underline"
        >
          Show more
        </button>
      )}
    </BubbleShell>
  );
}

export function ChatMessage({
  message,
  onRetry,
  isStreaming,
  showLabel = true,
  isContinuation = false,
  retryText,
  inlineTool = false,
}: {
  message: Message;
  onRetry?: (text: string, id: string) => void;
  isStreaming?: boolean;
  showLabel?: boolean;
  isContinuation?: boolean;
  retryText?: string;
  inlineTool?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHuman = message.type === "HumanMessage";
  const isTool = message.type === "ToolMessage";
  const isToolError = isTool && message.isError;
  const effectiveRetry = message.retryText ?? retryText;

  const copyContent = useCallback(() => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }, [message.content]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const spacing = isContinuation ? "pb-1" : inlineTool ? "pb-1" : "pb-2";

  if (isTool && !isToolError) {
    const inner =
      message.subtype === "terminal" || message.subtype === "git" ? (
        <TerminalBlock content={message.content} isStreaming={!!isStreaming} />
      ) : (
        <ToolBlock
          toolName={message.toolName ?? "unknown"}
          target={message.toolTarget}
          content={message.content}
          isStreaming={!!isStreaming}
        />
      );

    if (inlineTool) {
      return <div className={spacing}>{inner}</div>;
    }

    return <div className={`w-full max-w-2xl mx-auto px-8 sm:px-10 ${spacing}`}>{inner}</div>;
  }

  if (isTool && isToolError) {
    const inner = (
      <>
        <ToolBlock
          toolName={message.toolName ?? "unknown"}
          target={message.toolTarget}
          content={message.content}
          isStreaming={false}
          isError
        />
        {effectiveRetry && onRetry && (
          <button
            type="button"
            onClick={() => onRetry(effectiveRetry, message.id)}
            className="mt-1 flex items-center gap-1.5 text-xs text-destructive opacity-60 hover:opacity-100 transition-opacity"
          >
            <RotateCcw size={12} />
            Retry
          </button>
        )}
      </>
    );

    if (inlineTool) return <div className={spacing}>{inner}</div>;
    return <div className={`w-full max-w-2xl mx-auto px-8 sm:px-10 ${spacing}`}>{inner}</div>;
  }

  const isThinking = !isHuman && isStreaming && !message.content.trim();

  if (!isHuman && !message.isError && !message.content.trim() && !isStreaming) {
    return null;
  }

  return (
    <div
      className={`w-full max-w-2xl mx-auto px-8 sm:px-10 flex ${spacing} ${isHuman ? "justify-end" : "justify-start"}`}
    >
      <div className="flex flex-col gap-1 max-w-[80%] min-w-0">
        {showLabel && (
          <Label>{isHuman ? "You" : "Piper"}</Label>
        )}

        {message.isError && message.toolName && (
          <span className="text-xs font-medium w-fit px-2 py-0.5 rounded-[var(--radius-sm)] bg-destructive/10 text-destructive border border-destructive/20">
            {message.toolName}
          </span>
        )}

        {isThinking ? (
          <BubbleShell isHuman={false}>
            <ThinkingDots />
          </BubbleShell>
        ) : (
          <CollapsibleContent
            isHuman={isHuman}
            isError={message.isError}
            content={message.content}
            isStreaming={isStreaming}
            onCopy={!isHuman && !message.isError ? copyContent : undefined}
            copied={copied}
          />
        )}

        {message.isError && effectiveRetry && onRetry && (
          <button
            type="button"
            onClick={() => onRetry(effectiveRetry, message.id)}
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
