import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "default" | "lg" | "icon";

const variantClass: Record<ButtonVariant, string> = {
  default:
    "bg-primary text-background border border-primary hover:bg-[var(--primary-hover)]",
  secondary:
    "bg-surface-raised text-foreground border border-border hover:bg-[var(--surface)]",
  outline:
    "bg-transparent text-foreground border border-border hover:bg-surface-raised",
  ghost:
    "bg-transparent text-foreground-secondary border border-transparent hover:bg-surface-raised hover:text-foreground",
  destructive:
    "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-7 px-2 text-xs gap-1",
  default: "h-8 px-3 text-sm gap-1.5",
  lg: "h-10 px-4 text-sm gap-2",
  icon: "h-8 w-8 p-0",
};

export function Button({
  variant = "default",
  size = "default",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center font-medium rounded-[var(--radius)] transition-[background,color,opacity] duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
