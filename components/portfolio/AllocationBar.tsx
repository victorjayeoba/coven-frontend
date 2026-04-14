"use client";

import { useMemo } from "react";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { formatPct, formatUsd } from "@/lib/format";

type Trade = {
  id: string;
  symbol?: string;
  chain?: string;
  token_id?: string;
  entry?: { size_usd?: number };
  unrealized_pnl_usd?: number;
};

const PALETTE = [
  "#3cc47b",
  "#5b9bff",
  "#f5a524",
  "#8247e5",
  "#14f195",
  "#627eea",
  "#ef4a5f",
  "#28a0f0",
];

export function AllocationBar({ positions }: { positions: Trade[] }) {
  const items = useMemo(() => {
    const rows = positions.map((p) => ({
      id: p.id,
      symbol: p.symbol ?? p.token_id?.split("-")[0]?.slice(0, 6) ?? "?",
      chain: p.chain,
      token_id: p.token_id,
      size: p.entry?.size_usd ?? 0,
      pnl: p.unrealized_pnl_usd ?? 0,
    }));
    const total = rows.reduce((s, r) => s + r.size, 0) || 1;
    return rows
      .map((r, i) => ({
        ...r,
        pct: (r.size / total) * 100,
        color: PALETTE[i % PALETTE.length],
      }))
      .sort((a, b) => b.size - a.size);
  }, [positions]);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-center text-small text-text-muted">
        No open positions to allocate.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="text-body font-semibold text-text-primary">
          Allocation
        </span>
        <span className="label-micro">By Position Size</span>
      </div>

      {/* Stacked bar */}
      <div className="px-4 pt-4">
        <div className="flex h-2 overflow-hidden rounded-full bg-input">
          {items.map((it) => (
            <div
              key={it.id}
              style={{ width: `${it.pct}%`, background: it.color }}
              title={`${it.symbol} · ${it.pct.toFixed(1)}%`}
            />
          ))}
        </div>
      </div>

      {/* Legend / list */}
      <ul className="divide-y divide-border">
        {items.slice(0, 8).map((it) => (
          <li key={it.id} className="flex items-center gap-3 px-4 py-2.5">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: it.color }}
            />
            <TokenLogo
              symbol={it.symbol}
              chain={it.chain}
              tokenId={it.token_id}
              size={20}
            />
            <div className="flex-1 text-body font-medium text-text-primary">
              ${it.symbol}
            </div>
            <div className="num text-small text-text-secondary">
              {formatUsd(it.size, 0)}
            </div>
            <div className="num w-14 text-right text-small text-text-muted">
              {it.pct.toFixed(1)}%
            </div>
            <div
              className={`num w-16 text-right text-small font-semibold ${
                it.pnl >= 0 ? "text-gain" : "text-loss"
              }`}
            >
              {formatPct((it.pnl / (it.size || 1)) * 100)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
