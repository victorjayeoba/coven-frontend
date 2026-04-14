export function formatUsd(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  if (value === 0) return "$0";
  const abs = Math.abs(value);
  if (abs < 0.0001) return `$${value.toExponential(2)}`;
  if (abs >= 1_000_000_000) return `$${(value / 1e9).toFixed(2)}B`;
  if (abs >= 1_000_000) return `$${(value / 1e6).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(digits)}`;
}

export function formatPct(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatAddress(addr: string | undefined, head = 4, tail = 4) {
  if (!addr) return "—";
  if (addr.length <= head + tail + 2) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

export function formatRelativeTime(iso: string | number | Date): string {
  const date = new Date(iso);
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}
