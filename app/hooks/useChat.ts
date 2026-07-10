"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Message, Thread, TokenUsage } from "../types";
import { createThread, loadThreads, saveThreads } from "../lib/storage";
import { getThreadRepo, removeThreadRepo, saveThreadRepo } from "../lib/threadRepos";
import { getThreadModel, removeThreadModel, saveThreadModel } from "../lib/threadModels";
import {
  isThreadCloned,
  markThreadCloned,
  removeThreadCloned,
} from "../lib/threadClone";
import { callApi, cloneRepo, deleteThread, fetchThreadMessages, abortStream } from "../services/chat";

export function useChat(
  threadIdFromUrl: string | null,
  selectedRepo: string | null,
  reposHydrated: boolean,
  selectedModel: string | null,
  modelsHydrated: boolean,
  defaultModelId: string,
) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [threads, setThreads] = useState<Thread[]>(() =>
    typeof window !== "undefined" ? loadThreads().threads : [],
  );
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingMessages, setStreamingMessages] = useState<Message[]>([]);
  const [usageByThread, setUsageByThread] = useState<Record<string, TokenUsage>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const streamingMessagesRef = useRef<Message[]>([]);

  const threadsForView = useMemo(() => {
    if (!reposHydrated && !modelsHydrated) return threads;
    return threads.map((t) => {
      let next = t;
      if (reposHydrated && !t.repo) {
        const storedRepo = getThreadRepo(t.id);
        if (storedRepo) next = { ...next, repo: storedRepo };
      }
      if (modelsHydrated && !t.model) {
        const storedModel = getThreadModel(t.id);
        if (storedModel) next = { ...next, model: storedModel };
      }
      return next;
    });
  }, [threads, reposHydrated, modelsHydrated]);

  const resolveRepo = (threadId: string): string | null => {
    const fromThread = threadsForView.find((t) => t.id === threadId)?.repo;
    return fromThread ?? getThreadRepo(threadId) ?? selectedRepo;
  };

  const resolveModel = (threadId: string): string => {
    const fromThread = threadsForView.find((t) => t.id === threadId)?.model;
    return (
      fromThread ??
      getThreadModel(threadId) ??
      selectedModel ??
      defaultModelId
    );
  };

  const currentThread = threadIdFromUrl
    ? threadsForView.find((t) => t.id === threadIdFromUrl)
    : undefined;

  const { data: checkpointMessages, isLoading: messagesLoading } = useQuery({
    queryKey: ["thread-messages", threadIdFromUrl],
    queryFn: () => fetchThreadMessages(threadIdFromUrl!),
    enabled: !!threadIdFromUrl,
    staleTime: 0,
    placeholderData: (prev) => prev,
  });

  const messages = streaming ? streamingMessages : (checkpointMessages ?? []);
  const tokenUsage = threadIdFromUrl ? usageByThread[threadIdFromUrl] : undefined;

  const handleUsage = useCallback((threadId: string, usage: TokenUsage) => {
    setUsageByThread((prev) => ({ ...prev, [threadId]: usage }));
  }, []);

  const { mutate: removeThread } = useMutation({
    mutationFn: (id: string) => deleteThread(id),
  });

  const refetchMessages = useCallback(async () => {
    if (!threadIdFromUrl) return;
    await queryClient.refetchQueries({
      queryKey: ["thread-messages", threadIdFromUrl],
    });
  }, [queryClient, threadIdFromUrl]);

  const handleStreamEnd = useCallback(async () => {
    const errors = streamingMessagesRef.current.filter((m) => m.isError);
    await refetchMessages();
    if (errors.length > 0 && threadIdFromUrl) {
      queryClient.setQueryData<Message[]>(
        ["thread-messages", threadIdFromUrl],
        (old) => {
          const base = old ?? [];
          const toAdd = errors.filter(
            (e) => !base.some((b) => b.isError && b.content === e.content),
          );
          return toAdd.length > 0 ? [...base, ...toAdd] : base;
        },
      );
    }
    setStreamingMessages([]);
  }, [refetchMessages, threadIdFromUrl, queryClient]);

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
    setStreamingMessages((prev) => {
      const next = updater(prev);
      streamingMessagesRef.current = next;
      return next;
    });
  };

  const bindRepoToThread = (threadId: string, repo: string | null) => {
    if (!repo) return;
    saveThreadRepo(threadId, repo);
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId && !t.repo ? { ...t, repo } : t)),
    );
  };

  const bindModelToThread = (threadId: string, modelId: string) => {
    if (!modelId) return;
    saveThreadModel(threadId, modelId);
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, model: modelId } : t)),
    );
  };

  const bootstrapRepo = async (threadId: string, repo: string) => {
    if (threadIdFromUrl && threadId !== threadIdFromUrl) return;

    saveThreadRepo(threadId, repo);
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, repo: t.repo ?? repo } : t,
      ),
    );

    const cloneId = crypto.randomUUID();
    setStreamingMessages([
      ...(checkpointMessages ?? []),
      {
        id: cloneId,
        type: "ToolMessage",
        content: "",
        toolName: "clone_repo",
      },
    ]);
    setStreaming(true);

    let failed = false;
    try {
      await cloneRepo(threadId, repo);
      markThreadCloned(threadId, repo);
    } catch (err) {
      failed = true;
      setStreamingMessages((prev) => [
        ...prev.filter((m) => m.id !== cloneId),
        {
          id: crypto.randomUUID(),
          type: "AIMessage",
          content: `Error: ${err instanceof Error ? err.message : "Clone failed"}`,
          isError: true,
        },
      ]);
    } finally {
      setStreaming(false);
      if (!failed) setStreamingMessages([]);
    }
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
    removeThreadModel(id);
    removeThreadCloned(id);
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
    const modelForApi = resolveModel(threadIdFromUrl);
    if (isFirstMessage) {
      bindModelToThread(threadIdFromUrl, modelForApi);
    }
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadIdFromUrl) return t;
        return {
          ...t,
          repo: t.repo ?? repoForApi,
          model: t.model ?? modelForApi,
          title: isFirstMessage ? text.slice(0, 40) : t.title,
        };
      }),
    );

    setStreamingMessages([...base, humanMsg]);

    await callApi({
      text,
      threadId: threadIdFromUrl,
      repo: repoForApi,
      modelId: modelForApi,
      updateMessages: updateStreamingMessages,
      setStreaming,
      onUsage: (usage) => handleUsage(threadIdFromUrl, usage),
      onStreamEnd: handleStreamEnd,
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
    const modelForApi = resolveModel(threadIdFromUrl);
    await callApi({
      text,
      threadId: threadIdFromUrl,
      repo: repoForApi,
      modelId: modelForApi,
      updateMessages: updateStreamingMessages,
      setStreaming,
      onUsage: (usage) => handleUsage(threadIdFromUrl, usage),
      onStreamEnd: handleStreamEnd,
      onDone: () => textareaRef.current?.focus(),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const stopStreaming = useCallback(() => {
    abortStream();
  }, []);

  return {
    threads: threadsForView,
    currentThreadId: threadIdFromUrl ?? "",
    messages,
    messagesLoading,
    checkpointMessages,
    input,
    setInput,
    streaming,
    tokenUsage,
    bottomRef,
    textareaRef,
    handleNewThread,
    handleSelectThread,
    handleDeleteThread,
    bindRepoToThread,
    bindModelToThread,
    bootstrapRepo,
    resolveModel,
    sendMessage,
    retryMessage,
    stopStreaming,
    handleKeyDown,
  };
}
