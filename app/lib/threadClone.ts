const KEY = "piper_thread_cloned";

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

export function getThreadClonedRepo(threadId: string): string | null {
  if (!threadId) return null;
  return readMap()[threadId] ?? null;
}

export function isThreadCloned(threadId: string, repo: string): boolean {
  return getThreadClonedRepo(threadId) === repo;
}

export function markThreadCloned(threadId: string, repo: string) {
  if (!threadId || !repo) return;
  const map = readMap();
  map[threadId] = repo;
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function removeThreadCloned(threadId: string) {
  if (!threadId) return;
  const map = readMap();
  delete map[threadId];
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function clearThreadCloned() {
  localStorage.removeItem(KEY);
}
