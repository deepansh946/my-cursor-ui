"use client";

import { useCallback, useMemo, useState } from "react";
import { Lock, Search } from "lucide-react";
import { useGithubRepos } from "../hooks/useGithubRepos";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import { Spinner } from "./ui/Spinner";
import { Dialog } from "./ui/Dialog";

function RepoPickerPanel({
  selected,
  onClose,
  onSave,
}: {
  selected: string | null;
  onClose: () => void;
  onSave: (repo: string | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<string | null>(selected);
  const { data: list = [], isLoading, isError, error } = useGithubRepos(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) => r.full_name.toLowerCase().includes(q));
  }, [list, query]);

  const toggle = useCallback((full: string) => {
    setDraft((prev) => (prev === full ? null : full));
  }, []);

  const errorMessage =
    error instanceof Error ? error.message : "Could not load repos";

  return (
    <Dialog open onClose={onClose} label="Select repository">
      <div className="flex flex-col min-h-0">
        <div className="px-4 py-3 flex items-center justify-between shrink-0 border-b border-border">
          <div className="flex items-center gap-2">
            <Label>Repositories</Label>
            {draft && (
              <span className="text-xs px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-primary/10 text-primary font-medium">
                1
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Esc
          </Button>
        </div>

        <div className="px-4 py-3 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-8"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter…"
            />
          </div>
        </div>

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
          {!isLoading &&
            !isError &&
            filtered.map((r) => {
              const checked = draft === r.full_name;
              const [owner, repoName] = r.full_name.split("/");
              return (
                <label
                  key={r.full_name}
                  className={`flex items-center gap-2 px-2 py-2 rounded-[var(--radius)] cursor-pointer thread-row ${
                    checked ? "thread-row-active" : ""
                  }`}
                  style={{
                    borderLeft: `2px solid ${checked ? "var(--primary)" : "transparent"}`,
                  }}
                >
                  <input
                    type="radio"
                    name="repo-picker"
                    checked={checked}
                    onChange={() => toggle(r.full_name)}
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
                  <span className="text-xs text-muted-foreground shrink-0 font-data">{owner}</span>
                  <span className="text-xs text-muted-foreground">/</span>
                  <span
                    className={`text-xs truncate flex-1 font-data ${checked ? "text-foreground font-medium" : "text-foreground-secondary"}`}
                  >
                    {repoName}
                  </span>
                  {r.private && (
                    <Lock size={10} className="shrink-0 text-muted-foreground opacity-60" />
                  )}
                </label>
              );
            })}
        </div>

        <div className="px-4 py-3 flex justify-end gap-2 shrink-0 border-t border-border">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

export function RepoPicker({
  open,
  onClose,
  selected,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  selected: string | null;
  onSave: (repo: string | null) => void;
}) {
  if (!open) return null;

  return (
    <RepoPickerPanel
      key={selected ?? "none"}
      selected={selected}
      onClose={onClose}
      onSave={onSave}
    />
  );
}
