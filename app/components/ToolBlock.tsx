"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronRight, X, Zap } from "lucide-react";
import { Spinner } from "./ui/Spinner";

const TOOL_LABELS: Record<string, string> = {
  indexer: "Indexing files",
  readFile: "Reading file",
  listFiles: "Listing files",
  searchCode: "Searching code",
  writeFile: "Writing file",
  create_file: "Creating file",
  runCommand: "Running command",
  terminal: "Terminal",
  commit_changes: "Committing changes",
  create_pr: "Creating PR",
  clone_repo: "Cloning repository",
};

const EXPANDABLE_TOOLS = new Set(["readFile", "terminal"]);

export function ToolBlock({
  toolName,
  target,
  content,
  isStreaming,
  isError,
}: {
  toolName: string;
  target?: string;
  content?: string;
  isStreaming: boolean;
  isError?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = EXPANDABLE_TOOLS.has(toolName) && !!content?.trim();
  const label = TOOL_LABELS[toolName] ?? toolName;

  return (
    <div
      className={`flex flex-col gap-0.5 px-3 py-2 text-xs rounded-[var(--radius)] w-full max-w-full bg-surface border ${
        isError
          ? "border-destructive/30 bg-destructive/5"
          : "border-border"
      } text-foreground-secondary`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Zap size={12} className={`shrink-0 ${isError ? "text-destructive" : ""}`} />
        <span className={isError ? "text-destructive" : ""}>{label}</span>
        {isStreaming ? (
          <Spinner size={12} />
        ) : isError ? (
          <X size={12} className="shrink-0 text-destructive" />
        ) : (
          <Check size={12} className="shrink-0" />
        )}
        {canExpand && (
          <button
            type="button"
            onClick={() => setExpanded((o) => !o)}
            className="ml-auto shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={expanded ? "Collapse output" : "Expand output"}
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        )}
      </div>
      {target && (
        <span className="font-data text-foreground-faint break-all pl-5">{target}</span>
      )}
      {isError && content && (
        <span className="font-data text-destructive text-[11px] break-words pl-5">{content}</span>
      )}
      {canExpand && expanded && content && (
        <pre className="font-data text-[11px] text-foreground-faint mt-1 pl-5 whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
          {content}
        </pre>
      )}
    </div>
  );
}
