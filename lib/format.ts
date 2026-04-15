function toNumber(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function formatUsd(value: unknown, digits = 2) {
  const n = toNumber(value);
  if (n === null) return "—";
  if (n === 0) return "$0";
  const abs = Math.abs(n);
  if (abs < 0.0001) return `$${n.toExponential(2)}`;
  if (abs >= 1_000_000_000) return `$${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1_000_000) return `$${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(digits)}`;
}

export function formatPct(value: unknown, digits = 2) {
  const n = toNumber(value);
  if (n === null) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

export function formatAddress(addr: string | undefined, head = 4, tail = 4) {
  if (!addr) return "—";
  if (addr.length <= head + tail + 2) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

export function formatRelativeTime(iso: string | number | Date): string {
  // Backend serializes UTC datetimes without a "Z" — force-tag as UTC so the
  // browser doesn't misinterpret them as local time.
  let input = iso;
  if (typeof iso === "string" && !/[zZ]|[+-]\d\d:?\d\d$/.test(iso)) {
    input = iso + "Z";
  }
  const date = new Date(input);
  const diff = Math.max(0, (Date.now() - date.getTime()) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatNumber(value: unknown) {
  const n = toNumber(value);
  if (n === null) return "—";
  return new Intl.NumberFormat("en-US").format(n);
}
