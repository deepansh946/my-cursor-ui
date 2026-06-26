"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaLock, FaSearch } from "react-icons/fa";
import { useGithubRepos } from "../hooks/useGithubRepos";

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
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<string | null>(null);
  const { data: list = [], isLoading, isError, error } = useGithubRepos(open);

  const wasOpen = useRef(false);

  useEffect(() => {
    if (open && !wasOpen.current) {
      setDraft(selected);
      setQuery("");
    }
    wasOpen.current = open;
  }, [open, selected]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) => r.full_name.toLowerCase().includes(q));
  }, [list, query]);

  const toggle = useCallback((full: string) => {
    setDraft((prev) => (prev === full ? null : full));
  }, []);

  if (!open) return null;

  const errorMessage =
    error instanceof Error ? error.message : "Could not load repos";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Select repository"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[min(80vh,520px)] flex flex-col rounded-lg overflow-hidden"
        style={{
          border: "1px solid var(--border)",
          background: "var(--bg-subtle)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-4 py-3 flex items-center justify-between shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] tracking-[0.2em] uppercase"
              style={{ color: "var(--text-dim)" }}
            >
              repositories
            </span>
            {draft && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                style={{
                  background: "var(--accent-dim)",
                  color: "var(--accent)",
                }}
              >
                1
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-2 py-1 rounded opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: "var(--text-muted)" }}
          >
            esc
          </button>
        </div>

        <div className="px-4 py-2.5 shrink-0">
          <div className="relative">
            <FaSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-dim)", fontSize: 10 }}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="filter…"
              className="w-full pl-8 pr-3 py-2 text-xs rounded-md focus:outline-none"
              style={{
                border: "1px solid var(--border)",
                background: "var(--bg-muted)",
                color: "var(--text)",
              }}
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-2 py-1">
          {isLoading && (
            <div className="flex items-center gap-1.5 px-2 py-4">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1.5 rounded-full"
                  style={{
                    background: "var(--accent)",
                    animation: `sage-pulse 1.4s ease-in-out ${i * 220}ms infinite`,
                  }}
                />
              ))}
            </div>
          )}
          {isError && !isLoading && (
            <p className="text-xs px-2 py-4" style={{ color: "var(--error)" }}>
              — {errorMessage}
            </p>
          )}
          {!isLoading && !isError && filtered.length === 0 && (
            <p className="text-xs px-2 py-4" style={{ color: "var(--text-dim)" }}>
              — no results
            </p>
          )}
          {!isLoading &&
            !isError &&
            filtered.map((r) => {
              const checked = draft === r.full_name;
              const [owner, repoName] = r.full_name.split("/");
              return (
                <label
                  key={r.full_name}
                  className="flex items-center gap-2.5 px-2 py-2 rounded cursor-pointer transition-all"
                  style={{
                    borderLeft: `2px solid ${checked ? "var(--accent)" : "transparent"}`,
                    background: checked ? "var(--accent-dim)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!checked)
                      e.currentTarget.style.background = "var(--bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    if (!checked)
                      e.currentTarget.style.background = "transparent";
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
                    className="shrink-0 w-3.5 h-3.5 rounded-sm flex items-center justify-center transition-all"
                    style={{
                      border: `1px solid ${checked ? "var(--accent)" : "var(--border)"}`,
                      background: checked ? "var(--accent)" : "transparent",
                    }}
                  >
                    {checked && (
                      <span
                        style={{
                          color: "var(--bg)",
                          fontSize: 8,
                          fontWeight: 700,
                          lineHeight: 1,
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  <span
                    className="text-[11px] shrink-0"
                    style={{ color: "var(--text-dim)" }}
                  >
                    {owner}
                  </span>
                  <span className="text-[11px]" style={{ color: "var(--text-dim)" }}>
                    /
                  </span>
                  <span
                    className="text-[11px] truncate flex-1"
                    style={{
                      color: checked ? "var(--text)" : "var(--text-muted)",
                      fontWeight: checked ? 500 : 400,
                    }}
                  >
                    {repoName}
                  </span>
                  {r.private && (
                    <FaLock
                      className="shrink-0"
                      style={{ color: "var(--text-dim)", fontSize: 9, opacity: 0.6 }}
                    />
                  )}
                </label>
              );
            })}
        </div>

        <div
          className="px-4 py-3 flex justify-end gap-2 shrink-0"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-[10px] tracking-wider uppercase transition-opacity hover:opacity-80"
            style={{ color: "var(--text-dim)" }}
          >
            cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
            className="px-4 py-2 text-[10px] font-medium tracking-wider uppercase rounded transition-opacity hover:opacity-90"
            style={{
              background: "var(--accent)",
              color: "var(--bg)",
            }}
          >
            save
          </button>
        </div>
      </div>
    </div>
  );
}
