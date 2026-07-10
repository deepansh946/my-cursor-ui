"use client";

import { Plus, Trash2 } from "lucide-react";
import { Thread, LlmModel } from "../types";
import { formatDate } from "../lib/storage";
import { threadDisplayTitle, modelShortName } from "../lib/threadDisplay";
import { Button } from "./ui/Button";
import { Label } from "./ui/Label";

function resolveModelLabel(
  thread: Thread,
  defaultModelId: string,
  models: LlmModel[],
): string {
  const id = thread.model ?? defaultModelId;
  const full = models.find((m) => m.id === id)?.name ?? id;
  return modelShortName(full);
}

export function Sidebar({
  threads,
  currentThreadId,
  streaming,
  defaultModelId,
  models,
  onSelect,
  onNew,
  onDelete,
  className = "",
}: {
  threads: Thread[];
  currentThreadId: string;
  streaming: boolean;
  defaultModelId: string;
  models: LlmModel[];
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  className?: string;
}) {
  const sorted = [...threads].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div
      className={`w-56 shrink-0 flex flex-col border-r border-border bg-surface ${className}`}
    >
      <div className="px-4 py-3">
        <Label>Threads</Label>
      </div>

      <div className="px-3 pb-2">
        <Button variant="outline" size="default" onClick={onNew} className="w-full">
          <Plus size={14} />
          New chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {sorted.map((t) => {
          const active = t.id === currentThreadId;
          return (
            <div
              key={t.id}
              className={`flex items-stretch group thread-row ${active ? "thread-row-active" : ""}`}
            >
              <button
                type="button"
                onClick={() => onSelect(t.id)}
                className="flex-1 min-w-0 text-left px-3 py-2"
              >
                <p
                  className={`truncate text-sm ${active ? "text-foreground font-medium" : "text-foreground-secondary"}`}
                >
                  {threadDisplayTitle(t)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 font-data">
                  {formatDate(t.createdAt)}
                </p>
                {t.repo && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate font-data">
                    {t.repo}
                  </p>
                )}
                <p className="text-[11px] text-foreground-faint mt-0.5 font-data">
                  {resolveModelLabel(t, defaultModelId, models)}
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
                className="shrink-0 px-2 py-2 opacity-0 group-hover:opacity-60 hover:!opacity-100 disabled:opacity-20 transition-opacity"
              >
                <Trash2 size={12} className="text-muted-foreground" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
