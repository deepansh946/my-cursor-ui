"use client";

import { Check, Zap } from "lucide-react";
import { Spinner } from "./ui/Spinner";

const TOOL_LABELS: Record<string, string> = {
  indexer: "Indexing files",
  readFile: "Reading file",
  listFiles: "Listing files",
  searchCode: "Searching code",
  writeFile: "Writing file",
  runCommand: "Running command",
  terminal: "Terminal",
  commit_changes: "Committing changes",
  create_pr: "Creating PR",
  clone_repo: "Cloning repository",
};

export function ToolBlock({
  toolName,
  isStreaming,
}: {
  toolName: string;
  isStreaming: boolean;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 text-xs rounded-[var(--radius)] w-fit bg-surface border border-border text-foreground-secondary">
      <Zap size={12} className="shrink-0" />
      <span>{TOOL_LABELS[toolName] ?? toolName}</span>
      {isStreaming ? (
        <Spinner size={12} />
      ) : (
        <Check size={12} className="shrink-0" />
      )}
    </div>
  );
}
