import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "default" | "gain" | "loss" | "warning" | "info" | "exec" | "partial" | "watch" | "blocked";

const variants: Record<Variant, string> = {
  default: "bg-elevated text-text-secondary",
  gain: "bg-primary-faint text-gain",
  loss: "bg-loss/10 text-loss",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
  exec: "bg-primary-faint text-primary",
  partial: "bg-warning/10 text-warning",
  watch: "bg-elevated text-text-secondary",
  blocked: "bg-loss/10 text-loss",
};

export function Badge({
  className,
  variant = "default",
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded px-1.5 text-micro font-medium uppercase tracking-wider",
        variants[variant],
        className,
      )}
      {...rest}
    />
  );
}
