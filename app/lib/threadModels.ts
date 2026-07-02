const KEY = "piper_thread_models";

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

export function getThreadModel(threadId: string): string | null {
  if (!threadId) return null;
  return readMap()[threadId] ?? null;
}

export function saveThreadModel(threadId: string, modelId: string) {
  if (!threadId || !modelId) return;
  const map = readMap();
  map[threadId] = modelId;
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function removeThreadModel(threadId: string) {
  if (!threadId) return;
  const map = readMap();
  delete map[threadId];
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function clearThreadModels() {
  localStorage.removeItem(KEY);
}
