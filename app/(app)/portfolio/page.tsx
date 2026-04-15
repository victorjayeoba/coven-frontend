"use client";

import { useState } from "react";
import {
  ChartLineUp,
  TrendUp,
  Target,
  Coins,
  ArrowsClockwise,
  Download,
} from "@phosphor-icons/react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { EquityCurve } from "@/components/portfolio/EquityCurve";
import { AllocationBar } from "@/components/portfolio/AllocationBar";
import { PositionsTable } from "@/components/portfolio/PositionsTable";
import { TradeHistoryTable } from "@/components/portfolio/TradeHistoryTable";
import {
  useActiveTrades,
  usePnlSummary,
  useTradeHistory,
} from "@/lib/hooks/useTrades";
import { useBalances } from "@/lib/hooks/useBalances";
import { formatPct, formatUsd } from "@/lib/format";
import { cn } from "@/lib/cn";

type Range = "7D" | "30D" | "90D" | "ALL";
type Tab = "open" | "closed";

const RANGES: Range[] = ["7D", "30D", "90D", "ALL"];

export default function PortfolioPage() {
  const [range, setRange] = useState<Range>("30D");
  const [tab, setTab] = useState<Tab>("open");

  const paperBalance = useBalances().data?.total ?? 0;
  const { data: active, isLoading: loadingActive, refetch: refetchActive } =
    useActiveTrades();
  const { data: pnl, refetch: refetchPnl } = usePnlSummary();
  const {
    data: history,
    isLoading: loadingHistory,
    refetch: refetchHistory,
  } = useTradeHistory(200);

  const positions = Array.isArray(active) ? active : [];
  const closed = Array.isArray(history) ? history : [];

  const realized = pnl?.total_realized_pnl_usd ?? 0;
  const unrealized = pnl?.unrealized_pnl_usd ?? 0;
  const totalPnl = realized + unrealized;
  const equity = paperBalance + totalPnl;
  const winRate = pnl?.win_rate_pct ?? 0;
  const openCount = pnl?.open_positions ?? positions.length;
  const tradeCount = pnl?.trade_count ?? 0;
  const best = pnl?.best_trade_pct ?? 0;
  const worst = pnl?.worst_trade_pct ?? 0;

  const pnlColor: "gain" | "loss" | undefined =
    totalPnl > 0 ? "gain" : totalPnl < 0 ? "loss" : undefined;

  const refreshAll = () => {
    refetchActive();
    refetchPnl();
    refetchHistory();
  };

  const exportCsv = () => {
    const rows = [
      [
        "id",
        "symbol",
        "chain",
        "size_usd",
        "entry_price",
        "exit_price",
        "pnl_usd",
        "pnl_pct",
        "exit_reason",
        "closed_at",
      ],
      ...closed.map((t: any) => [
        t.id,
        t.symbol ?? "",
        t.chain ?? "",
        t.entry?.size_usd ?? "",
        t.entry?.price_usd ?? t.entry?.price ?? "",
        t.exit?.price_usd ?? t.exit?.price ?? "",
        t.pnl_usd ?? "",
        t.pnl_pct ?? "",
        t.exit?.reason ?? "",
        t.closed_at ?? "",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trade-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Portfolio"
        subtitle="Equity, active positions, and closed trade history"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshAll}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 text-small text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
            >
              <ArrowsClockwise size={12} /> Refresh
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 text-small text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
            >
              <Download size={12} /> Export CSV
            </button>
          </div>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Equity"
          value={formatUsd(equity, 2)}
          sub={
            <span>
              Cash {formatUsd(paperBalance, 0)} · PnL{" "}
              <span className={totalPnl >= 0 ? "text-gain" : "text-loss"}>
                {formatUsd(totalPnl, 2)}
              </span>
            </span>
          }
          icon={<ChartLineUp size={14} />}
        />
        <StatCard
          label="Realized P&L"
          value={formatUsd(realized, 2)}
          accent={pnlColor}
          sub={
            <span>
              Unrealized{" "}
              <span className={unrealized >= 0 ? "text-gain" : "text-loss"}>
                {formatUsd(unrealized, 2)}
              </span>
            </span>
          }
          icon={<TrendUp size={14} />}
        />
        <StatCard
          label="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          sub={
            <span>
              {pnl?.wins ?? 0}W · {pnl?.losses ?? 0}L · {tradeCount} trades
            </span>
          }
          icon={<Target size={14} />}
        />
        <StatCard
          label="Open Positions"
          value={String(openCount)}
          sub={
            <span>
              Best {formatPct(best)} · Worst{" "}
              <span className="text-loss">{formatPct(worst)}</span>
            </span>
          }
          icon={<Coins size={14} />}
        />
      </div>

      {/* Chart + Allocation */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <div>
              <div className="text-body font-semibold text-text-primary">
                Equity Curve
              </div>
              <div className="text-micro text-text-muted">
                Cumulative paper equity over time
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-md border border-border bg-input p-0.5">
              {RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={cn(
                    "h-6 rounded px-2 text-micro font-medium transition-colors",
                    range === r
                      ? "bg-elevated text-text-primary"
                      : "text-text-muted hover:text-text-secondary",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="px-2 py-2">
            <EquityCurve history={closed} range={range} />
          </div>
        </div>

        <AllocationBar positions={positions} />
      </div>

      {/* Tabs */}
      <div className="space-y-3">
        <div className="flex items-center gap-1 border-b border-border">
          <button
            type="button"
            onClick={() => setTab("open")}
            className={cn(
              "relative -mb-px h-9 px-3 text-small font-medium transition-colors",
              tab === "open"
                ? "text-text-primary"
                : "text-text-muted hover:text-text-secondary",
            )}
          >
            Open Positions
            <span className="num ml-1.5 rounded-sm bg-elevated px-1.5 text-micro text-text-secondary">
              {positions.length}
            </span>
            {tab === "open" && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab("closed")}
            className={cn(
              "relative -mb-px h-9 px-3 text-small font-medium transition-colors",
              tab === "closed"
                ? "text-text-primary"
                : "text-text-muted hover:text-text-secondary",
            )}
          >
            Closed Trades
            <span className="num ml-1.5 rounded-sm bg-elevated px-1.5 text-micro text-text-secondary">
              {closed.length}
            </span>
            {tab === "closed" && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {tab === "open" ? (
          <PositionsTable positions={positions} isLoading={loadingActive} />
        ) : (
          <TradeHistoryTable trades={closed} isLoading={loadingHistory} />
        )}
      </div>
    </div>
  );
}
