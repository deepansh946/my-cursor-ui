"use client";

import { useEffect, useState } from "react";
import { FaCopy, FaCheck } from "react-icons/fa";
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
    <div className="my-2 rounded-lg overflow-hidden border border-zinc-700 text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-800 border-b border-zinc-700">
        <span className="text-zinc-400 font-mono">{lang || "text"}</span>
        <button
          onClick={copy}
          className="text-zinc-400 hover:text-zinc-100 transition-colors text-[11px]"
        >
          {copied ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
        </button>
      </div>
      {html ? (
        <div
          className="[&>pre]:p-4 [&>pre]:overflow-x-auto [&>pre]:m-0 [&>pre]:rounded-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="p-4 bg-zinc-900 text-zinc-300 overflow-x-auto">{code}</pre>
      )}
    </div>
  );
}
