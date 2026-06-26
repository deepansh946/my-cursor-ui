import { Thread } from "../types";

export function createThread(repo: string | null = null): Thread {
  return {
    id: crypto.randomUUID(),
    title: "New chat",
    createdAt: Date.now(),
    messages: [],
    repo,
  };
}

function toStoredThread(t: Thread): Thread {
  return {
    id: t.id,
    title: t.title,
    createdAt: t.createdAt,
    repo: t.repo ?? null,
    messages: [],
  };
}

export function saveThreads(threads: Thread[]) {
  localStorage.setItem(
    "piper_threads",
    JSON.stringify(threads.map(toStoredThread)),
  );
}

export function loadThreads(): { threads: Thread[]; currentThreadId: string } {
  let threads: Thread[] = [];
  try {
    const raw = JSON.parse(
      localStorage.getItem("piper_threads") ?? "[]",
    ) as Thread[];
    threads = raw.map((t) => ({
      id: t.id,
      title: t.title,
      createdAt: t.createdAt,
      repo: t.repo ?? null,
      messages: [],
    }));
  } catch {}
  const savedId = localStorage.getItem("piper_current_thread") ?? "";
  const currentThreadId =
    savedId && threads.some((t) => t.id === savedId) ? savedId : "";
  return { threads, currentThreadId };
}

export function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
