"use client";

import { Terminal } from "lucide-react";
import { Label } from "./ui/Label";
import { Spinner } from "./ui/Spinner";
import { stripWorkspacePathInText } from "../lib/displayPath";

export function TerminalBlock({
  content,
  isStreaming,
}: {
  content: string;
  isStreaming: boolean;
}) {
  const displayContent = stripWorkspacePathInText(content);

  return (
    <div className="rounded-[var(--radius)] border border-border bg-surface overflow-hidden text-xs">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <Terminal size={12} className="shrink-0" />
        <Label>Terminal</Label>
        {isStreaming && <Spinner size={12} className="ml-auto" />}
      </div>
      <pre className="font-data px-3 py-2 m-0 overflow-x-auto max-h-80 overflow-y-auto leading-relaxed text-foreground-secondary whitespace-pre-wrap break-words bg-surface-raised">
        {displayContent || (isStreaming ? "…" : "")}
      </pre>
    </div>
  );
}
