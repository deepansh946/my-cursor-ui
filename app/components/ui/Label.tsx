import type { LabelHTMLAttributes, ReactNode } from "react";

export function Label({
  children,
  className = "",
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { children: ReactNode }) {
  return (
    <label
      className={`text-xs font-medium text-muted-foreground ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
