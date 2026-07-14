"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChatShell } from "./ChatShell";
import { loadThreads, saveThreads } from "../lib/storage";
import { removeThreadRepo, saveThreadRepo } from "../lib/threadRepos";
import { removeThreadModel } from "../lib/threadModels";
import { removeThreadCloned } from "../lib/threadClone";
import { abortStream, deleteThread } from "../services/chat";

const DEMO_REPO = "deepansh946/piper-demo";

const DEMO_THREAD_ID = "demo";

const DEMO_PROMPTS = [
  "What bugs are present in this codebase?",
  "Fix the bugs in index.js",
  "Add a /health endpoint to the server",
  "Add unit tests for the main functions",
];

function ensureDemoThread() {
  const { threads } = loadThreads();
  if (!threads.some((t) => t.id === DEMO_THREAD_ID)) {
    saveThreads([
      {
        id: DEMO_THREAD_ID,
        title: "Demo",
        createdAt: Date.now(),
        messages: [],
        repo: DEMO_REPO,
      },
      ...threads,
    ]);
  }
  saveThreadRepo(DEMO_THREAD_ID, DEMO_REPO);
}

function clearDemoThread() {
  abortStream();
  void deleteThread(DEMO_THREAD_ID);
  const { threads } = loadThreads();
  saveThreads(threads.filter((t) => t.id !== DEMO_THREAD_ID));
  removeThreadRepo(DEMO_THREAD_ID);
  removeThreadModel(DEMO_THREAD_ID);
  removeThreadCloned(DEMO_THREAD_ID);
  if (localStorage.getItem("piper_current_thread") === DEMO_THREAD_ID) {
    localStorage.removeItem("piper_current_thread");
  }
}

export function DemoShell() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureDemoThread();
    setReady(true);
    return () => {
      clearDemoThread();
    };
  }, []);

  if (!ready) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="shrink-0 border-b border-border bg-surface-raised px-4 py-2 flex items-center justify-between gap-3">
        <p className="text-xs text-foreground-secondary truncate">
          Demo mode — exploring{" "}
          <span className="font-data text-foreground">{DEMO_REPO}</span>
        </p>
        <Link
          href="/login"
          className="text-xs font-medium text-primary hover:underline shrink-0"
        >
          Sign in for your own repos →
        </Link>
      </div>
      <div className="flex-1 min-h-0">
        <ChatShell
          threadIdFromUrl={DEMO_THREAD_ID}
          suggestedPrompts={DEMO_PROMPTS}
          demoRepo={DEMO_REPO}
          className="h-full"
        />
      </div>
    </div>
  );
}
