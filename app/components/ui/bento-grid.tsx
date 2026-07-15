import type { ReactNode } from "react";
import { cn } from "@/app/lib/utils";

export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-5xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | ReactNode;
  description?: string | ReactNode;
  header?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "group/bento row-span-1 flex flex-col justify-between space-y-4 rounded-[var(--radius-lg)] border border-border bg-surface p-4 transition-colors duration-150 hover:border-primary/40",
        className,
      )}
    >
      {header}
      <div className="transition duration-150 group-hover/bento:translate-x-0.5">
        {icon}
        <div className="mt-2 mb-1 text-sm font-medium text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground leading-relaxed">{description}</div>
      </div>
    </div>
  );
}
