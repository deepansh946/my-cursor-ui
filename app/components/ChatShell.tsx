"use client";

import { useCallback, useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Menu, PanelRightOpen, Send, Square, X } from "lucide-react";
import { useChat } from "../hooks/useChat";
import { useSelectedRepos } from "../hooks/useSelectedRepos";
import { useSelectedModel } from "../hooks/useSelectedModel";
import { useModels } from "../hooks/useModels";
import { Sidebar } from "./Sidebar";
import { ChatMessage } from "./ChatMessage";
import { Message } from "../types";
import { RepoPicker } from "./RepoPicker";
import { ModelPicker } from "./ModelPicker";
import { RepoFileTree } from "./RepoFileTree";
import { SessionContextBar } from "./SessionContextBar";
import { ChatEmptyState } from "./ChatEmptyState";
import { clearThreadRepos } from "../lib/threadRepos";
import { clearThreadModels } from "../lib/threadModels";
import { clearSelectedModel } from "../lib/selectedModels";
import { isThreadCloned, clearThreadCloned } from "../lib/threadClone";
import { threadDisplayTitle } from "../lib/threadDisplay";
import { loadWorkspaceOpen, saveWorkspaceOpen } from "../lib/workspacePanel";
import { Button } from "./ui/Button";

const PICK_REPO_KEY = "piper_pick_repo";

function lastHumanText(messages: Message[], beforeIndex: number): string | undefined {
  for (let j = beforeIndex - 1; j >= 0; j--) {
    if (messages[j].type === "HumanMessage") return messages[j].content;
  }
  return undefined;
}

function showLabelFor(messages: Message[], i: number): boolean {
  const msg = messages[i];
  if (msg.type === "ToolMessage") return false;
  if (i === 0) return true;
  const prev = messages[i - 1];
  if (msg.type === "HumanMessage") return prev.type !== "HumanMessage";
  return prev.type !== "AIMessage" && prev.type !== "AIMessageChunk";
}

function needsThinkingBubble(messages: Message[], streaming: boolean): boolean {
  if (!streaming) return false;
  const last = messages[messages.length - 1];
  if (!last) return true;
  if (last.type === "HumanMessage") return true;
  if (last.type === "ToolMessage" && !last.content && !last.isError) return false;
  if (last.type === "AIMessage" && last.content.trim()) return false;
  return true;
}

function readPendingPickRepo(threadId: string | null): string | null {
  if (!threadId || typeof window === "undefined") return null;
  return sessionStorage.getItem(PICK_REPO_KEY) === threadId ? threadId : null;
}

export function ChatShell({ threadIdFromUrl }: { threadIdFromUrl: string | null }) {
  const { selectedRepo, setSelectedRepo, reposHydrated } = useSelectedRepos();
  const { selectedModel, setSelectedModel, modelsHydrated } = useSelectedModel();
  const { data: modelsData } = useModels();
  const defaultModelId = modelsData?.default ?? "gemini-2.5-flash";
  const {
    threads,
    currentThreadId,
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
  } = useChat(
    threadIdFromUrl,
    selectedRepo,
    reposHydrated,
    selectedModel,
    modelsHydrated,
    defaultModelId,
  );

  const hasThread = !!threadIdFromUrl;
  const currentThread = hasThread
    ? threads.find((t) => t.id === threadIdFromUrl)
    : undefined;
  const [repoOpen, setRepoOpen] = useState(
    () => readPendingPickRepo(threadIdFromUrl) !== null,
  );
  const [pendingRepoThreadId, setPendingRepoThreadId] = useState<string | null>(
    () => readPendingPickRepo(threadIdFromUrl),
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(true);
  const [workspaceHydrated, setWorkspaceHydrated] = useState(false);

  useEffect(() => {
    setWorkspaceOpen(loadWorkspaceOpen());
    setWorkspaceHydrated(true);
  }, []);

  const toggleWorkspace = useCallback(() => {
    setWorkspaceOpen((prev) => {
      const next = !prev;
      saveWorkspaceOpen(next);
      return next;
    });
  }, []);

  const hasUserMessages = (checkpointMessages ?? []).some(
    (m) => m.type === "HumanMessage",
  );
  const activeModelId = threadIdFromUrl
    ? resolveModel(threadIdFromUrl)
    : (selectedModel ?? defaultModelId);
  const activeModelName =
    modelsData?.models.find((m) => m.id === activeModelId)?.name ?? activeModelId;
  const activeRepo =
    pendingRepoThreadId
      ? selectedRepo
      : (currentThread?.repo ?? selectedRepo);
  const repoLabel = activeRepo ?? "Select repo";

  const handleModelSave = useCallback(
    (modelId: string) => {
      setSelectedModel(modelId);
      if (threadIdFromUrl && !hasUserMessages) {
        bindModelToThread(threadIdFromUrl, modelId);
      }
      setModelOpen(false);
    },
    [threadIdFromUrl, hasUserMessages, setSelectedModel, bindModelToThread],
  );

  const handleModelClose = useCallback(() => {
    setModelOpen(false);
  }, []);

  const handleModelClick = useCallback(() => {
    setModelOpen(true);
  }, []);

  const handleRepoSave = useCallback(
    async (repo: string | null) => {
      const targetId = threadIdFromUrl ?? pendingRepoThreadId;
      if (!targetId) return;

      const hasMessages = (checkpointMessages?.length ?? 0) > 0;
      const alreadyCloned = !!repo && isThreadCloned(targetId, repo);
      const shouldBootstrap =
        !!repo &&
        !alreadyCloned &&
        (!!pendingRepoThreadId ||
          (!currentThread?.repo && !hasMessages));

      sessionStorage.removeItem(PICK_REPO_KEY);
      setSelectedRepo(repo);
      bindRepoToThread(targetId, repo);
      setPendingRepoThreadId(null);
      setRepoOpen(false);

      if (shouldBootstrap && repo) {
        await bootstrapRepo(targetId, repo);
      }
    },
    [
      pendingRepoThreadId,
      threadIdFromUrl,
      currentThread,
      checkpointMessages,
      setSelectedRepo,
      bindRepoToThread,
      bootstrapRepo,
    ],
  );

  const handleRepoClose = useCallback(() => {
    sessionStorage.removeItem(PICK_REPO_KEY);
    setRepoOpen(false);
    setPendingRepoThreadId(null);
  }, []);

  const onNewThread = useCallback(() => {
    handleNewThread({ pickRepo: true });
    setSidebarOpen(false);
  }, [handleNewThread]);

  const onSelectThread = useCallback(
    (id: string) => {
      handleSelectThread(id);
      setSidebarOpen(false);
    },
    [handleSelectThread],
  );

  const onDeleteThread = useCallback(
    (id: string) => {
      handleDeleteThread(id);
    },
    [handleDeleteThread],
  );

  useEffect(() => {
    if (!repoOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleRepoClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [repoOpen, handleRepoClose]);

  useEffect(() => {
    if (!modelOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleModelClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modelOpen, handleModelClose]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("piper_threads");
    localStorage.removeItem("piper_current_thread");
    localStorage.removeItem("piper_selected_repos");
    clearSelectedModel();
    clearThreadRepos();
    clearThreadModels();
    clearThreadCloned();
    sessionStorage.removeItem(PICK_REPO_KEY);
    void signOut({ callbackUrl: "/login" });
  }, []);

  const emptyTitle = currentThread ? threadDisplayTitle(currentThread) : "New chat";

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 shrink-0 border-b border-border">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </Button>
          <span className="text-sm font-semibold tracking-tight text-foreground">Piper</span>
        </div>
        <SessionContextBar
          modelName={activeModelName}
          modelLocked={hasUserMessages}
          repoLabel={repoLabel}
          onModelClick={handleModelClick}
          onRepoClick={() => setRepoOpen(true)}
          onSignOut={handleLogout}
        />
      </header>

      <ModelPicker
        open={modelOpen}
        onClose={handleModelClose}
        selected={activeModelId}
        locked={hasUserMessages}
        onSave={handleModelSave}
      />

      <RepoPicker
        open={repoOpen}
        onClose={handleRepoClose}
        selected={activeRepo}
        onSave={handleRepoSave}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 min-h-0">
        <Sidebar
          threads={threads}
          currentThreadId={currentThreadId}
          streaming={streaming}
          defaultModelId={defaultModelId}
          models={modelsData?.models ?? []}
          onSelect={onSelectThread}
          onNew={onNewThread}
          onDelete={onDeleteThread}
          className={`fixed lg:relative top-[53px] lg:top-auto bottom-0 left-0 z-50 h-auto lg:h-full transition-transform lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        />

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto py-6 space-y-4">
            {!hasThread && (
              <div className="flex items-center justify-center h-full px-8 sm:px-10">
                <p className="text-sm text-muted-foreground">Start a new chat to begin</p>
              </div>
            )}

            {hasThread && !messagesLoading && messages.length === 0 && (
              <ChatEmptyState
                title={emptyTitle}
                modelName={activeModelName}
                repo={currentThread?.repo ?? activeRepo}
                onPickPrompt={setInput}
                onSelectRepo={() => setRepoOpen(true)}
              />
            )}

            {messages.map((msg, i) => (
              <div key={msg.id} className="msg-in">
                <ChatMessage
                  message={msg}
                  onRetry={retryMessage}
                  retryText={lastHumanText(messages, i)}
                  showLabel={showLabelFor(messages, i)}
                  isContinuation={
                    i > 0 && !showLabelFor(messages, i) && msg.type !== "ToolMessage"
                  }
                  isStreaming={
                    streaming &&
                    i === messages.length - 1 &&
                    (msg.type === "AIMessage" ||
                      msg.type === "AIMessageChunk" ||
                      (msg.type === "ToolMessage" && !msg.content && !msg.isError))
                  }
                />
              </div>
            ))}

            {needsThinkingBubble(messages, streaming) && (
              <div className="msg-in">
                <ChatMessage
                  message={{
                    id: "streaming-thinking",
                    type: "AIMessage",
                    content: "",
                  }}
                  isStreaming
                  showLabel={
                    messages.length === 0 ||
                    messages[messages.length - 1]?.type === "HumanMessage"
                  }
                />
              </div>
            )}

            <div ref={bottomRef} />
          </main>

          {hasThread && (
            <footer className="px-8 sm:px-10 py-4 shrink-0 border-t border-border">
              <div className="flex w-full max-w-2xl mx-auto items-end gap-2 rounded-[var(--radius)] border border-border bg-surface p-2 focus-within:border-primary transition-[border-color] duration-150">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message Piper…"
                  rows={1}
                  disabled={streaming}
                  className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm focus:outline-none disabled:opacity-40 max-h-40 overflow-y-auto placeholder:text-foreground-faint"
                  style={
                    {
                      fieldSizing: "content",
                    } as React.CSSProperties
                  }
                />
                <Button
                  size="icon"
                  variant={streaming ? "secondary" : "default"}
                  onClick={streaming ? stopStreaming : sendMessage}
                  disabled={!streaming && !input.trim()}
                  aria-label={streaming ? "Stop generating" : "Send message"}
                >
                  {streaming ? (
                    <Square size={12} fill="currentColor" />
                  ) : (
                    <Send size={14} />
                  )}
                </Button>
              </div>
              <div className="flex w-full max-w-2xl mx-auto mt-2 items-center justify-between gap-2">
                <p className="text-[11px] font-data text-foreground-faint truncate">
                  {activeModelName}
                  {activeRepo && (
                    <>
                      {" · "}
                      {activeRepo}
                    </>
                  )}
                </p>
                <p className="text-xs text-muted-foreground shrink-0">
                  {tokenUsage && (
                    <span className="font-data text-foreground-faint">
                      {" "}
                      · {tokenUsage.input_tokens.toLocaleString()} in ·{" "}
                      {tokenUsage.output_tokens.toLocaleString()} out ·{" "}
                      {tokenUsage.total_tokens.toLocaleString()} total
                    </span>
                  )}
                </p>
              </div>
            </footer>
          )}
        </div>

        {currentThread?.repo && workspaceHydrated && (
          <>
            {workspaceOpen ? (
              <RepoFileTree
                activeRepo={currentThread.repo}
                threadId={threadIdFromUrl}
                streaming={streaming}
                className="hidden lg:flex"
                onCollapse={toggleWorkspace}
              />
            ) : (
              <div className="hidden lg:flex shrink-0 border-l border-border bg-surface">
                <Button
                  variant="ghost"
                  size="icon"
                  className="m-1 h-8 w-8"
                  onClick={toggleWorkspace}
                  aria-label="Open workspace"
                >
                  <PanelRightOpen size={16} className="text-muted-foreground" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
