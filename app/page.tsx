"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createThread, loadThreads, saveThreads } from "./lib/storage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    let hadStoredThreads = false;
    try {
      const raw = localStorage.getItem("piper_threads");
      hadStoredThreads = !!(raw && (JSON.parse(raw) as unknown[]).length > 0);
    } catch {}

    const { threads, currentThreadId } = loadThreads();
    const has = threads.some((t) => t.id === currentThreadId);

    if (!hadStoredThreads) {
      sessionStorage.setItem("piper_pick_repo", currentThreadId);
      router.replace(`/chat/${currentThreadId}`);
      return;
    }

    if (!has) {
      const t = createThread(null);
      sessionStorage.setItem("piper_pick_repo", t.id);
      saveThreads([t, ...threads]);
      router.replace(`/chat/${t.id}`);
      return;
    }
    router.replace(`/chat/${currentThreadId}`);
  }, [router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--bg)", color: "var(--text-dim)" }}
    >
      <p className="text-xs tracking-widest uppercase">loading</p>
    </div>
  );
}
