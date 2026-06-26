"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Message, Thread } from "../types";
import { createThread, loadThreads, saveThreads } from "../lib/storage";
import { getThreadRepo, removeThreadRepo, saveThreadRepo } from "../lib/threadRepos";
import { callApi, deleteThread, fetchThreadMessages } from "../services/chat";

export function useChat(
  threadIdFromUrl: string | null,
  selectedRepo: string | null,
  reposHydrated: boolean,
) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [threads, setThreads] = useState<Thread[]>(() =>
    typeof window !== "undefined" ? loadThreads().threads : [],
  );
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingMessages, setStreamingMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const threadsForView = useMemo(() => {
    if (!reposHydrated) return threads;
    return threads.map((t) => {
      if (t.repo) return t;
      const stored = getThreadRepo(t.id);
      return stored ? { ...t, repo: stored } : t;
    });
  }, [threads, reposHydrated]);

  const resolveRepo = (threadId: string): string | null => {
    const fromThread = threadsForView.find((t) => t.id === threadId)?.repo;
    return fromThread ?? getThreadRepo(threadId) ?? selectedRepo;
  };

  const currentThread = threadIdFromUrl
    ? threadsForView.find((t) => t.id === threadIdFromUrl)
    : undefined;

  const { data: checkpointMessages } = useQuery({
    queryKey: ["thread-messages", threadIdFromUrl],
    queryFn: () => fetchThreadMessages(threadIdFromUrl!),
    enabled: !!threadIdFromUrl,
    staleTime: 0,
  });

  const messages = streaming
    ? streamingMessages
    : (checkpointMessages ?? []);

  const { mutate: removeThread } = useMutation({
    mutationFn: (id: string) => deleteThread(id),
  });

  const refetchMessages = useCallback(async () => {
    if (!threadIdFromUrl) return;
    await queryClient.refetchQueries({
      queryKey: ["thread-messages", threadIdFromUrl],
    });
  }, [queryClient, threadIdFromUrl]);

  useEffect(() => {
    setStreamingMessages([]);
  }, [threadIdFromUrl]);

  useEffect(() => {
    if (!reposHydrated || !threadIdFromUrl) return;
    localStorage.setItem("piper_current_thread", threadIdFromUrl);
  }, [reposHydrated, threadIdFromUrl]);

  useEffect(() => {
    saveThreads(threads);
  }, [threads]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const updateStreamingMessages = (updater: (prev: Message[]) => Message[]) => {
    setStreamingMessages(updater);
  };

  const bindRepoToThread = (threadId: string, repo: string | null) => {
    if (!repo) return;
    saveThreadRepo(threadId, repo);
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId && !t.repo ? { ...t, repo } : t)),
    );
  };

  const bootstrapRepo = async (threadId: string, repo: string) => {
    saveThreadRepo(threadId, repo);
    const text = "Clone the repository.";
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
              repo: t.repo ?? repo,
              title: t.title === "New chat" ? "Setting up repo…" : t.title,
            }
          : t,
      ),
    );

    setStreamingMessages([...(checkpointMessages ?? []), humanMsg]);

    await callApi({
      text,
      threadId,
      repo,
      updateMessages: updateStreamingMessages,
      setStreaming,
      onStreamEnd: refetchMessages,
    });
  };

  const handleNewThread = (opts?: { pickRepo?: boolean }): string => {
    const t = createThread(null);
    setThreads((prev) => {
      const next = [t, ...prev];
      saveThreads(next);
      return next;
    });
    if (opts?.pickRepo) {
      sessionStorage.setItem("piper_pick_repo", t.id);
    }
    router.replace(`/chat/${t.id}`);
    return t.id;
  };

  const handleSelectThread = (id: string) => {
    router.replace(`/chat/${id}`);
  };

  const handleDeleteThread = (id: string): null => {
    if (streaming) return null;
    removeThread(id);
    removeThreadRepo(id);
    queryClient.removeQueries({ queryKey: ["thread-messages", id] });

    const next = threads.filter((t) => t.id !== id);
    if (next.length === 0) {
      localStorage.removeItem("piper_current_thread");
      setThreads([]);
      router.replace("/chat");
      return null;
    }
    setThreads(next);
    if (id === threadIdFromUrl) {
      router.replace(`/chat/${next[0].id}`);
    }
    return null;
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!threadIdFromUrl || !text || streaming) return;

    const base = checkpointMessages ?? [];
    const isFirstMessage = base.length === 0;
    const humanMsg: Message = {
      id: crypto.randomUUID(),
      type: "HumanMessage",
      content: text,
    };

    setInput("");

    const repoForApi = resolveRepo(threadIdFromUrl);
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadIdFromUrl) return t;
        return {
          ...t,
          repo: t.repo ?? repoForApi,
          title: isFirstMessage ? text.slice(0, 40) : t.title,
        };
      }),
    );

    setStreamingMessages([...base, humanMsg]);

    await callApi({
      text,
      threadId: threadIdFromUrl,
      repo: repoForApi,
      updateMessages: updateStreamingMessages,
      setStreaming,
      onStreamEnd: refetchMessages,
      onDone: () => textareaRef.current?.focus(),
    });
  };

  const retryMessage = async (text: string, errorMsgId: string) => {
    if (!threadIdFromUrl || streaming) return;
    const base = (streaming ? streamingMessages : (checkpointMessages ?? [])).filter(
      (m) => m.id !== errorMsgId,
    );
    setStreamingMessages(base);
    const repoForApi = resolveRepo(threadIdFromUrl);
    await callApi({
      text,
      threadId: threadIdFromUrl,
      repo: repoForApi,
      updateMessages: updateStreamingMessages,
      setStreaming,
      onStreamEnd: refetchMessages,
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
    threads: threadsForView,
    currentThreadId: threadIdFromUrl ?? "",
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
