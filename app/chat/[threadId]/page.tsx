"use client";

import { useLayoutEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChatShell } from "@/app/components/ChatShell";
import { loadThreads } from "@/app/lib/storage";

export default function ChatThreadPage() {
  const params = useParams();
  const router = useRouter();
  const raw = params.threadId;
  const threadId =
    typeof raw === "string" ? raw : Array.isArray(raw) ? (raw[0] ?? "") : "";

  useLayoutEffect(() => {
    if (!threadId) {
      router.replace("/chat");
      return;
    }
    const { threads } = loadThreads();
    if (!threads.some((t) => t.id === threadId)) {
      router.replace("/chat");
    }
  }, [threadId, router]);

  if (!threadId) return null;

  return <ChatShell key={threadId} threadIdFromUrl={threadId} />;
}
