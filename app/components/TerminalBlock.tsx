"use client";

import { FaSpinner, FaTerminal } from "react-icons/fa";

export function TerminalBlock({
  content,
  isStreaming,
}: {
  content: string;
  isStreaming: boolean;
}) {
  return (
    <div
      className="rounded-lg overflow-hidden text-xs"
      style={{
        border: "1px solid var(--border)",
        background: "var(--bg-muted)",
      }}
    >
      <div
        className="flex items-center gap-2 px-3 py-1.5"
        style={{
          borderBottom: "1px solid var(--border-dim)",
          color: "var(--text-dim)",
        }}
      >
        <FaTerminal className="text-[10px] shrink-0" style={{ color: "var(--accent)" }} />
        <span className="tracking-[0.15em] uppercase text-[10px]">terminal</span>
        {isStreaming && (
          <FaSpinner className="text-[9px] animate-spin ml-auto" style={{ color: "var(--accent)" }} />
        )}
      </div>
      <pre
        className="px-3 py-2 m-0 overflow-x-auto max-h-80 overflow-y-auto leading-relaxed"
        style={{
          fontFamily: "var(--font-mono), monospace",
          color: "var(--text-muted)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {content || (isStreaming ? "…" : "")}
      </pre>
    </div>
  );
}
