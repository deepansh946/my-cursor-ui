"use client";

import { FaSpinner, FaCheck, FaBolt } from "react-icons/fa";

const TOOL_LABELS: Record<string, string> = {
  indexer: "Indexing files",
  readFile: "Reading file",
  listFiles: "Listing files",
  searchCode: "Searching code",
  writeFile: "Writing file",
  runCommand: "Running command",
  terminal: "Terminal",
};

export function ToolBlock({
  toolName,
  isStreaming,
}: {
  toolName: string;
  isStreaming: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-md w-fit"
      style={{
        background: "var(--bg-muted)",
        border: "1px solid var(--border)",
        color: "var(--text-muted)",
      }}
    >
      <FaBolt
        className="text-[10px] shrink-0"
        style={{ color: "var(--accent)", opacity: 0.7 }}
      />
      <span className="tracking-wide">{TOOL_LABELS[toolName] ?? toolName}</span>
      {isStreaming ? (
        <FaSpinner
          className="text-[9px] animate-spin shrink-0"
          style={{ color: "var(--accent)" }}
        />
      ) : (
        <FaCheck
          className="text-[9px] shrink-0"
          style={{ color: "var(--accent)" }}
        />
      )}
    </div>
  );
}
