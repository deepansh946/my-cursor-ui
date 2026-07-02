const KEY = "piper_workspace_open";

export function loadWorkspaceOpen(): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return true;
    return raw === "true";
  } catch {
    return true;
  }
}

export function saveWorkspaceOpen(open: boolean) {
  localStorage.setItem(KEY, String(open));
}
