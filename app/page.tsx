"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadThreads } from "./lib/storage";
import { Spinner } from "./components/ui/Spinner";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const { threads, currentThreadId } = loadThreads();
    if (threads.length === 0) {
      router.replace("/chat");
      return;
    }
    const target = threads.some((t) => t.id === currentThreadId)
      ? currentThreadId
      : threads[0].id;
    router.replace(`/chat/${target}`);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
      <Spinner />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}
