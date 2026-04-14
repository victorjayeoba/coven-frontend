"use client";

import Link from "next/link";
import { ArrowRight, Coins } from "@phosphor-icons/react";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { useActiveTrades, usePnlSummary } from "@/lib/hooks/useTrades";
import { formatPct, formatUsd } from "@/lib/format";
import { cn } from "@/lib/cn";

export function PositionsList() {
  const { data: trades, isLoading } = useActiveTrades();
  const { data: pnl } = usePnlSummary();
  const open = Array.isArray(trades) ? trades : [];

  const unrealized = pnl?.unrealized_pnl_usd ?? 0;

  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Coins size={14} weight="fill" className="text-primary" />
          <span className="text-body font-semibold text-text-primary">
            Positions
          </span>
          <span className="num rounded-sm bg-elevated px-1.5 text-micro text-text-secondary">
            {open.length}
          </span>
        </div>
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1 text-small text-text-secondary hover:text-text-primary"
        >
          Portfolio <ArrowRight size={12} />
        </Link>
      </div>

      {/* Unrealized summary row (always visible) */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="label-micro">Unrealized</span>
        <span
          className={cn(
            "num text-body font-semibold",
            unrealized > 0
              ? "text-gain"
              : unrealized < 0
                ? "text-loss"
                : "text-text-primary",
          )}
        >
          {formatUsd(unrealized, 2)}
        </span>
      </div>

      {isLoading ? (
        <div className="px-4 py-3 text-small text-text-muted">Loading…</div>
      ) : open.length === 0 ? (
        <div className="px-4 py-3 text-small text-text-muted">
          No open positions. Waiting for high-conviction signals.
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {open.slice(0, 6).map((t: any) => {
            const pct = t.unrealized_pnl_pct ?? 0;
            const positive = pct >= 0;
            const symbol = t.symbol ?? t.token_id?.split("-")[0]?.slice(0, 6);
            return (
              <li
                key={t.id}
                className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-elevated"
              >
                <TokenLogo
                  symbol={symbol}
                  chain={t.chain}
                  tokenId={t.token_id}
                  size={24}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-body font-semibold text-text-primary">
                    ${symbol}
                  </div>
                  <div className="num text-micro text-text-muted">
                    {formatUsd(t.entry?.size_usd ?? 0, 0)}
                  </div>
                </div>
                <div
                  className={cn(
                    "num text-body font-semibold",
                    positive ? "text-gain" : "text-loss",
                  )}
                >
                  {formatPct(pct)}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
