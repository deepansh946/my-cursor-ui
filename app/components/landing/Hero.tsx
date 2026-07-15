"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Spotlight } from "../ui/spotlight";
import { TextGenerateEffect } from "../ui/text-generate-effect";
import { MovingBorderButton } from "../ui/moving-border";

export function Hero() {
  const { data: session } = useSession();
  const primaryHref = session ? "/chat" : "/login";
  const primaryLabel = session ? "Open app" : "Get started";

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.12),transparent_55%)]" />
      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="var(--primary)"
      />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-24 sm:py-32">
        <div className="flex flex-col gap-6 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
            Piper
          </h1>
          <TextGenerateEffect
            words="Plan the work. Choose the path. Ship with control."
            className="text-xl sm:text-2xl text-foreground-secondary"
          />
          <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
            Repo-aware coding agent: explore in Plan Mode, pause for your
            decisions, search when needed, then commit and open PRs only when
            you approve.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <MovingBorderButton
              as={Link}
              href={primaryHref}
              duration={2800}
              containerClassName="h-10 w-auto"
              className="border-transparent bg-primary px-4 text-background hover:bg-[var(--primary-hover)]"
              borderClassName="opacity-100 bg-[radial-gradient(#fff_35%,transparent_70%)]"
            >
              {primaryLabel}
            </MovingBorderButton>
            <Link
              href="/demo"
              className="inline-flex h-10 items-center justify-center rounded-[var(--radius)] border border-border bg-transparent px-4 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-surface-raised"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
