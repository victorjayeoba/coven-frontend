"use client";

import { Badge } from "@/components/ui/Badge";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { formatPct, formatRelativeTime, formatUsd } from "@/lib/format";
import type { TokenMarket } from "@/lib/hooks/useTokenMarkets";
import { cn } from "@/lib/cn";

const STATUS_VARIANT: Record<string, any> = {
  exec: "exec",
  partial: "partial",
  watch: "watch",
  blocked: "blocked",
};

export type SignalRowMode = "live" | "backtest";

function PctCell({ value }: { value?: number | null }) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return <span className="num text-small text-text-muted">—</span>;
  }
  return (
    <span
      className={cn(
        "num text-small font-medium",
        value >= 0 ? "text-gain" : "text-loss",
      )}
    >
      {formatPct(value)}
    </span>
  );
}

function USDCell({ value }: { value?: number | null }) {
  if (value === null || value === undefined) {
    return <span className="num text-small text-text-muted">—</span>;
  }
  return (
    <span className="num text-small text-text-primary">
      {formatUsd(value, 2)}
    </span>
  );
}

function PriceCell({ value }: { value?: number | null }) {
  if (value === null || value === undefined) {
    return <span className="num text-small text-text-muted">—</span>;
  }
  if (value < 0.01) {
    return (
      <span className="num text-small text-text-primary">
        ${value.toPrecision(3)}
      </span>
    );
  }
  return (
    <span className="num text-small text-text-primary">
      ${value.toFixed(value < 1 ? 4 : 2)}
    </span>
  );
}

// Tighter column template — fits in ~1150px so sidebar + table coexist.
export const SIGNAL_ROW_GRID =
  "grid-cols-[28px_minmax(200px,1.6fr)_90px_70px_70px_100px_90px_100px_95px_70px_76px]";

export function SignalRow({
  row,
  rank,
  market,
  mode,
  highlighted,
  onClick,
}: {
  row: any;
  rank: number;
  market?: TokenMarket;
  mode: SignalRowMode;
  highlighted?: boolean;
  onClick?: () => void;
}) {
  const statusVariant = STATUS_VARIANT[row.status] ?? "default";
  const conviction = row.conviction_score ?? 0;
  const convictionColor =
    conviction >= 70
      ? "text-primary"
      : conviction >= 40
        ? "text-warning"
        : "text-text-secondary";
  const pnl = row.peak_pnl_pct;
  const symbol =
    market?.symbol ?? row.symbol ?? row.token_id?.split("-")[0]?.slice(0, 6);

  return (
    <li
      onClick={onClick}
      className={cn(
        "grid items-center gap-2 px-3 py-2.5 transition-colors",
        SIGNAL_ROW_GRID,
        onClick && "cursor-pointer hover:bg-elevated",
        highlighted && "bg-primary-faint/30",
      )}
    >
      <span className="num text-small font-semibold text-text-muted">{rank}</span>

      <div className="flex min-w-0 items-center gap-2.5">
        <TokenLogo
          symbol={symbol}
          chain={row.chain}
          tokenId={row.token_id}
          logoUrl={market?.logo_url}
          size={28}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-body font-semibold text-text-primary">
              ${symbol}
            </span>
            <span className="rounded-sm bg-elevated px-1 text-[10px] uppercase tracking-wider text-text-muted">
              {row.chain}
            </span>
          </div>
          <div className="truncate text-micro text-text-muted">
            {row.token_id?.split("-")[0]?.slice(0, 10)}…
          </div>
        </div>
      </div>

      <div className="text-right">
        <PriceCell value={market?.price_usd} />
      </div>
      <div className="text-right">
        <PctCell value={market?.price_change_1h} />
      </div>
      <div className="text-right">
        <PctCell value={market?.price_change_24h} />
      </div>
      <div className="text-right">
        <USDCell value={market?.volume_24h} />
      </div>
      <div className="text-right">
        <USDCell value={market?.tvl} />
      </div>
      <div className="text-right">
        <USDCell value={market?.market_cap} />
      </div>

      <div className="text-right">
        {(() => {
          // Compute avg alpha, falling back to the wallet_alpha_scores list
          // for older records that don't have avg_alpha_score stored.
          const fallback =
            Array.isArray(row.wallet_alpha_scores) &&
            row.wallet_alpha_scores.length > 0
              ? row.wallet_alpha_scores.reduce(
                  (s: number, v: any) => s + Number(v || 0),
                  0,
                ) / row.wallet_alpha_scores.length
              : 0;
          const avgAlpha = Number(row.avg_alpha_score ?? fallback);

          if (row.signal_type === "alpha") {
            const tier = row.alpha_tier;
            return (
              <span
                className={cn(
                  "num inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                  tier === "elite"
                    ? "bg-primary-faint text-primary"
                    : "bg-info/10 text-info",
                )}
              >
                α {avgAlpha.toFixed(2)}
                {tier === "elite" ? " ★" : ""}
              </span>
            );
          }
          return (
            <span className="num inline-flex items-center rounded-sm bg-elevated px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
              #{row.cluster_id ?? "—"} · {row.cluster_active_count}/
              {row.cluster_size_total}
            </span>
          );
        })()}
      </div>

      <div className="text-right">
        {mode === "live" ? (
          <span className={cn("num text-body font-semibold", convictionColor)}>
            {conviction}
          </span>
        ) : pnl !== undefined && pnl !== null ? (
          <span
            className={cn(
              "num text-small font-semibold",
              pnl >= 0 ? "text-gain" : "text-loss",
            )}
          >
            {formatPct(pnl)}
          </span>
        ) : (
          <span className="num text-small text-text-muted">—</span>
        )}
      </div>

      <div className="flex justify-end">
        <Badge variant={statusVariant}>{row.status ?? "watch"}</Badge>
      </div>
    </li>
  );
}

export function SignalRowHeaders({ mode }: { mode: SignalRowMode }) {
  return (
    <div
      className={cn(
        "grid items-center gap-2 border-b border-border bg-base/40 px-3 py-2 text-micro font-medium uppercase tracking-wider text-text-muted",
        SIGNAL_ROW_GRID,
      )}
    >
      <div className="text-left">#</div>
      <div className="text-left">Token</div>
      <div className="text-right">Price</div>
      <div className="text-right">1H</div>
      <div className="text-right">24H</div>
      <div className="text-right">Vol 24H</div>
      <div className="text-right">Liquidity</div>
      <div
        className="text-right"
        title="Fully Diluted Valuation (total supply × price). Often higher than circulating market cap — beware low-float tokens."
      >
        FDV
      </div>
      <div className="text-right">Signal</div>
      <div className="text-right">{mode === "live" ? "Conv" : "Peak"}</div>
      <div className="text-right">Status</div>
    </div>
  );
}
