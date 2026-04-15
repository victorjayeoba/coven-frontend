import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-base hover:bg-primary-hover disabled:bg-elevated disabled:text-text-muted",
  secondary:
    "border border-border bg-surface text-text-primary hover:border-border-strong hover:bg-elevated",
  ghost:
    "text-text-secondary hover:bg-elevated hover:text-text-primary",
};

const SIZES = {
  sm: "h-8 px-3 text-small",
  md: "h-10 px-4 text-small",
  lg: "h-11 px-5 text-body",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
