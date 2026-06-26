const KEY = "piper_thread_repos";

function readMap(): Record<string, string> {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "{}") as unknown;
    if (!raw || typeof raw !== "object") return {};
    return Object.fromEntries(
      Object.entries(raw as Record<string, unknown>).filter(
        (entry): entry is [string, string] =>
          typeof entry[0] === "string" && typeof entry[1] === "string" && !!entry[1],
      ),
    );
  } catch {
    return {};
  }
}

export function getThreadRepo(threadId: string): string | null {
  if (!threadId) return null;
  return readMap()[threadId] ?? null;
}

export function saveThreadRepo(threadId: string, repo: string) {
  if (!threadId || !repo) return;
  const map = readMap();
  map[threadId] = repo;
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function removeThreadRepo(threadId: string) {
  if (!threadId) return;
  const map = readMap();
  delete map[threadId];
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function clearThreadRepos() {
  localStorage.removeItem(KEY);
}
