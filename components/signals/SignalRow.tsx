"use client";

import { Badge } from "@/components/ui/Badge";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { Skeleton } from "@/components/ui/Skeleton";
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

  // Compute the signal-type pill once — used by both desktop + mobile renders.
  const signalPill = (() => {
    const fallback =
      Array.isArray(row.wallet_alpha_scores) && row.wallet_alpha_scores.length > 0
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
    if (row.signal_type === "rank_stack") {
      const count = Number(row.topics_count ?? 0);
      const bestJump = Number(row.best_rank_jump ?? 0);
      return (
        <span className="num inline-flex items-center gap-1 rounded-sm bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-warning">
          🔥 {count} topics
          {bestJump >= 10 ? ` · ↑${bestJump}` : ""}
        </span>
      );
    }
    return (
      <span className="num inline-flex items-center rounded-sm bg-elevated px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
        #{row.cluster_id ?? "—"} · {row.cluster_active_count}/
        {row.cluster_size_total}
      </span>
    );
  })();

  return (
    <li
      onClick={onClick}
      className={cn(
        "transition-colors",
        onClick && "cursor-pointer hover:bg-elevated",
        highlighted && "bg-primary-faint/30",
      )}
    >
      {/* MOBILE CARD — visible <md only */}
      <div className="block px-3 py-3 md:hidden">
        <div className="flex items-start gap-2.5">
          <span className="num pt-1 text-small font-semibold text-text-muted">
            {rank}
          </span>
          <TokenLogo
            symbol={symbol}
            chain={row.chain}
            tokenId={row.token_id}
            logoUrl={market?.logo_url}
            size={32}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-body font-semibold text-text-primary">
                ${symbol}
              </span>
              <span className="rounded-sm bg-elevated px-1 text-[10px] uppercase tracking-wider text-text-muted">
                {row.chain}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5">
              {signalPill}
              <Badge variant={statusVariant}>{row.status ?? "watch"}</Badge>
            </div>
          </div>
          <div className="text-right">
            <div className={cn("num text-h3 font-semibold leading-none", convictionColor)}>
              {conviction}
            </div>
            <div className="mt-0.5 text-[9px] uppercase tracking-wider text-text-muted">
              conv
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-2.5 text-[11px]">
          <div>
            <div className="text-[9px] uppercase tracking-wider text-text-muted">
              Price
            </div>
            <PriceCell value={market?.price_usd} />
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider text-text-muted">
              1H
            </div>
            <PctCell value={market?.price_change_1h} />
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider text-text-muted">
              24H
            </div>
            <PctCell value={market?.price_change_24h} />
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider text-text-muted">
              Vol
            </div>
            <USDCell value={market?.volume_24h} />
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider text-text-muted">
              Liq
            </div>
            <USDCell value={market?.tvl} />
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider text-text-muted">
              FDV
            </div>
            <USDCell value={market?.market_cap} />
          </div>
        </div>
      </div>

      {/* DESKTOP GRID — visible md+ */}
      <div
        className={cn(
          "hidden items-center gap-2 px-3 py-2.5 md:grid",
          SIGNAL_ROW_GRID,
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
            {Number(row._signal_count ?? 0) > 1 && (
              <span
                className="rounded-sm bg-primary-faint px-1 text-[10px] font-semibold text-primary"
                title={`${row._signal_count} signals fired on this token — showing the strongest`}
              >
                ×{row._signal_count}
              </span>
            )}
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

      <div className="text-right">{signalPill}</div>

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
      </div>
    </li>
  );
}

export function SignalRowSkeleton({ mode }: { mode: SignalRowMode }) {
  return (
    <li
      className={cn(
        "hidden items-center gap-2 px-3 py-2.5 md:grid",
        SIGNAL_ROW_GRID,
      )}
    >
      <Skeleton w={14} h={12} />
      <div className="flex min-w-0 items-center gap-2.5">
        <Skeleton w={28} h={28} rounded="full" />
        <div className="min-w-0 space-y-1.5">
          <Skeleton w={90} h={12} />
          <Skeleton w={64} h={9} />
        </div>
      </div>
      <div className="flex justify-end"><Skeleton w={56} h={12} /></div>
      <div className="flex justify-end"><Skeleton w={40} h={12} /></div>
      <div className="flex justify-end"><Skeleton w={46} h={12} /></div>
      <div className="flex justify-end"><Skeleton w={60} h={12} /></div>
      <div className="flex justify-end"><Skeleton w={56} h={12} /></div>
      <div className="flex justify-end"><Skeleton w={60} h={12} /></div>
      <div className="flex justify-end"><Skeleton w={48} h={16} rounded="sm" /></div>
      <div className="flex justify-end"><Skeleton w={30} h={14} /></div>
      <div className="flex justify-end"><Skeleton w={52} h={16} rounded="sm" /></div>
    </li>
  );
}

export function SignalRowHeaders({ mode }: { mode: SignalRowMode }) {
  return (
    <div
      className={cn(
        "hidden items-center gap-2 border-b border-border bg-base/40 px-3 py-2 text-micro font-medium uppercase tracking-wider text-text-muted md:grid",
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
