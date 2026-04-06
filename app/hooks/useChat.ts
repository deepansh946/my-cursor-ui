"use client";

import { useEffect, useRef, useState } from "react";
import { Message, Thread } from "../types";
import { createThread, loadThreads, saveThreads } from "../lib/storage";
import { callApi, deleteThread, fetchThreadMessages } from "../lib/api";

export function useChat() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string>("");
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const messages =
    threads.find((t) => t.id === currentThreadId)?.messages ?? [];

  useEffect(() => {
    const { threads: saved, currentThreadId: id } = loadThreads();
    setThreads(saved);
    setCurrentThreadId(id);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveThreads(threads);
  }, [threads, ready]);

  useEffect(() => {
    if (!ready || !currentThreadId) return;
    let cancelled = false;
    (async () => {
      try {
        const fromCheckpoint = await fetchThreadMessages(currentThreadId);
        if (cancelled) return;
        if (fromCheckpoint.length === 0) return;
        setThreads((prev) =>
          prev.map((t) =>
            t.id === currentThreadId ? { ...t, messages: fromCheckpoint } : t,
          ),
        );
      } catch {
        /* keep localStorage copy */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, currentThreadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const updateMessages = (updater: (prev: Message[]) => Message[]) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === currentThreadId ? { ...t, messages: updater(t.messages) } : t,
      ),
    );
  };

  const handleNewThread = () => {
    const t = createThread();
    setThreads((prev) => [t, ...prev]);
    setCurrentThreadId(t.id);
    localStorage.setItem("piper_current_thread", t.id);
  };

  const handleSelectThread = (id: string) => {
    setCurrentThreadId(id);
    localStorage.setItem("piper_current_thread", id);
  };

  const handleDeleteThread = (id: string) => {
    if (streaming) return;
    void deleteThread(id).catch(() => {});

    const next = threads.filter((t) => t.id !== id);
    if (next.length === 0) {
      const t = createThread();
      setThreads([t]);
      setCurrentThreadId(t.id);
      localStorage.setItem("piper_current_thread", t.id);
      return;
    }
    setThreads(next);
    if (id === currentThreadId) {
      setCurrentThreadId(next[0].id);
      localStorage.setItem("piper_current_thread", next[0].id);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const isFirstMessage = messages.length === 0;
    const humanMsg: Message = {
      id: crypto.randomUUID(),
      type: "HumanMessage",
      content: text,
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== currentThreadId) return t;
        return {
          ...t,
          title: isFirstMessage ? text.slice(0, 40) : t.title,
          messages: [...t.messages, humanMsg],
        };
      }),
    );
    setInput("");

    await callApi({
      text,
      threadId: currentThreadId,
      updateMessages,
      setStreaming,
      onDone: () => textareaRef.current?.focus(),
    });
  };

  const retryMessage = async (text: string, errorMsgId: string) => {
    if (streaming) return;
    updateMessages((prev) => prev.filter((m) => m.id !== errorMsgId));
    await callApi({
      text,
      threadId: currentThreadId,
      updateMessages,
      setStreaming,
      onDone: () => textareaRef.current?.focus(),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return {
    threads,
    currentThreadId,
    messages,
    input,
    setInput,
    streaming,
    bottomRef,
    textareaRef,
    handleNewThread,
    handleSelectThread,
    handleDeleteThread,
    sendMessage,
    retryMessage,
    handleKeyDown,
  };
}
