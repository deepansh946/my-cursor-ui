"use client";

import { FaCheck, FaSpinner } from "react-icons/fa";

const TOOL_LABELS: Record<string, string> = {
  indexer: "Indexing files",
  readFile: "Reading file",
  listFiles: "Listing files",
  searchCode: "Searching code",
  writeFile: "Writing file",
  runCommand: "Running command",
};

function toolLabel(name: string): string {
  return TOOL_LABELS[name] ?? `Using ${name}`;
}

export function ToolBlock({
  toolName,
  isStreaming,
}: {
  toolName: string;
  isStreaming: boolean;
}) {
  return (
    <div className="flex items-center gap-2 py-1 text-xs text-zinc-500 dark:text-zinc-400">
      {isStreaming ? (
        <FaSpinner className="animate-spin shrink-0" />
      ) : (
        <FaCheck className="text-emerald-500 shrink-0" />
      )}
      <span>{toolLabel(toolName)}</span>
    </div>
  );
}
