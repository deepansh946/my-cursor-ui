const KEY = "piper_selected_repos";

export function loadSelectedRepo(): string | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as unknown;
    if (typeof p === "string" && p) return p;
    if (Array.isArray(p)) {
      const first = p.find((x): x is string => typeof x === "string" && !!x);
      return first ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveSelectedRepo(repo: string | null) {
  localStorage.setItem(KEY, JSON.stringify(repo));
}
