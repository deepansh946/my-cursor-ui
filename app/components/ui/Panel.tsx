import type { HTMLAttributes, ReactNode } from "react";

export function Panel({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={`rounded-[var(--radius)] border border-border bg-surface ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
