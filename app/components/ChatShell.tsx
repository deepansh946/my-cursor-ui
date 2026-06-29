"use client";

import { useCallback, useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Menu, X, Send } from "lucide-react";
import { useChat } from "../hooks/useChat";
import { useSelectedRepos } from "../hooks/useSelectedRepos";
import { Sidebar } from "./Sidebar";
import { ChatMessage } from "./ChatMessage";
import { RepoPicker } from "./RepoPicker";
import { RepoFileTree } from "./RepoFileTree";
import { clearThreadRepos } from "../lib/threadRepos";
import { Button } from "./ui/Button";
import { Spinner } from "./ui/Spinner";

const PICK_REPO_KEY = "piper_pick_repo";

function readPendingPickRepo(threadId: string | null): string | null {
  if (!threadId || typeof window === "undefined") return null;
  return sessionStorage.getItem(PICK_REPO_KEY) === threadId ? threadId : null;
}

export function ChatShell({ threadIdFromUrl }: { threadIdFromUrl: string | null }) {
  const { selectedRepo, setSelectedRepo, reposHydrated } = useSelectedRepos();
  const {
    threads,
    currentThreadId,
    messages,
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
    bootstrapRepo,
    sendMessage,
    retryMessage,
    handleKeyDown,
  } = useChat(threadIdFromUrl, selectedRepo, reposHydrated);

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

  const handleRepoSave = useCallback(
    (repo: string | null) => {
      const targetId = pendingRepoThreadId ?? threadIdFromUrl;
      if (!targetId) return;

      const shouldBootstrap =
        !!repo &&
        (!!pendingRepoThreadId ||
          (!currentThread?.repo && currentThread?.messages.length === 0));

      sessionStorage.removeItem(PICK_REPO_KEY);
      setSelectedRepo(repo);
      bindRepoToThread(targetId, repo);
      setPendingRepoThreadId(null);
      setRepoOpen(false);

      if (shouldBootstrap && repo) {
        void bootstrapRepo(targetId, repo);
      }
    },
    [
      pendingRepoThreadId,
      threadIdFromUrl,
      currentThread,
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

  const handleLogout = useCallback(() => {
    localStorage.removeItem("piper_threads");
    localStorage.removeItem("piper_current_thread");
    localStorage.removeItem("piper_selected_repos");
    clearThreadRepos();
    sessionStorage.removeItem(PICK_REPO_KEY);
    void signOut({ callbackUrl: "/login" });
  }, []);

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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setRepoOpen(true)}>
            Repos
            {selectedRepo && (
              <span className="size-1.5 rounded-full bg-primary shrink-0" />
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </header>

      <RepoPicker
        open={repoOpen}
        onClose={handleRepoClose}
        selected={
          pendingRepoThreadId
            ? selectedRepo
            : (currentThread?.repo ?? selectedRepo)
        }
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
          onSelect={onSelectThread}
          onNew={onNewThread}
          onDelete={onDeleteThread}
          className={`fixed lg:relative top-[53px] lg:top-auto bottom-0 left-0 z-50 h-auto lg:h-full transition-transform lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        />

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {currentThread?.repo && (
            <div className="px-4 sm:px-6 py-2 shrink-0 border-b border-border bg-surface truncate">
              <span className="font-data text-xs text-muted-foreground">{currentThread.repo}</span>
            </div>
          )}
          <main className="flex-1 overflow-y-auto py-6 space-y-4">
            {!hasThread && (
              <div className="flex items-center justify-center h-full px-6">
                <p className="text-sm text-muted-foreground">Start a new chat to begin</p>
              </div>
            )}

            {hasThread && messages.length === 0 && (
              <div className="flex items-center justify-center h-full px-6">
                <p className="text-sm text-muted-foreground">
                  Ask Piper anything about your codebase
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={msg.id} className="msg-in">
                <ChatMessage
                  message={msg}
                  onRetry={retryMessage}
                  isStreaming={streaming && i === messages.length - 1}
                />
              </div>
            ))}

            {streaming && (
              <div className="flex w-full max-w-2xl mx-auto px-6">
                <Spinner />
              </div>
            )}

            <div ref={bottomRef} />
          </main>

          {hasThread && (
            <footer className="px-4 sm:px-6 py-4 shrink-0 border-t border-border">
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
                  onClick={sendMessage}
                  disabled={!input.trim() || streaming}
                  aria-label="Send message"
                >
                  <Send size={14} />
                </Button>
              </div>
              <p className="text-center mt-2 text-xs text-muted-foreground">
                Enter to send · Shift+Enter for newline
                {tokenUsage && (
                  <span className="font-data text-foreground-faint">
                    {" "}
                    · {tokenUsage.input_tokens.toLocaleString()} in ·{" "}
                    {tokenUsage.output_tokens.toLocaleString()} out ·{" "}
                    {tokenUsage.total_tokens.toLocaleString()} total
                  </span>
                )}
              </p>
            </footer>
          )}
        </div>

        {currentThread?.repo && (
          <RepoFileTree activeRepo={currentThread.repo} className="hidden lg:flex" />
        )}
      </div>
    </div>
  );
}
