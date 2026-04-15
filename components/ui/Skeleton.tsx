import { cn } from "@/lib/cn";

export function Skeleton({
  className,
  w,
  h = 14,
  rounded = "md",
}: {
  className?: string;
  w?: number | string;
  h?: number | string;
  rounded?: "sm" | "md" | "full";
}) {
  const style: React.CSSProperties = {};
  if (w !== undefined) style.width = typeof w === "number" ? `${w}px` : w;
  if (h !== undefined) style.height = typeof h === "number" ? `${h}px` : h;
  const r =
    rounded === "full"
      ? "rounded-full"
      : rounded === "sm"
        ? "rounded-sm"
        : "rounded-md";
  return (
    <span
      aria-hidden
      style={style}
      className={cn(
        "inline-block animate-pulse bg-elevated/70",
        r,
        className,
      )}
    />
  );
}
