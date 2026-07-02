import { GetStartedCta } from "./GetStartedCta";

const btnLg =
  "inline-flex items-center justify-center font-medium rounded-[var(--radius)] transition-[background,color,opacity] duration-150 h-10 px-4 text-sm gap-2";

export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
      <div className="flex flex-col gap-6 max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">
          AI coding assistant
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground leading-snug">
          Ship code in your repos with an agent that reads, writes, and runs
          commands.
        </h1>
        <p className="text-sm text-foreground-secondary leading-relaxed">
          Piper clones your GitHub repo, navigates the codebase, executes
          terminal commands, and opens PRs — all from a streaming chat interface.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <GetStartedCta
            className={`${btnLg} bg-primary text-background border border-primary hover:bg-[var(--primary-hover)]`}
          />
          <a
            href="#demo"
            className={`${btnLg} bg-transparent text-foreground border border-border hover:bg-surface-raised`}
          >
            Watch demo
          </a>
        </div>
      </div>
    </section>
  );
}
