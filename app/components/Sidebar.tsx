"use client";

import { FaPlus, FaTrash } from "react-icons/fa";
import { Thread } from "../types";
import { formatDate } from "../lib/storage";

export function Sidebar({
  threads,
  currentThreadId,
  streaming,
  onSelect,
  onNew,
  onDelete,
}: {
  threads: Thread[];
  currentThreadId: string;
  streaming: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  const sorted = [...threads].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div
      className="w-56 shrink-0 flex flex-col"
      style={{ borderRight: "1px solid var(--border)", background: "var(--bg-subtle)" }}
    >
      {/* Brand */}
      <div className="px-4 py-4">
        <span
          className="text-[10px] tracking-[0.3em] uppercase"
          style={{ color: "var(--text-dim)" }}
        >
          conversations
        </span>
      </div>

      {/* New chat */}
      <div className="px-3 pt-3 pb-2">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs tracking-wide rounded-md transition-all"
          style={{
            color: "var(--accent)",
            border: "1px solid var(--border)",
            background: "var(--accent-glow)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-dim)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent-glow)")}
        >
          <FaPlus className="text-[9px]" />
          <span>new chat</span>
        </button>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto py-1">
        {sorted.map((t) => {
          const active = t.id === currentThreadId;
          return (
            <div
              key={t.id}
              className="flex items-stretch gap-0 group"
              style={{
                background: active ? "var(--bg-muted)" : "transparent",
                borderLeft: `2px solid ${active ? "var(--accent)" : "transparent"}`,
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "var(--bg-hover)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              <button
                type="button"
                onClick={() => onSelect(t.id)}
                className="flex-1 min-w-0 text-left px-3 py-2.5 transition-all"
              >
                <p
                  className="truncate text-xs"
                  style={{
                    color: active ? "var(--text)" : "var(--text-muted)",
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {t.title}
                </p>
                <p
                  className="text-[10px] mt-0.5"
                  style={{ color: "var(--text-dim)" }}
                >
                  {formatDate(t.createdAt)}
                </p>
              </button>
              <button
                type="button"
                disabled={streaming}
                title="Delete conversation"
                aria-label="Delete conversation"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(t.id);
                }}
                className="shrink-0 px-2 py-2 opacity-40 hover:opacity-100 disabled:opacity-20 transition-opacity"
                style={{ color: "var(--text-dim)" }}
              >
                <FaTrash className="text-[10px]" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
