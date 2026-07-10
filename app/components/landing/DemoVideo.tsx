"use client";

import { Panel } from "../ui/Panel";

export function DemoVideo() {
  return (
    <section
      id="demo"
      className="mx-auto max-w-5xl px-6 py-16 border-t border-border"
    >
      <div className="mb-8">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Demo
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl">
          See Piper clone a repo, read files, and answer questions in real time.
        </p>
      </div>
      <Panel className="overflow-hidden">
        (
        <video
          className="aspect-video w-full bg-surface-raised"
          controls
          playsInline
          preload="metadata"
        >
          <source src="/demo.mp4" type="video/mp4" />
        </video>
        )
      </Panel>
    </section>
  );
}
