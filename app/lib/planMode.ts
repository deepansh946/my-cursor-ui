const KEY = "piper_plan_mode";

export function loadPlanMode(): boolean {
  try {
    return localStorage.getItem(KEY) === "true";
  } catch {
    return false;
  }
}

export function savePlanMode(v: boolean) {
  localStorage.setItem(KEY, String(v));
}
