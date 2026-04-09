"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type RepoRow = {
  full_name: string;
  name: string;
  private: boolean;
  default_branch: string;
};

export function RepoPicker({
  open,
  onClose,
  selected,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  selected: string[];
  onSave: (fullNames: string[]) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<RepoRow[]>([]);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setDraft(new Set(selected));
    setQuery("");
    setError(null);
    setLoading(true);
    (async () => {
      try {
        const res = await fetch("/api/github/repos");
        if (!res.ok) {
          let msg = res.statusText;
          try {
            const j = (await res.json()) as { error?: string };
            if (typeof j.error === "string") msg = j.error;
          } catch {
            /* ignore */
          }
          setError(msg);
          setList([]);
          return;
        }
        const data = (await res.json()) as { repos?: RepoRow[] };
        setList(data.repos ?? []);
      } catch {
        setError("Failed to load repositories");
        setList([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, selected]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) => r.full_name.toLowerCase().includes(q));
  }, [list, query]);

  const toggle = useCallback((full: string) => {
    setDraft((prev) => {
      const n = new Set(prev);
      if (n.has(full)) n.delete(full);
      else n.add(full);
      return n;
    });
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Select repositories"
    >
      <div
        className="w-full max-w-lg max-h-[min(80vh,520px)] flex flex-col rounded-lg overflow-hidden"
        style={{
          border: "1px solid var(--border)",
          background: "var(--bg-subtle)",
        }}
      >
        <div
          className="px-4 py-3 flex items-center justify-between shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <span
            className="text-[10px] tracking-[0.2em] uppercase"
            style={{ color: "var(--text-dim)" }}
          >
            repositories
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-2 py-1 rounded opacity-70 hover:opacity-100"
            style={{ color: "var(--text-muted)" }}
          >
            esc
          </button>
        </div>
        <div className="px-4 py-2 shrink-0">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="filter…"
            className="w-full px-3 py-2 text-xs rounded-md focus:outline-none"
            style={{
              border: "1px solid var(--border)",
              background: "var(--bg-muted)",
              color: "var(--text)",
            }}
          />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-2 py-1">
          {loading && (
            <p className="text-xs px-2 py-4" style={{ color: "var(--text-dim)" }}>
              loading…
            </p>
          )}
          {error && !loading && (
            <p className="text-xs px-2 py-4" style={{ color: "var(--error)" }}>
              {typeof error === "string" ? error : "Could not load repos"}
            </p>
          )}
          {!loading &&
            !error &&
            filtered.map((r) => (
              <label
                key={r.full_name}
                className="flex items-center gap-2 px-2 py-2 rounded cursor-pointer hover:opacity-90"
                style={{ color: "var(--text-muted)" }}
              >
                <input
                  type="checkbox"
                  checked={draft.has(r.full_name)}
                  onChange={() => toggle(r.full_name)}
                  className="rounded border shrink-0"
                  style={{ borderColor: "var(--border)" }}
                />
                <span className="text-xs truncate flex-1">{r.full_name}</span>
                {r.private && (
                  <span className="text-[10px] shrink-0 opacity-50">private</span>
                )}
              </label>
            ))}
        </div>
        <div
          className="px-4 py-3 flex justify-end gap-2 shrink-0"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-[10px] tracking-wider uppercase"
            style={{ color: "var(--text-dim)" }}
          >
            cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSave([...draft]);
              onClose();
            }}
            className="px-4 py-2 text-[10px] font-medium tracking-wider uppercase rounded"
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
