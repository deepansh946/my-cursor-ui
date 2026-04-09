"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useChat } from "../hooks/useChat";
import { useSelectedRepos } from "../hooks/useSelectedRepos";
import { Sidebar } from "./Sidebar";
import { ChatMessage } from "./ChatMessage";
import { RepoPicker } from "./RepoPicker";

export function ChatShell({ threadIdFromUrl }: { threadIdFromUrl: string }) {
  const { selectedRepos, setSelectedRepos } = useSelectedRepos();
  const {
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
  } = useChat(threadIdFromUrl, selectedRepos);

  const [repoOpen, setRepoOpen] = useState(false);

  useEffect(() => {
    if (!repoOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRepoOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [repoOpen]);

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--bg)" }}>
      <header className="flex items-center justify-between px-6 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-semibold tracking-[0.25em] uppercase"
            style={{ color: "var(--accent)" }}
          >
            Piper
          </span>
          <span
            className="cursor-blink text-sm font-light"
            style={{ color: "var(--accent)" }}
          >
            _
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setRepoOpen(true)}
            className="text-[10px] tracking-[0.15em] uppercase px-2 py-1 rounded transition-opacity hover:opacity-80"
            style={{
              color: "var(--accent)",
              border: "1px solid var(--border)",
              background: "var(--accent-glow)",
            }}
          >
            repos
            {selectedRepos.length > 0 ? ` (${selectedRepos.length})` : ""}
          </button>
          <span
            className="text-[10px] tracking-[0.2em] uppercase hidden sm:inline"
            style={{ color: "var(--text-dim)" }}
          >
            coding assistant
          </span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-[10px] tracking-wider uppercase opacity-50 hover:opacity-100"
            style={{ color: "var(--text-dim)" }}
          >
            sign out
          </button>
        </div>
      </header>

      <RepoPicker
        open={repoOpen}
        onClose={() => setRepoOpen(false)}
        selected={selectedRepos}
        onSave={setSelectedRepos}
      />

      <div className="flex flex-1 min-h-0">
        <Sidebar
          threads={threads}
          currentThreadId={currentThreadId}
          streaming={streaming}
          onSelect={handleSelectThread}
          onNew={handleNewThread}
          onDelete={handleDeleteThread}
        />

        <div className="flex flex-col flex-1 min-w-0">
          <main className="flex-1 overflow-y-auto py-8 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <p
                  className="text-xs tracking-[0.2em] uppercase"
                  style={{ color: "var(--text-dim)" }}
                >
                  ready
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  ask piper anything about your codebase
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
                <div
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full"
                  style={{
                    background: "var(--bg-muted)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-1.5 rounded-full"
                      style={{
                        background: "var(--accent)",
                        animation: `sage-pulse 1.4s ease-in-out ${i * 220}ms infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </main>

          <footer className="px-6 py-4 shrink-0">
            <div
              className="flex w-full max-w-2xl mx-auto items-end gap-0 rounded-lg overflow-hidden"
              style={{
                border: "1px solid var(--border)",
                background: "var(--bg-subtle)",
              }}
            >
              <span
                className="px-3 py-3 text-sm shrink-0 select-none"
                style={{ color: "var(--text-dim)" }}
              >
                ›
              </span>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="message piper…"
                rows={1}
                disabled={streaming}
                className="flex-1 resize-none bg-transparent py-3 text-sm focus:outline-none disabled:opacity-40 max-h-40 overflow-y-auto placeholder:opacity-30"
                style={
                  {
                    fieldSizing: "content",
                    color: "var(--text)",
                    caretColor: "var(--accent)",
                  } as React.CSSProperties
                }
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || streaming}
                className="shrink-0 px-4 py-3 text-xs font-medium tracking-wider uppercase transition-all disabled:opacity-20"
                style={{
                  color: "var(--accent)",
                  borderLeft: "1px solid var(--border)",
                }}
              >
                send
              </button>
            </div>
            <p
              className="text-center mt-2 text-[10px] tracking-widest"
              style={{ color: "var(--text-dim)" }}
            >
              ↵ send · shift+↵ newline
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
