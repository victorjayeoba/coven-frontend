import { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  accent?: "gain" | "loss" | "warning" | "info";
}) {
  const accentClasses = {
    gain: "text-gain",
    loss: "text-loss",
    warning: "text-warning",
    info: "text-info",
  } as const;

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="label-micro">{label}</span>
        {icon ? <span className="text-text-muted">{icon}</span> : null}
      </div>
      <div
        className={cn(
          "num mt-2 text-display font-semibold text-text-primary",
          accent ? accentClasses[accent] : undefined,
        )}
      >
        {value}
      </div>
      {sub ? <div className="mt-1 text-small text-text-secondary">{sub}</div> : null}
    </div>
  );
}
