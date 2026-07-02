import { Thread } from "../types";

export function threadDisplayTitle(t: Thread): string {
  if (t.title !== "New chat") return t.title;
  if (t.repo) {
    const slug = t.repo.split("/")[1];
    return slug ?? t.repo;
  }
  return "New chat";
}

export function modelShortName(fullName: string): string {
  return fullName.replace(/^Gemini\s+/i, "");
}

export function repoSlug(repo: string | null | undefined): string | null {
  if (!repo) return null;
  return repo.split("/")[1] ?? repo;
}
