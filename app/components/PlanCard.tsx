"use client";

import { parseContent } from "../lib/parseContent";
import { stripWorkspacePathInText } from "../lib/displayPath";
import { CodeBlock } from "./CodeBlock";
import { Button } from "./ui/Button";

export function PlanCard({
  content,
  onApply,
}: {
  content: string;
  onApply?: () => void;
}) {
  const displayContent = stripWorkspacePathInText(content);

  return (
    <div className="w-full max-w-2xl mx-auto px-8 sm:px-10 pb-2">
      <div className="rounded-[var(--radius)] border border-primary/30 bg-surface overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-raised">
          <span className="text-xs font-medium text-primary uppercase tracking-wide">
            Plan
          </span>
        </div>
        <div className="px-4 py-3 text-sm leading-relaxed text-foreground">
          {parseContent(displayContent).map((seg, i) =>
            seg.kind === "code" ? (
              <CodeBlock key={i} lang={seg.lang} code={seg.code} />
            ) : (
              <div
                key={i}
                className="markdown"
                dangerouslySetInnerHTML={{ __html: seg.html }}
              />
            ),
          )}
        </div>
        {onApply && (
          <div className="flex gap-2 px-4 py-3 border-t border-border">
            <Button size="sm" onClick={onApply}>
              Apply Plan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
