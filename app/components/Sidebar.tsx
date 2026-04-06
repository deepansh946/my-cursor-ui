"use client";

import { FaPlus } from "react-icons/fa";
import { Thread } from "../types";
import { formatDate } from "../lib/storage";

export function Sidebar({
  threads,
  currentThreadId,
  onSelect,
  onNew,
}: {
  threads: Thread[];
  currentThreadId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  const sorted = [...threads].sort((a, b) => b.createdAt - a.createdAt);
  return (
    <div className="w-60 shrink-0 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
      <div className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={onNew}
          className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"
        >
          <FaPlus className="text-[10px]" /> New chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {sorted.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
              t.id === currentThreadId
                ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <p className="truncate font-medium">{t.title}</p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-0.5">
              {formatDate(t.createdAt)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
