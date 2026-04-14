"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  X,
  ChartLineUp,
  Pulse,
  ShieldCheck,
  Warning,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { Badge } from "@/components/ui/Badge";
import { TokenPriceChart } from "./TokenPriceChart";
import { ClusterTradesList } from "./ClusterTradesList";
import {
  useTokenCandles,
  useTokenDetail,
  useSignalTrades,
} from "@/lib/hooks/useTokenDetail";
import { formatPct, formatUsd } from "@/lib/format";
import { cn } from "@/lib/cn";

const INTERVALS = [
  { label: "15m", value: 15 },
  { label: "1h", value: 60 },
  { label: "4h", value: 240 },
  { label: "1d", value: 1440 },
];

export function TokenDetailDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const signalId = params.get("signal");

  const [interval, setInterval] = useState<number>(60);
  const [tab, setTab] = useState<"cluster" | "overview">("cluster");

  const { data: signalTrades, isLoading: tradesLoading } =
    useSignalTrades(signalId);

  const tokenId = signalTrades?.token_id ?? null;

  const { data: detail } = useTokenDetail(tokenId);
  const { data: candles } = useTokenCandles(tokenId, interval, 300);

  const token = useMemo(() => {
    if (!detail) return null;
    const t = detail.token && typeof detail.token === "object" ? detail.token : detail;
    return t;
  }, [detail]);

  const chartMarkers = useMemo(() => {
    const trades = signalTrades?.trades ?? [];
    return trades.map((t: any) => ({
      time: t.timestamp,
      side: t.side,
      text: `${t.side === "buy" ? "↑" : "↓"} ${t.wallet?.slice(0, 6)}`,
    }));
  }, [signalTrades]);

  const close = () => {
    const next = new URLSearchParams(params.toString());
    next.delete("signal");
    router.replace(`${pathname}${next.toString() ? "?" + next.toString() : ""}`);
  };

  // Close on ESC
  useEffect(() => {
    if (!signalId) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signalId]);

  // Lock body scroll while open
  useEffect(() => {
    if (!signalId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [signalId]);

  if (!signalId) return null;

  const price =
    Number(token?.current_price_usd ?? NaN);
  const change24h = Number(token?.token_price_change_24h ?? NaN);
  const change1h = Number(token?.token_price_change_1h ?? NaN);
  const mcap = Number(token?.market_cap ?? NaN);
  const tvl = Number(token?.main_pair_tvl ?? token?.tvl ?? NaN);
  const vol24 = Number(token?.token_tx_volume_usd_24h ?? NaN);
  const makers = Number(token?.token_makers_24h ?? NaN);
  const symbol = token?.symbol ?? "?";
  const chain = token?.chain ?? signalTrades?.chain ?? "";

  return (
    <>
      {/* Scrim */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={close}
      />
      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[720px] flex-col overflow-y-auto border-l border-border bg-base shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start gap-4 border-b border-border bg-base/95 p-4 backdrop-blur">
          <TokenLogo
            symbol={symbol}
            chain={chain}
            tokenId={tokenId}
            logoUrl={token?.logo_url}
            size={40}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-h1 font-semibold text-text-primary">
                ${symbol}
              </span>
              <span className="rounded-sm bg-elevated px-1.5 py-0.5 text-micro uppercase tracking-wider text-text-muted">
                {chain}
              </span>
              <span className="rounded-sm bg-primary-faint px-1.5 py-0.5 text-micro uppercase tracking-wider text-primary">
                Cabal #{signalTrades?.cluster_id}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <span className="num text-h2 font-semibold text-text-primary">
                {Number.isFinite(price)
                  ? price < 0.01
                    ? `$${price.toPrecision(4)}`
                    : `$${price.toFixed(4)}`
                  : "—"}
              </span>
              {Number.isFinite(change24h) ? (
                <span
                  className={cn(
                    "num text-body font-semibold",
                    change24h >= 0 ? "text-gain" : "text-loss",
                  )}
                >
                  {formatPct(change24h)} 24h
                </span>
              ) : null}
              {Number.isFinite(change1h) ? (
                <span
                  className={cn(
                    "num text-small",
                    change1h >= 0 ? "text-gain/80" : "text-loss/80",
                  )}
                >
                  {formatPct(change1h)} 1h
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {tokenId && (
              <Link
                href={`/tokens/${tokenId}`}
                onClick={close}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-small text-text-primary transition-colors hover:border-primary/40 hover:bg-primary-faint hover:text-primary"
              >
                Full page
                <ArrowSquareOut size={12} weight="bold" />
              </Link>
            )}
            <button
              onClick={close}
              className="grid h-8 w-8 place-items-center rounded-md text-text-secondary hover:bg-elevated hover:text-text-primary"
              aria-label="Close"
            >
              <X size={16} weight="bold" />
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="border-b border-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChartLineUp size={14} className="text-primary" weight="fill" />
              <span className="label-micro">Price</span>
            </div>
            <div className="flex gap-1">
              {INTERVALS.map((iv) => (
                <button
                  key={iv.value}
                  onClick={() => setInterval(iv.value)}
                  className={cn(
                    "rounded-md px-2 py-1 text-micro font-medium uppercase tracking-wider transition-colors",
                    interval === iv.value
                      ? "bg-elevated text-text-primary"
                      : "text-text-secondary hover:bg-elevated hover:text-text-primary",
                  )}
                >
                  {iv.label}
                </button>
              ))}
            </div>
          </div>
          <TokenPriceChart candlesRaw={candles} markers={chartMarkers} height={320} />
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-4 gap-px border-b border-border bg-border">
          <StatCell label="Liquidity" value={Number.isFinite(tvl) ? formatUsd(tvl) : "—"} />
          <StatCell label="Mcap" value={Number.isFinite(mcap) ? formatUsd(mcap) : "—"} />
          <StatCell label="Vol 24h" value={Number.isFinite(vol24) ? formatUsd(vol24) : "—"} />
          <StatCell
            label="Makers 24h"
            value={Number.isFinite(makers) ? Math.round(makers).toLocaleString() : "—"}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border px-4 pt-3">
          <TabButton
            active={tab === "cluster"}
            onClick={() => setTab("cluster")}
            icon={<Pulse size={12} weight="fill" />}
          >
            Cluster trades
            <Badge variant="exec" className="ml-1 num">
              {signalTrades?.trades?.length ?? 0}
            </Badge>
          </TabButton>
          <TabButton
            active={tab === "overview"}
            onClick={() => setTab("overview")}
            icon={<ShieldCheck size={12} weight="fill" />}
          >
            Risk & info
          </TabButton>
        </div>

        {/* Tab content */}
        <div className="p-4">
          {tab === "cluster" ? (
            tradesLoading ? (
              <div className="rounded-md border border-border bg-surface p-6 text-center text-small text-text-muted">
                Loading cluster trades…
              </div>
            ) : (
              <ClusterTradesList trades={signalTrades?.trades ?? []} />
            )
          ) : (
            <RiskPanel token={token} signalTrades={signalTrades} />
          )}
        </div>
      </aside>
    </>
  );
}

function StatCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-base px-4 py-3">
      <div className="label-micro">{label}</div>
      <div className="num mt-1 text-body font-semibold text-text-primary">
        {value}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-t-md px-3 py-2 text-small font-medium transition-colors",
        active
          ? "border-b-2 border-primary text-text-primary"
          : "text-text-secondary hover:text-text-primary",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function RiskPanel({ token, signalTrades }: { token: any; signalTrades: any }) {
  const risk = token?.risk_level;
  const score = token?.risk_score ?? token?.ave_risk_level;
  const holders = token?.holders;
  const wallets = signalTrades?.wallets ?? [];

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border bg-surface p-4">
        <div className="flex items-center gap-2">
          {risk && String(risk).toLowerCase() === "low" ? (
            <ShieldCheck size={14} className="text-primary" weight="fill" />
          ) : (
            <Warning size={14} className="text-warning" weight="fill" />
          )}
          <span className="label-micro">Risk Assessment</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-4">
          <InfoRow
            label="AVE risk"
            value={risk ? String(risk).toUpperCase() : "—"}
          />
          <InfoRow label="Score" value={score ?? "—"} />
          <InfoRow
            label="Holders"
            value={holders ? Number(holders).toLocaleString() : "—"}
          />
        </div>
      </div>

      <div className="rounded-md border border-border bg-surface p-4">
        <div className="label-micro mb-2">Cluster wallets ({wallets.length})</div>
        <ul className="space-y-1.5">
          {wallets.map((w: string) => (
            <li
              key={w}
              className="num flex items-center justify-between text-small text-text-primary"
            >
              <span className="truncate">{w}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="label-micro">{label}</div>
      <div className="num mt-0.5 text-body font-semibold text-text-primary">
        {value}
      </div>
    </div>
  );
}
