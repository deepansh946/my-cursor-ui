"use client";

import { useChat } from "./hooks/useChat";
import { Sidebar } from "./components/Sidebar";
import { ChatMessage } from "./components/ChatMessage";

export default function Home() {
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
    sendMessage,
    retryMessage,
    handleKeyDown,
  } = useChat();

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950">
      <Sidebar
        threads={threads}
        currentThreadId={currentThreadId}
        onSelect={handleSelectThread}
        onNew={handleNewThread}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
          <div className="size-8 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
            <span className="text-xs font-bold text-white dark:text-zinc-900">
              P
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Piper
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Coding assistant
            </p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto py-6 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-400 dark:text-zinc-600">
              <p className="text-sm">Ask Piper anything about your codebase.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onRetry={retryMessage}
              isStreaming={streaming && i === messages.length - 1}
            />
          ))}
          {streaming && (
            <div className="flex w-full max-w-2xl mx-auto px-4 justify-start">
              <div className="flex gap-1 px-4 py-3 rounded-2xl rounded-bl-sm bg-zinc-100 dark:bg-zinc-800">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </main>

        <footer className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-4">
          <div className="flex w-full max-w-2xl mx-auto items-end gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Piper… (Enter to send, Shift+Enter for newline)"
              rows={1}
              disabled={streaming}
              className="flex-1 resize-none rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50 max-h-40 overflow-y-auto"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || streaming}
              className="shrink-0 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-4 py-3 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
