"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { codeToHtml } from "shiki";

export function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [html, setHtml] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    codeToHtml(code, {
      lang: lang || "text",
      theme: "github-dark",
    })
      .then(setHtml)
      .catch(() => setHtml(`<pre>${code}</pre>`));
  }, [code, lang]);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 rounded-[var(--radius)] border border-border bg-surface overflow-hidden text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-surface-raised">
        <span className="font-data text-xs text-muted-foreground">{lang || "text"}</span>
        <button
          type="button"
          onClick={copy}
          className="text-primary hover:text-[var(--primary-hover)] transition-colors"
          aria-label="Copy code"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      </div>
      {html ? (
        <div
          className="bg-surface-raised [&>pre]:p-3 [&>pre]:overflow-x-auto [&>pre]:m-0 [&>pre]:rounded-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="font-data p-3 bg-surface-raised text-foreground-secondary overflow-x-auto">
          {code}
        </pre>
      )}
    </div>
  );
}
