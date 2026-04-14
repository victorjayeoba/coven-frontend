"use client";

import { useMemo, useState } from "react";
import { ArrowUp, ArrowDown, Funnel, ListBullets } from "@phosphor-icons/react";
import { formatAddress, formatRelativeTime, formatUsd } from "@/lib/format";
import { cn } from "@/lib/cn";

type Trade = {
  wallet: string;
  side: "buy" | "sell";
  amount_usd?: number | null;
  price_usd?: number | null;
  timestamp: number;
  tx_hash?: string;
};

type WalletAgg = {
  wallet: string;
  buys: Trade[];
  sells: Trade[];
  total_bought_usd: number;
  total_sold_usd: number;
  avg_buy_price: number | null;
  avg_sell_price: number | null;
  first_ts: number;
  last_ts: number;
  net_usd: number;
  state: "accumulating" | "distributing" | "flat" | "exited";
};

function aggregate(trades: Trade[]): WalletAgg[] {
  const byWallet = new Map<string, Trade[]>();
  for (const t of trades) {
    if (!byWallet.has(t.wallet)) byWallet.set(t.wallet, []);
    byWallet.get(t.wallet)!.push(t);
  }

  const rows: WalletAgg[] = [];
  for (const [wallet, list] of byWallet.entries()) {
    const buys = list.filter((t) => t.side === "buy");
    const sells = list.filter((t) => t.side === "sell");

    const sumBuys = buys.reduce((s, t) => s + (t.amount_usd ?? 0), 0);
    const sumSells = sells.reduce((s, t) => s + (t.amount_usd ?? 0), 0);

    const weightedBuy = buys.reduce(
      (acc, t) => {
        const amt = t.amount_usd ?? 0;
        const p = t.price_usd ?? 0;
        if (amt > 0 && p > 0) return { sum: acc.sum + amt * p, w: acc.w + amt };
        return acc;
      },
      { sum: 0, w: 0 },
    );
    const weightedSell = sells.reduce(
      (acc, t) => {
        const amt = t.amount_usd ?? 0;
        const p = t.price_usd ?? 0;
        if (amt > 0 && p > 0) return { sum: acc.sum + amt * p, w: acc.w + amt };
        return acc;
      },
      { sum: 0, w: 0 },
    );

    const avgBuy = weightedBuy.w > 0 ? weightedBuy.sum / weightedBuy.w : null;
    const avgSell = weightedSell.w > 0 ? weightedSell.sum / weightedSell.w : null;

    const firstTs = Math.min(...list.map((t) => t.timestamp));
    const lastTs = Math.max(...list.map((t) => t.timestamp));
    const net = sumBuys - sumSells;

    let state: WalletAgg["state"] = "flat";
    if (sumBuys > 0 && sumSells === 0) state = "accumulating";
    else if (sumBuys > 0 && sumSells >= sumBuys * 0.9) state = "exited";
    else if (sumBuys > 0 && sumSells > 0) state = "distributing";

    rows.push({
      wallet,
      buys,
      sells,
      total_bought_usd: sumBuys,
      total_sold_usd: sumSells,
      avg_buy_price: avgBuy,
      avg_sell_price: avgSell,
      first_ts: firstTs,
      last_ts: lastTs,
      net_usd: net,
      state,
    });
  }

  rows.sort((a, b) => b.total_bought_usd - a.total_bought_usd);
  return rows;
}

const STATE_BADGE: Record<
  WalletAgg["state"],
  { label: string; className: string }
> = {
  accumulating: {
    label: "ACCUMULATING",
    className: "bg-primary-faint text-primary",
  },
  distributing: {
    label: "DISTRIBUTING",
    className: "bg-warning/10 text-warning",
  },
  exited: { label: "EXITED", className: "bg-elevated text-text-secondary" },
  flat: { label: "FLAT", className: "bg-elevated text-text-secondary" },
};

export function ClusterTradesList({ trades }: { trades: Trade[] }) {
  const [view, setView] = useState<"agg" | "all">("agg");
  const aggregated = useMemo(() => aggregate(trades ?? []), [trades]);

  const totals = useMemo(
    () =>
      aggregated.reduce(
        (acc, w) => ({
          bought: acc.bought + w.total_bought_usd,
          sold: acc.sold + w.total_sold_usd,
          wallets: acc.wallets + 1,
        }),
        { bought: 0, sold: 0, wallets: 0 },
      ),
    [aggregated],
  );

  if (!trades || trades.length === 0) {
    return (
      <div className="rounded-md border border-border bg-surface p-6 text-center text-small text-text-muted">
        No cluster wallet transactions found for this token.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {(() => {
        const net = totals.bought - totals.sold;
        const isDistribution = totals.sold > totals.bought && totals.sold > 0;
        return (
          <div
            className={cn(
              "relative overflow-hidden rounded-md border",
              isDistribution
                ? "border-loss/30 bg-loss/5"
                : "border-border bg-border",
            )}
          >
            {isDistribution && (
              <div className="flex items-center gap-2 border-b border-loss/20 bg-loss/10 px-3 py-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-loss opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-loss" />
                </span>
                <span className="text-micro font-semibold uppercase tracking-wider text-loss">
                  Cluster distributing
                </span>
                <span className="text-micro text-text-secondary">
                  · smart money is exiting
                </span>
              </div>
            )}
            <div className="grid grid-cols-4 gap-px bg-border">
              <SummaryCell label="Wallets" value={totals.wallets.toString()} />
              <SummaryCell
                label="Accumulated"
                value={formatUsd(totals.bought)}
                valueClass="text-gain"
              />
              <SummaryCell
                label="Distributed"
                value={formatUsd(totals.sold)}
                valueClass={totals.sold > 0 ? "text-loss" : undefined}
              />
              <SummaryCell
                label="Net position"
                value={formatUsd(net)}
                valueClass={
                  net > 0 ? "text-gain" : net < 0 ? "text-loss" : undefined
                }
              />
            </div>
          </div>
        );
      })()}

      {/* View toggle */}
      <div className="flex items-center justify-between">
        <div className="label-micro">
          {view === "agg" ? "Per-wallet activity" : "All transactions"}
        </div>
        <div className="inline-flex rounded-md border border-border bg-surface p-0.5">
          <button
            onClick={() => setView("agg")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded px-2 py-1 text-micro font-medium uppercase tracking-wider transition-colors",
              view === "agg"
                ? "bg-elevated text-text-primary"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            <Funnel size={10} weight="fill" />
            Aggregated
          </button>
          <button
            onClick={() => setView("all")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded px-2 py-1 text-micro font-medium uppercase tracking-wider transition-colors",
              view === "all"
                ? "bg-elevated text-text-primary"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            <ListBullets size={10} weight="bold" />
            All · {trades.length}
          </button>
        </div>
      </div>

      {view === "agg" ? (
        <AggregatedTable rows={aggregated} />
      ) : (
        <AllTradesTable trades={trades} />
      )}
    </div>
  );
}

function SummaryCell({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-surface px-3 py-2.5">
      <div className="label-micro">{label}</div>
      <div
        className={cn(
          "num mt-0.5 text-body font-semibold text-text-primary",
          valueClass,
        )}
      >
        {value}
      </div>
    </div>
  );
}

function AggregatedTable({ rows }: { rows: WalletAgg[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface">
      <div className="grid grid-cols-[130px_minmax(0,1fr)_90px_90px_90px] items-center gap-3 border-b border-border bg-base/40 px-3 py-2 text-micro font-medium uppercase tracking-wider text-text-muted">
        <div>Wallet</div>
        <div>Status</div>
        <div className="text-right">Bought</div>
        <div className="text-right">Sold</div>
        <div className="text-right">Net</div>
      </div>

      <ul className="divide-y divide-border">
        {rows.map((r) => {
          const net = r.net_usd;
          const state = STATE_BADGE[r.state];
          return (
            <li
              key={r.wallet}
              className="grid grid-cols-[130px_minmax(0,1fr)_90px_90px_90px] items-center gap-3 px-3 py-2.5 transition-colors hover:bg-elevated"
            >
              <span className="num truncate text-small text-text-primary">
                {formatAddress(r.wallet, 6, 4)}
              </span>
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={cn(
                    "inline-flex shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                    state.className,
                  )}
                >
                  {state.label}
                </span>
                <span className="truncate text-micro text-text-muted">
                  {r.buys.length}B / {r.sells.length}S ·{" "}
                  {formatRelativeTime(
                    new Date(r.first_ts * 1000).toISOString(),
                  )}
                </span>
              </div>
              <span className="num text-right text-small text-gain">
                {formatUsd(r.total_bought_usd)}
              </span>
              <span
                className={cn(
                  "num text-right text-small",
                  r.total_sold_usd > 0 ? "text-loss" : "text-text-muted",
                )}
              >
                {r.total_sold_usd > 0 ? formatUsd(r.total_sold_usd) : "—"}
              </span>
              <span
                className={cn(
                  "num text-right text-small font-semibold",
                  net > 0
                    ? "text-gain"
                    : net < 0
                      ? "text-loss"
                      : "text-text-muted",
                )}
              >
                {formatUsd(net)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AllTradesTable({ trades }: { trades: Trade[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface">
      <div className="grid grid-cols-[70px_minmax(0,1fr)_90px_90px_70px] items-center gap-3 border-b border-border bg-base/40 px-3 py-2 text-micro font-medium uppercase tracking-wider text-text-muted">
        <div>Side</div>
        <div>Wallet</div>
        <div className="text-right">Amount</div>
        <div className="text-right">Price</div>
        <div className="text-right">Time</div>
      </div>

      <ul className="max-h-[280px] divide-y divide-border overflow-y-auto">
        {trades.map((t, idx) => {
          const buy = t.side === "buy";
          const iso = new Date(t.timestamp * 1000).toISOString();
          return (
            <li
              key={`${t.tx_hash ?? t.timestamp}-${idx}`}
              className="grid grid-cols-[70px_minmax(0,1fr)_90px_90px_70px] items-center gap-3 px-3 py-2 transition-colors hover:bg-elevated"
            >
              <div className="flex items-center gap-1">
                {buy ? (
                  <ArrowUp size={12} className="text-gain" weight="bold" />
                ) : (
                  <ArrowDown size={12} className="text-loss" weight="bold" />
                )}
                <span
                  className={cn(
                    "text-micro font-semibold uppercase tracking-wider",
                    buy ? "text-gain" : "text-loss",
                  )}
                >
                  {t.side}
                </span>
              </div>
              <span className="num truncate text-small text-text-primary">
                {formatAddress(t.wallet, 6, 4)}
              </span>
              <span className="num text-right text-small text-text-primary">
                {formatUsd(t.amount_usd ?? null)}
              </span>
              <span className="num text-right text-small text-text-secondary">
                {t.price_usd !== null && t.price_usd !== undefined
                  ? t.price_usd < 0.01
                    ? `$${t.price_usd.toPrecision(3)}`
                    : `$${t.price_usd.toFixed(4)}`
                  : "—"}
              </span>
              <span className="num text-right text-micro text-text-muted">
                {formatRelativeTime(iso)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
