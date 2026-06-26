"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Message, Thread } from "../types";
import { createThread, loadThreads, saveThreads } from "../lib/storage";
import { callApi, deleteThread, fetchThreadMessages } from "../services/chat";

export function useChat(
  threadIdFromUrl: string,
  selectedRepo: string | null,
  reposHydrated: boolean,
) {
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentThread = threads.find((t) => t.id === threadIdFromUrl);
  const messages = currentThread?.messages ?? [];

  const { data: checkpointMessages } = useQuery({
    queryKey: ["thread-messages", threadIdFromUrl],
    queryFn: () => fetchThreadMessages(threadIdFromUrl),
    enabled: ready && !!threadIdFromUrl,
    staleTime: 0,
  });

  const { mutate: removeThread } = useMutation({
    mutationFn: (id: string) => deleteThread(id),
  });

  useEffect(() => {
    const { threads: saved } = loadThreads();
    setThreads(saved);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !reposHydrated || !threadIdFromUrl) return;
    localStorage.setItem("piper_current_thread", threadIdFromUrl);
    setThreads((prev) => {
      const existing = prev.find((t) => t.id === threadIdFromUrl);
      if (existing) return prev;
      return [
        ...prev,
        { ...createThread(null), id: threadIdFromUrl },
      ];
    });
  }, [ready, reposHydrated, threadIdFromUrl]);

  useEffect(() => {
    if (!ready) return;
    saveThreads(threads);
  }, [threads, ready]);

  const hydratedCheckpointRef = useRef<string | null>(null);

  useEffect(() => {
    hydratedCheckpointRef.current = null;
  }, [threadIdFromUrl]);

  useEffect(() => {
    if (!checkpointMessages?.length) return;
    if (hydratedCheckpointRef.current === threadIdFromUrl) return;
    hydratedCheckpointRef.current = threadIdFromUrl;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadIdFromUrl ? { ...t, messages: checkpointMessages } : t,
      ),
    );
  }, [checkpointMessages, threadIdFromUrl]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const updateMessages = (updater: (prev: Message[]) => Message[]) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadIdFromUrl ? { ...t, messages: updater(t.messages) } : t,
      ),
    );
  };

  const bindRepoToThread = (threadId: string, repo: string | null) => {
    if (!repo) return;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId && !t.repo && t.messages.length === 0
          ? { ...t, repo }
          : t,
      ),
    );
  };

  const bootstrapRepo = async (threadId: string, repo: string) => {
    const text =
      "Clone the repository.";
    const humanMsg: Message = {
      id: crypto.randomUUID(),
      type: "HumanMessage",
      content: text,
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              title: t.title === "New chat" ? "Setting up repo…" : t.title,
              messages: [...t.messages, humanMsg],
            }
          : t,
      ),
    );

    const updateMessagesForThread = (updater: (prev: Message[]) => Message[]) => {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, messages: updater(t.messages) } : t,
        ),
      );
    };

    await callApi({
      text,
      threadId,
      repo,
      updateMessages: updateMessagesForThread,
      setStreaming,
    });
  };

  const handleNewThread = (): string => {
    const t = createThread(null);
    setThreads((prev) => [t, ...prev]);
    router.replace(`/chat/${t.id}`);
    return t.id;
  };

  const handleSelectThread = (id: string) => {
    router.replace(`/chat/${id}`);
  };

  const handleDeleteThread = (id: string): string | null => {
    if (streaming) return null;
    removeThread(id);

    const next = threads.filter((t) => t.id !== id);
    if (next.length === 0) {
      const t = createThread(null);
      setThreads([t]);
      router.replace(`/chat/${t.id}`);
      return t.id;
    }
    setThreads(next);
    if (id === threadIdFromUrl) {
      router.replace(`/chat/${next[0].id}`);
    }
    return null;
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

    setInput("");

    let repoForApi: string | null = null;
    setThreads((prev) => {
      const thread = prev.find((t) => t.id === threadIdFromUrl);
      repoForApi = thread?.repo ?? selectedRepo;
      return prev.map((t) => {
        if (t.id !== threadIdFromUrl) return t;
        return {
          ...t,
          title: isFirstMessage ? text.slice(0, 40) : t.title,
          messages: [...t.messages, humanMsg],
        };
      });
    });

    await callApi({
      text,
      threadId: threadIdFromUrl,
      repo: repoForApi,
      updateMessages,
      setStreaming,
      onDone: () => textareaRef.current?.focus(),
    });
  };

  const retryMessage = async (text: string, errorMsgId: string) => {
    if (streaming) return;
    updateMessages((prev) => prev.filter((m) => m.id !== errorMsgId));
    const repoForApi =
      threads.find((t) => t.id === threadIdFromUrl)?.repo ?? selectedRepo;
    await callApi({
      text,
      threadId: threadIdFromUrl,
      repo: repoForApi,
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
    currentThreadId: threadIdFromUrl,
    messages,
    input,
    setInput,
    streaming,
    bottomRef,
    textareaRef,
    handleNewThread,
    handleSelectThread,
    handleDeleteThread,
    bindRepoToThread,
    bootstrapRepo,
    sendMessage,
    retryMessage,
    handleKeyDown,
  };
}
