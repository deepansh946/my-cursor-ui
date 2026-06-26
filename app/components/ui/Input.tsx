import type { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      className={`w-full h-8 px-3 text-sm rounded-[var(--radius)] bg-surface border transition-[border-color] duration-150 outline-none placeholder:text-foreground-faint disabled:opacity-40 ${
        error
          ? "border-destructive focus:border-destructive"
          : "border-border focus:border-primary"
      } ${className}`}
      {...props}
    />
  );
}
