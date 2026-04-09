const KEY = "piper_selected_repos";

export function loadSelectedRepos(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as unknown;
    return Array.isArray(p)
      ? p.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

export function saveSelectedRepos(repos: string[]) {
  localStorage.setItem(KEY, JSON.stringify(repos));
}
