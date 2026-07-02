"use client";

export function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
      <span className="sr-only">Piper is thinking</span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-muted-foreground animate-pulse"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
}

export function StreamCursor() {
  return (
    <span
      className="inline-block w-0.5 h-4 ml-0.5 bg-primary align-middle animate-pulse"
      aria-hidden
    />
  );
}
