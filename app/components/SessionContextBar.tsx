"use client";

import { ChevronDown, Lock } from "lucide-react";
import { Button } from "./ui/Button";

function ContextPill({
  label,
  locked,
  onClick,
}: {
  label: string;
  locked?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 max-w-[200px] sm:max-w-[240px] h-7 px-2.5 rounded-[var(--radius)] border border-border bg-surface-raised text-xs transition-[background,border-color] duration-150 hover:bg-[var(--surface)] hover:border-[rgba(255,255,255,0.12)] ${
        locked ? "opacity-80" : ""
      }`}
    >
      {locked && <Lock size={11} className="shrink-0 text-muted-foreground" />}
      <span className="truncate font-data text-foreground-secondary">{label}</span>
      <ChevronDown size={12} className="shrink-0 text-muted-foreground" />
    </button>
  );
}

export function SessionContextBar({
  modelName,
  modelLocked,
  repoLabel,
  onModelClick,
  onRepoClick,
  onSignOut,
}: {
  modelName: string;
  modelLocked: boolean;
  repoLabel: string;
  onModelClick: () => void;
  onRepoClick?: () => void;
  onSignOut?: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <ContextPill label={modelName} locked={modelLocked} onClick={onModelClick} />
      {onRepoClick && (
        <ContextPill label={repoLabel} onClick={onRepoClick} />
      )}
      {onSignOut && (
        <Button variant="ghost" size="sm" onClick={onSignOut}>
          Sign out
        </Button>
      )}
    </div>
  );
}
