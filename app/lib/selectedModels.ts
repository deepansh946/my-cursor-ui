const KEY = "piper_selected_model";

export function loadSelectedModel(): string | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const id = JSON.parse(raw) as unknown;
    return typeof id === "string" && id ? id : null;
  } catch {
    return null;
  }
}

export function saveSelectedModel(modelId: string | null) {
  localStorage.setItem(KEY, JSON.stringify(modelId));
}

export function clearSelectedModel() {
  localStorage.removeItem(KEY);
}
