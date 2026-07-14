"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

const btnBase =
  "inline-flex items-center justify-center font-medium rounded-[var(--radius)] transition-[background,color,opacity] duration-150 h-7 px-2 text-xs gap-1";

export function LandingNav() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-foreground"
        >
          Piper
        </Link>
        <div className="flex items-center gap-2">
          {session ? (
            <Link
              href="/chat"
              className={`${btnBase} bg-primary text-background border border-primary hover:bg-[var(--primary-hover)]`}
            >
              Open app
            </Link>
          ) : (
            <>
              <Link
                href="/demo"
                className={`${btnBase} bg-transparent text-foreground border border-border hover:bg-surface-raised`}
              >
                Try Demo
              </Link>
              <Link
                href="/login"
                className={`${btnBase} bg-transparent text-foreground border border-border hover:bg-surface-raised`}
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className={`${btnBase} bg-primary text-background border border-primary hover:bg-[var(--primary-hover)]`}
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
