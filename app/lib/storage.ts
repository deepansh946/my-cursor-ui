import { Thread } from "../types";

export function createThread(): Thread {
  return {
    id: crypto.randomUUID(),
    title: "New chat",
    createdAt: Date.now(),
    messages: [],
  };
}

export function saveThreads(threads: Thread[]) {
  localStorage.setItem("piper_threads", JSON.stringify(threads));
}

export function loadThreads(): { threads: Thread[]; currentThreadId: string } {
  let threads: Thread[] = [];
  try {
    threads = JSON.parse(
      localStorage.getItem("piper_threads") ?? "[]",
    ) as Thread[];
  } catch {}
  if (threads.length === 0) threads = [createThread()];
  const savedId = localStorage.getItem("piper_current_thread") ?? "";
  const currentThreadId =
    savedId && threads.find((t) => t.id === savedId) ? savedId : threads[0].id;
  return { threads, currentThreadId };
}

export function formatDate(ts: number): string {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}
