"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChatShell } from "@/app/components/ChatShell";

export default function ChatThreadPage() {
  const params = useParams();
  const router = useRouter();
  const raw = params.threadId;
  const threadId =
    typeof raw === "string" ? raw : Array.isArray(raw) ? (raw[0] ?? "") : "";

  useEffect(() => {
    if (!threadId) router.replace("/");
  }, [threadId, router]);

  if (!threadId) return null;

  return <ChatShell threadIdFromUrl={threadId} />;
}
