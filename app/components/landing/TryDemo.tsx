"use client";

import Link from "next/link";
import { MovingBorderButton } from "../ui/moving-border";

export function TryDemo() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 border-t border-border">
      <div className="flex flex-col items-start gap-4 max-w-xl">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Try it live
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Explore a public demo repo in Piper — no GitHub sign-in required.
        </p>
        <MovingBorderButton
          as={Link}
          href="/demo"
          duration={2800}
          containerClassName="h-10 w-auto"
          className="border-transparent bg-primary px-4 text-background hover:bg-[var(--primary-hover)]"
          borderClassName="opacity-100 bg-[radial-gradient(#fff_35%,transparent_70%)]"
        >
          Open demo
        </MovingBorderButton>
      </div>
    </section>
  );
}
