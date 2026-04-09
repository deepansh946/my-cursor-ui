"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createThread, loadThreads, saveThreads } from "./lib/storage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const { threads, currentThreadId } = loadThreads();
    const has = threads.some((t) => t.id === currentThreadId);
    if (!has) {
      const t = createThread();
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
