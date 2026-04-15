"use client";

import { Eye, TrendUp, TrendDown } from "@phosphor-icons/react";
import { useBacktestSummary, useClusters } from "@/lib/hooks/useTrades";
import { formatPct } from "@/lib/format";
import { cn } from "@/lib/cn";

const CHAIN_DOT: Record<string, string> = {
  solana: "bg-chain-solana",
  bsc: "bg-chain-bsc",
  eth: "bg-chain-eth",
  base: "bg-chain-base",
};

function Stat({
  label,
  value,
  valueClass,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
  sub?: React.ReactNode;
}) {
  return (
    <div>
      <div className="label-micro">{label}</div>
      <div
        className={cn(
          "num mt-1.5 text-lg md:text-[22px] font-semibold leading-none text-text-primary",
          valueClass,
        )}
      >
        {value}
      </div>
      {sub ? (
        <div className="mt-1 text-micro text-text-muted">{sub}</div>
      ) : null}
    </div>
  );
}

export function HeroBanner() {
  const { data: clusters } = useClusters();
  const { data: summary } = useBacktestSummary();

  const walletsTracked = (clusters ?? []).reduce(
    (s: number, c: any) => s + (c.size ?? 0),
    0,
  );
  const clusterCount = clusters?.length ?? 0;

  const chainSet = new Set<string>();
  (clusters ?? []).forEach((c: any) => {
    (c.chain ?? "").split(",").forEach((x: string) => {
      const v = x.trim();
      if (v) chainSet.add(v);
    });
  });
  const chains = Array.from(chainSet);

  const firings = summary?.total_firings ?? 0;
  const wins = summary?.wins ?? 0;
  const losses = Math.max(0, firings - wins);
  const winRate = firings > 0 ? (wins / firings) * 100 : 0;
  const avg = summary?.avg_pnl_pct ?? 0;
  const best = summary?.best_pnl_pct ?? 0;

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {/* LEFT — watching */}
      <div className="rounded-lg border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          <Eye size={12} className="text-text-secondary" />
          <span className="label-micro">Watching</span>
          <div className="ml-auto flex items-center gap-1">
            {chains.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-text-secondary"
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    CHAIN_DOT[c] ?? "bg-text-muted",
                  )}
                />
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-6 p-4">
          <Stat label="Smart wallets" value={walletsTracked} />
          <Stat label="Cabals" value={clusterCount} />
          <Stat
            label="Signals · 7d"
            value={firings}
            sub={
              firings
                ? `across ${summary?.tokens_tested ?? 0} tokens`
                : undefined
            }
          />
        </div>
      </div>

      {/* RIGHT — backtest result */}
      <div className="rounded-lg border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
          {avg >= 0 ? (
            <TrendUp size={12} className="text-primary" weight="fill" />
          ) : (
            <TrendDown size={12} className="text-loss" weight="fill" />
          )}
          <span className="label-micro">Backtest · last 7d</span>
          <span className="num ml-auto text-micro">
            <span className="text-gain">{wins}W</span>{" "}
            <span className="text-text-muted">/</span>{" "}
            <span className="text-loss">{losses}L</span>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-6 p-4">
          <Stat
            label="Best trade"
            value={formatPct(best)}
            valueClass="text-gain"
            sub="peak capture"
          />
          <Stat
            label="Win rate"
            value={`${winRate.toFixed(1)}%`}
            sub={`${wins} of ${firings}`}
          />
          <Stat
            label="Avg P&L"
            value={formatPct(avg)}
            valueClass={avg >= 0 ? "text-gain" : "text-loss"}
            sub="realistic exit"
          />
        </div>
      </div>
    </div>
  );
}
