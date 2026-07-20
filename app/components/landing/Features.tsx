"use client";

import { ListTree, MessageSquare, Search, GitPullRequest } from "lucide-react";
import { BentoGrid, BentoGridItem } from "../ui/bento-grid";

function PlanMock() {
  return (
    <div className="flex h-full min-h-[7.5rem] flex-col overflow-hidden rounded-[var(--radius)] border border-primary/30 bg-background">
      <div className="border-b border-border bg-surface-raised px-3 py-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wide text-primary">
          Plan
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 px-3 py-2 font-data text-[10px] text-foreground-faint">
        <p className="text-foreground-secondary">auth/session.ts</p>
        <p>· Add refresh-token rotation</p>
        <p>· Invalidate old tokens on reuse</p>
        <p className="mt-auto text-primary">Ready to apply.</p>
      </div>
    </div>
  );
}

function ChoiceMock() {
  return (
    <div className="flex h-full min-h-[7.5rem] flex-col overflow-hidden rounded-[var(--radius)] border border-primary/30 bg-background">
      <div className="border-b border-border bg-surface-raised px-3 py-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wide text-primary">
          Your choice
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-3 py-2">
        <p className="text-[11px] text-foreground-secondary">
          Rate-limit store?
        </p>
        <div className="flex items-start gap-2 rounded-[var(--radius-sm)] border border-border bg-surface-raised px-2 py-1.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-primary/15 text-[10px] font-semibold text-primary">
            A
          </span>
          <span className="text-[10px] text-foreground">Redis</span>
        </div>
        <div className="flex items-start gap-2 rounded-[var(--radius-sm)] border border-border bg-surface-raised px-2 py-1.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-primary/15 text-[10px] font-semibold text-primary">
            B
          </span>
          <span className="text-[10px] text-foreground">In-memory</span>
        </div>
      </div>
    </div>
  );
}

function SearchMock() {
  return (
    <div className="flex h-full min-h-[7.5rem] flex-col gap-2 overflow-hidden rounded-[var(--radius)] border border-border bg-background p-3">
      <div className="rounded-[var(--radius-sm)] border border-border bg-surface-raised px-2 py-1.5">
        <p className="text-[10px] text-foreground-faint">Searching web</p>
        <p className="font-data text-[10px] text-foreground">next-auth jwt callback</p>
      </div>
      <div className="rounded-[var(--radius-sm)] border border-border bg-surface px-2 py-1.5 font-data text-[10px] text-foreground-faint">
        <p className="text-foreground-secondary">AGENTS.md</p>
        <p>· Prefer functional modules</p>
        <p>· No process.env outside config</p>
      </div>
    </div>
  );
}

function ShipMock() {
  return (
    <div className="flex h-full min-h-[7.5rem] flex-col overflow-hidden rounded-[var(--radius)] border border-primary/30 bg-background">
      <div className="border-b border-border bg-surface-raised px-3 py-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wide text-primary">
          Approval required
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-3 py-2">
        <p className="text-[11px] text-foreground-secondary">
          Commit all changes with message: fix: session refresh on 401?
        </p>
        <div className="mt-auto flex gap-2">
          <span className="rounded-[var(--radius-sm)] bg-primary px-2 py-1 text-[10px] font-medium text-background">
            Approve
          </span>
          <span className="rounded-[var(--radius-sm)] border border-border px-2 py-1 text-[10px] text-foreground">
            Reject
          </span>
        </div>
      </div>
    </div>
  );
}

const items = [
  {
    title: "Plan Mode",
    description:
      "Explore first with ⌘K. Piper drafts file-level plans — you Apply when ready.",
    header: <PlanMock />,
    icon: <ListTree size={14} className="text-primary" strokeWidth={1.75} />,
  },
  {
    title: "Your choice",
    description:
      "Ambiguous strategy? Piper interrupts with options instead of guessing.",
    header: <ChoiceMock />,
    icon: (
      <MessageSquare size={14} className="text-primary" strokeWidth={1.75} />
    ),
  },
  {
    title: "Grounded research",
    description:
      "Web search with visible sources, plus repo AGENTS.md instructions every turn.",
    header: <SearchMock />,
    icon: <Search size={14} className="text-primary" strokeWidth={1.75} />,
  },
  {
    title: "Ship safely",
    description:
      "Commits and PRs wait for approval. PR bodies follow your template when present.",
    header: <ShipMock />,
    icon: (
      <GitPullRequest size={14} className="text-primary" strokeWidth={1.75} />
    ),
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 border-t border-border">
      <div className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Built for control
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl">
          Plan, decide, research, then ship — human-in-the-loop at every
          consequential step.
        </p>
      </div>
      <BentoGrid>
        {items.map((item) => (
          <BentoGridItem
            key={item.title}
            title={item.title}
            description={item.description}
            header={item.header}
            icon={item.icon}
          />
        ))}
      </BentoGrid>
    </section>
  );
}
