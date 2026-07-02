"use client";

import { useMemo, useState } from "react";
import { Lock, Search } from "lucide-react";
import { useModels } from "../hooks/useModels";
import { LlmModel } from "../types";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import { Spinner } from "./ui/Spinner";
import { Dialog } from "./ui/Dialog";

function modelTier(id: string): "preview" | "stable" {
  return id.includes("preview") ? "preview" : "stable";
}

function ModelRow({
  model,
  checked,
  locked,
  onSelect,
}: {
  model: LlmModel;
  checked: boolean;
  locked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`flex flex-col gap-0.5 px-2 py-2 rounded-[var(--radius)] ${
        locked ? "cursor-default opacity-80" : "cursor-pointer thread-row"
      } ${checked ? "thread-row-active" : ""}`}
      style={{
        borderLeft: `2px solid ${checked ? "var(--primary)" : "transparent"}`,
      }}
    >
      <div className="flex items-center gap-2">
        <input
          type="radio"
          name="model-picker"
          checked={checked}
          disabled={locked}
          onChange={onSelect}
          className="sr-only"
        />
        <div
          className={`shrink-0 w-3.5 h-3.5 rounded-[var(--radius-sm)] flex items-center justify-center border ${
            checked ? "border-primary bg-primary" : "border-border bg-transparent"
          }`}
        >
          {checked && (
            <span className="text-[8px] font-bold leading-none text-background">✓</span>
          )}
        </div>
        <span
          className={`text-xs truncate flex-1 ${checked ? "text-foreground font-medium" : "text-foreground-secondary"}`}
        >
          {model.name}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground pl-5 line-clamp-2">{model.description}</p>
    </label>
  );
}

function ModelPickerPanel({
  selected,
  locked,
  onClose,
  onSave,
}: {
  selected: string | null;
  locked: boolean;
  onClose: () => void;
  onSave: (modelId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<string | null>(selected);
  const { data, isLoading, isError, error } = useModels();
  const list = data?.models ?? [];
  const defaultId = data?.default ?? "gemini-2.5-flash";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q),
    );
  }, [list, query]);

  const grouped = useMemo(() => {
    const stable = filtered.filter((m) => modelTier(m.id) === "stable");
    const preview = filtered.filter((m) => modelTier(m.id) === "preview");
    return { stable, preview };
  }, [filtered]);

  const errorMessage =
    error instanceof Error ? error.message : "Could not load models";

  const selectedId = draft ?? defaultId;

  return (
    <Dialog open onClose={onClose} label="Select model">
      <div className="flex flex-col min-h-0">
        <div className="px-4 py-3 flex items-center justify-between shrink-0 border-b border-border">
          <div className="flex items-center gap-2">
            <Label>Model</Label>
            {locked && (
              <span className="text-xs px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-surface-raised text-muted-foreground font-medium flex items-center gap-1">
                <Lock size={10} />
                Locked
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Esc
          </Button>
        </div>

        {!locked && (
          <div className="px-4 py-3 shrink-0">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
              />
              <Input
                className="pl-8"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter…"
              />
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto px-2 py-1">
          {isLoading && (
            <div className="flex items-center justify-center px-2 py-4">
              <Spinner />
            </div>
          )}
          {isError && !isLoading && (
            <div className="mx-2 my-2 px-3 py-3 rounded-[var(--radius)] text-xs bg-destructive/10 text-destructive border border-destructive/20">
              {errorMessage}
            </div>
          )}
          {!isLoading && !isError && filtered.length === 0 && (
            <p className="text-xs px-2 py-4 text-muted-foreground">No results</p>
          )}
          {!isLoading && !isError && grouped.stable.length > 0 && (
            <div className="mb-2">
              <p className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wide text-foreground-faint">
                Stable
              </p>
              {grouped.stable.map((m) => (
                <ModelRow
                  key={m.id}
                  model={m}
                  checked={selectedId === m.id}
                  locked={locked}
                  onSelect={() => setDraft(m.id)}
                />
              ))}
            </div>
          )}
          {!isLoading && !isError && grouped.preview.length > 0 && (
            <div>
              <p className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wide text-foreground-faint">
                Preview
              </p>
              {grouped.preview.map((m) => (
                <ModelRow
                  key={m.id}
                  model={m}
                  checked={selectedId === m.id}
                  locked={locked}
                  onSelect={() => setDraft(m.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-3 flex justify-end gap-2 shrink-0 border-t border-border">
          <Button variant="ghost" onClick={onClose}>
            {locked ? "Close" : "Cancel"}
          </Button>
          {!locked && (
            <Button
              onClick={() => {
                onSave(selectedId);
                onClose();
              }}
            >
              Save
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}

export function ModelPicker({
  open,
  onClose,
  selected,
  locked,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  selected: string | null;
  locked: boolean;
  onSave: (modelId: string) => void;
}) {
  if (!open) return null;

  return (
    <ModelPickerPanel
      key={selected ?? "none"}
      selected={selected}
      locked={locked}
      onClose={onClose}
      onSave={onSave}
    />
  );
}
