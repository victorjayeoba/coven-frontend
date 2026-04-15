"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowSquareOut,
  ChartLineUp,
  Copy,
  Check,
  Lightning,
  ShieldCheck,
  UsersThree,
  Warning,
  ArrowsLeftRight,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { TokenPriceChart } from "@/components/drawer/TokenPriceChart";
import { TokenDexscreenerChart } from "@/components/tokens/TokenDexscreenerChart";
import { TokenTxsPanel } from "@/components/tokens/TokenTxsPanel";
import { useDexscreenerToken } from "@/lib/hooks/useDexscreener";
import {
  useTokenCandles,
  useTokenDetail,
  useTokenRisk,
  useTokenSignals,
  useTokenSmartHolders,
} from "@/lib/hooks/useTokenDetail";
import {
  formatAddress,
  formatPct,
  formatRelativeTime,
  formatUsd,
} from "@/lib/format";
import { explorerAddressUrl, explorerName } from "@/lib/explorer";
import { cn } from "@/lib/cn";

const CHAIN_DOT: Record<string, string> = {
  solana: "bg-chain-solana",
  bsc: "bg-chain-bsc",
  eth: "bg-chain-eth",
  base: "bg-chain-base",
};

const INTERVALS = [
  { label: "15m", value: 15 },
  { label: "1h", value: 60 },
  { label: "4h", value: 240 },
  { label: "1d", value: 1440 },
];

const STATUS_VARIANT: Record<string, any> = {
  exec: "exec",
  partial: "partial",
  watch: "watch",
  blocked: "blocked",
};

type Tab = "signals" | "holders" | "txs" | "risk";

export default function TokenPage({
  params,
}: {
  params: { id: string };
}) {
  const { id: tokenId } = params;

  const [interval, setInterval] = useState(60);
  const [tab, setTab] = useState<Tab>("signals");
  const [copied, setCopied] = useState(false);

  const { data: detail, isLoading: isDetailLoading } = useTokenDetail(tokenId);
  const { data: candles } = useTokenCandles(tokenId, interval, 300);
  const { data: risk, isLoading: isRiskLoading } = useTokenRisk(tokenId);
  const { data: signals, isLoading: isSignalsLoading } = useTokenSignals(tokenId);
  const { data: smartHolders, isLoading: isHoldersLoading } = useTokenSmartHolders(tokenId);
  const { data: dex, isLoading: isDexLoading } = useDexscreenerToken(tokenId, { refetchMs: 10_000 });

  const token = useMemo(() => {
    if (!detail) return null;
    return detail.token && typeof detail.token === "object"
      ? detail.token
      : detail;
  }, [detail]);

  const contract = tokenId.includes("-")
    ? tokenId.slice(0, tokenId.lastIndexOf("-"))
    : tokenId;
  const chain = token?.chain ?? (tokenId.includes("-") ? tokenId.split("-").pop() : "");

  const symbol = token?.symbol ?? "?";
  const name = token?.name;
  const holders = Number(token?.holders ?? NaN);
  const launchAt = Number(token?.launch_at ?? NaN);
  const ageHours = Number.isFinite(launchAt) && launchAt > 0
    ? (Date.now() / 1000 - launchAt) / 3600
    : null;

  const allSignals = Array.isArray(signals) ? signals : [];
  const holdersList = Array.isArray(smartHolders) ? smartHolders : [];

  // Chart + data source auto-detect. We default to DexScreener because 90%
  // of copy-traded tokens aren't in AVE's deep index (fresh memes) — and the
  // "DexScreener for a beat, flip to native" transition was visually jarring.
  //
  // We commit ONCE, synchronously, at first render based on the React Query
  // cache. If the token was pre-loaded (e.g. user clicked from the signals
  // feed which already prefetched detail+candles) we can detect deep AVE
  // coverage before paint and start in native mode. Otherwise → dex and
  // stay there. No skeleton, no flip.
  const qc = useQueryClient();
  const AVE_MIN_CANDLES = 40;
  const [chartMode] = useState<"native" | "dex">(() => {
    try {
      const cachedDetail: any = qc.getQueryData(["token-detail", tokenId]);
      const cachedCandles: any = qc.getQueryData([
        "token-candles",
        tokenId,
        interval,
        300,
      ]);
      const tok =
        (cachedDetail?.token && typeof cachedDetail.token === "object"
          ? cachedDetail.token
          : cachedDetail) || null;
      const hasPrice =
        tok && Number(tok.current_price_usd ?? 0) > 0;
      const points =
        (cachedCandles &&
          (cachedCandles.points ||
            cachedCandles.list ||
            cachedCandles.data ||
            cachedCandles.klines)) ||
        [];
      const count = Array.isArray(points) ? points.length : 0;
      if (hasPrice && count >= AVE_MIN_CANDLES) return "native";
    } catch {}
    return "dex";
  });

  // If we were on the Transactions tab and this token has no AVE coverage,
  // fall back to Signals — DexScreener's iframe already shows trades.
  useEffect(() => {
    if (chartMode === "dex" && tab === "txs") setTab("signals");
  }, [chartMode, tab]);

  // Source of truth for the price / market stats follows the chart.
  // While chartMode is still being decided, default to DexScreener data so
  // the header numbers render from the snappier source immediately.
  const useAve = chartMode === "native";
  const price = Number(
    useAve
      ? token?.current_price_usd ?? dex?.priceUsd
      : dex?.priceUsd ?? token?.current_price_usd,
  );
  const change24h = Number(
    useAve
      ? token?.token_price_change_24h ?? dex?.priceChange24h
      : dex?.priceChange24h ?? token?.token_price_change_24h,
  );
  const change1h = Number(
    useAve
      ? token?.token_price_change_1h ?? dex?.priceChange1h
      : dex?.priceChange1h ?? token?.token_price_change_1h,
  );
  const mcap = Number(
    useAve ? token?.market_cap ?? dex?.marketCap : dex?.marketCap ?? token?.market_cap,
  );
  const fdv = Number(
    useAve ? token?.fdv ?? dex?.fdv : dex?.fdv ?? token?.fdv,
  );
  const tvl = Number(
    useAve
      ? token?.main_pair_tvl ?? token?.tvl ?? dex?.liquidityUsd
      : dex?.liquidityUsd ?? token?.main_pair_tvl ?? token?.tvl,
  );
  const vol24 = Number(
    useAve
      ? token?.token_tx_volume_usd_24h ?? dex?.volume24h
      : dex?.volume24h ?? token?.token_tx_volume_usd_24h,
  );

  const explorerUrl = explorerAddressUrl(chain, contract);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contract);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/signals"
          className="inline-flex items-center gap-1 text-small text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft size={12} weight="bold" /> Back
        </Link>
      </div>

      {/* HERO */}
      {isDetailLoading && isDexLoading ? (
        <div className="relative overflow-hidden rounded-lg border border-border bg-surface p-5 animate-pulse">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-border" />
            <div className="space-y-3 flex-1 w-full">
              <div className="h-8 w-1/3 bg-border rounded" />
              <div className="h-4 w-1/2 bg-border rounded" />
              <div className="h-6 w-1/4 bg-border rounded mt-2" />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-lg border border-border bg-surface p-5">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 600px 200px at 0% 0%, rgba(60,196,123,0.08), transparent 60%)",
            }}
          />

          <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center md:items-start gap-4">
              <TokenLogo
                symbol={symbol}
                chain={chain}
                tokenId={tokenId}
                logoUrl={token?.logo_url}
                size={48}
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-h1 font-semibold text-text-primary">
                    ${symbol}
                  </h1>
                  {name && (
                    <span className="text-body text-text-secondary">{name}</span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full bg-elevated px-2 py-0.5 text-micro uppercase tracking-wider text-text-secondary">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        CHAIN_DOT[chain ?? ""] ?? "bg-text-muted",
                      )}
                    />
                    {chain}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <button
                    onClick={copy}
                    className="inline-flex items-center gap-1 text-micro text-text-muted hover:text-text-primary"
                    title="Copy contract"
                  >
                    <span className="num">{formatAddress(contract, 6, 6)}</span>
                    {copied ? (
                      <Check size={10} weight="bold" className="text-primary" />
                    ) : (
                      <Copy size={10} />
                    )}
                  </button>
                  {explorerUrl && (
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-micro text-text-muted hover:text-text-primary"
                    >
                      {explorerName(chain)}
                      <ArrowSquareOut size={10} weight="bold" />
                    </a>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-baseline gap-3">
                  <span className="relative inline-flex items-baseline gap-2">
                    <span
                      className="relative inline-flex h-1.5 w-1.5 shrink-0 self-center"
                      title={
                        useAve
                          ? "Live — streaming from AVE"
                          : "Live — polling DexScreener every 10s"
                      }
                    >
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>
                    <span className="num text-display font-semibold text-text-primary">
                      {Number.isFinite(price)
                        ? price < 0.01
                          ? `$${price.toPrecision(4)}`
                          : `$${price.toFixed(price < 1 ? 4 : 2)}`
                        : "—"}
                    </span>
                  </span>
                  {Number.isFinite(change24h) && (
                    <span
                      className={cn(
                        "num text-body font-semibold",
                        change24h >= 0 ? "text-gain" : "text-loss",
                      )}
                    >
                      {formatPct(change24h)} 24h
                    </span>
                  )}
                  {Number.isFinite(change1h) && (
                    <span
                      className={cn(
                        "num text-small",
                        change1h >= 0 ? "text-gain/80" : "text-loss/80",
                      )}
                    >
                      {formatPct(change1h)} 1h
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Low-float warning */}
      {Number.isFinite(mcap) && Number.isFinite(fdv) && fdv > 0 && mcap > 0 && fdv / mcap > 1.5 && (
        <div className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-small text-warning">
          <span className="font-semibold uppercase tracking-wider text-micro">Low-float warning</span>
          <span className="text-text-secondary">
            FDV is <span className="num font-semibold">{(fdv / mcap).toFixed(1)}×</span> the circulating cap
            ({formatUsd(mcap)} circulating vs {formatUsd(fdv)} fully diluted) —
            unlocks could dilute the price.
          </span>
        </div>
      )}

      {/* STATS */}
      {isDetailLoading && isDexLoading ? (
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 md:grid-cols-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface px-4 py-3 space-y-2">
              <div className="h-3 w-1/2 bg-border rounded" />
              <div className="h-5 w-3/4 bg-border rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 md:grid-cols-6">
          <Stat label="Mcap" value={formatUsd(mcap)} />
          <Stat label="FDV" value={formatUsd(fdv)} />
          <Stat label="Liquidity" value={formatUsd(tvl)} />
          <Stat label="Vol 24h" value={formatUsd(vol24)} />
          <Stat
            label="Holders"
            value={Number.isFinite(holders) ? holders.toLocaleString() : "—"}
          />
          <Stat
            label="Age"
            value={
              ageHours === null
                ? "—"
                : ageHours < 24
                  ? `${Math.round(ageHours)}h`
                  : `${Math.round(ageHours / 24)}d`
            }
          />
        </div>
      )}

      {/* CHART */}
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-2">
            <ChartLineUp size={13} className="text-primary" weight="fill" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
              Price · Volume
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
                chartMode === "native"
                  ? "bg-primary-faint text-primary"
                  : "bg-elevated text-text-secondary",
              )}
              title={
                chartMode === "native"
                  ? "Streaming from AVE · live price markers enabled"
                  : "Streaming from DexScreener"
              }
            >
              <span
                className={cn(
                  "h-1 w-1 rounded-full",
                  chartMode === "native" ? "animate-pulse bg-primary" : "bg-text-muted",
                )}
              />
              {chartMode === "native" ? "AVE · Live" : "DexScreener"}
            </span>
          </div>
          {chartMode === "native" && (
            <div className="flex gap-0.5 rounded-md border border-border bg-base p-0.5">
              {INTERVALS.map((iv) => (
                <button
                  key={iv.value}
                  onClick={() => setInterval(iv.value)}
                  className={cn(
                    "rounded px-2 py-1 text-micro font-medium uppercase tracking-wider transition-colors",
                    interval === iv.value
                      ? "bg-elevated text-text-primary"
                      : "text-text-muted hover:text-text-secondary",
                  )}
                >
                  {iv.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {chartMode === "dex" ? (
          <TokenDexscreenerChart tokenId={tokenId} height={520} />
        ) : (
          <div className="p-3">
            <TokenPriceChart
              candlesRaw={candles}
              height={440}
              tokenId={tokenId}
              intervalMinutes={interval}
            />
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="rounded-lg border border-border bg-surface">
        <div className="flex gap-1 border-b border-border px-4 pt-2 overflow-x-auto scrollbar-hide">
          <TabButton
            active={tab === "signals"}
            onClick={() => setTab("signals")}
            icon={<Lightning size={12} weight="fill" />}
          >
            Signals
            <Badge variant="exec" className="ml-1 num">
              {allSignals.length}
            </Badge>
          </TabButton>
          <TabButton
            active={tab === "holders"}
            onClick={() => setTab("holders")}
            icon={<UsersThree size={12} weight="fill" />}
          >
            Smart holders
            <Badge variant="default" className="ml-1 num">
              {holdersList.length}
            </Badge>
          </TabButton>
          {chartMode === "native" && (
            <TabButton
              active={tab === "txs"}
              onClick={() => setTab("txs")}
              icon={<ArrowsLeftRight size={12} weight="fill" />}
            >
              Transactions
              <span className="ml-1 inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            </TabButton>
          )}


          <TabButton
            active={tab === "risk"}
            onClick={() => setTab("risk")}
            icon={<ShieldCheck size={12} weight="fill" />}
          >
            Risk
          </TabButton>
        </div>
        <div className="p-4">
          {tab === "signals" && <SignalsPanel signals={allSignals} />}
          {tab === "holders" && <HoldersPanel holders={holdersList} />}
          {tab === "txs" && (
            <TokenTxsPanel tokenId={tokenId} chain={chain ?? undefined} />
          )}
          {tab === "risk" && <RiskPanel risk={risk} token={token} />}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="bg-surface px-4 py-3">
      <div className="label-micro">{label}</div>
      <div className="num mt-1 text-body-lg font-semibold text-text-primary">
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
        "inline-flex shrink-0 items-center gap-2 rounded-t-md px-3 py-2 text-small font-medium transition-colors",
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

function SignalsPanel({ signals }: { signals: any[] }) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  if (signals.length === 0) {
    return (
      <div className="rounded-md border border-border bg-base/40 p-6 text-center text-small text-text-muted">
        No cluster signals fired on this token.
      </div>
    );
  }

  const start = page * pageSize;
  const pageRows = signals.slice(start, start + pageSize);

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-[70px_90px_100px_90px_90px_90px] gap-3 border-b border-border bg-base/40 px-3 py-2 text-micro font-medium uppercase tracking-wider text-text-muted">
            <div>Source</div>
            <div>Cabal</div>
            <div className="text-right">Wallets</div>
            <div className="text-right">Conviction</div>
            <div className="text-right">Peak P&L</div>
            <div className="text-right">Detected</div>
          </div>
          <ul className="divide-y divide-border">
            {pageRows.map((s: any) => (
              <li
                key={s.id}
                className="grid grid-cols-[70px_90px_100px_90px_90px_90px] items-center gap-3 px-3 py-2 text-small transition-colors hover:bg-elevated"
              >
                <span
                  className={cn(
                    "inline-flex rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                    s.source === "live"
                      ? "bg-primary-faint text-primary"
                      : "bg-elevated text-text-secondary",
                  )}
                >
                  {s.source}
                </span>
                <span className="text-text-primary">Cabal #{s.cluster_id}</span>
                <span className="num text-right text-text-secondary">
                  {s.cluster_active_count}/{s.cluster_size_total}
                </span>
                <span
                  className={cn(
                    "num text-right font-semibold",
                    (s.conviction_score ?? 0) >= 70
                      ? "text-primary"
                      : (s.conviction_score ?? 0) >= 40
                        ? "text-warning"
                        : "text-text-secondary",
                  )}
                >
                  {s.conviction_score ?? 0}
                </span>
                <span
                  className={cn(
                    "num text-right",
                    (s.peak_pnl_pct ?? 0) >= 0 ? "text-gain" : "text-loss",
                  )}
                >
                  {s.peak_pnl_pct !== undefined && s.peak_pnl_pct !== null
                    ? formatPct(s.peak_pnl_pct)
                    : "—"}
                </span>
                <span className="num text-right text-micro text-text-muted">
                  {s.detected_at ? formatRelativeTime(s.detected_at) : "—"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Pagination
        total={signals.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(n) => {
          setPageSize(n);
          setPage(0);
        }}
      />
    </div>
  );
}

function HoldersPanel({ holders }: { holders: any[] }) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  if (holders.length === 0) {
    return (
      <div className="rounded-md border border-border bg-base/40 p-6 text-center text-small text-text-muted">
        No smart-money wallets currently hold this token.
      </div>
    );
  }

  // Sort: wallets with real balance/pnl first, then alpha
  const sorted = [...holders].sort((a, b) => {
    const aBal = Number(a.balance_usd) || 0;
    const bBal = Number(b.balance_usd) || 0;
    if (aBal !== bBal) return bBal - aBal;
    return (Number(b.alpha_score) || 0) - (Number(a.alpha_score) || 0);
  });

  const start = page * pageSize;
  const pageRows = sorted.slice(start, start + pageSize);

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-[minmax(0,1fr)_80px_110px_110px_90px] gap-3 border-b border-border bg-base/40 px-3 py-2 text-micro font-medium uppercase tracking-wider text-text-muted">
            <div>Wallet</div>
            <div>Cabal</div>
            <div className="text-right">Balance</div>
            <div className="text-right">Lifetime P&L</div>
            <div className="text-right">Alpha</div>
          </div>
          <ul className="divide-y divide-border">
            {pageRows.map((h: any) => (
              <li
                key={h.address}
                className="grid grid-cols-[minmax(0,1fr)_80px_110px_110px_90px] items-center gap-3 px-3 py-2 text-small transition-colors hover:bg-elevated"
              >
                <Link
                  href={`/wallets/${h.address}`}
                  className="num truncate text-text-primary hover:underline"
                >
                  {formatAddress(h.address, 6, 4)}
                </Link>
                <span className="text-micro uppercase tracking-wider text-text-secondary">
                  {h.cluster_id !== null && h.cluster_id !== undefined
                    ? `#${h.cluster_id}`
                    : "—"}
                </span>
                <span className="num text-right text-text-primary">
                  {formatUsd(h.balance_usd)}
                </span>
                <span
                  className={cn(
                    "num text-right font-semibold",
                    (h.total_profit ?? 0) >= 0 ? "text-gain" : "text-loss",
                  )}
                >
                  {formatUsd(h.total_profit)}
                </span>
                <span className="num text-right text-text-secondary">
                  {Number(h.alpha_score ?? 0).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Pagination
        total={sorted.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(n) => {
          setPageSize(n);
          setPage(0);
        }}
      />
    </div>
  );
}

function RiskPanel({ risk, token }: { risk: any; token: any }) {
  if (!risk) {
    return (
      <div className="rounded-md border border-border bg-base/40 p-6 text-center text-small text-text-muted">
        Loading risk report…
      </div>
    );
  }

  const flag = (v: any): "yes" | "no" | "unknown" => {
    if (v === null || v === undefined) return "unknown";
    if (typeof v === "number") {
      if (v === 0) return "no";
      if (v === 1) return "yes";
      return "unknown";
    }
    if (typeof v === "string") {
      if (v === "0" || v.toLowerCase() === "false") return "no";
      if (v === "1" || v.toLowerCase() === "true") return "yes";
      return "unknown";
    }
    return "unknown";
  };

  const rows = [
    { label: "Honeypot", key: "is_honeypot", bad: "yes" as const },
    { label: "Cannot sell all", key: "cannot_sell_all", bad: "yes" as const },
    { label: "Cannot buy", key: "cannot_buy", bad: "yes" as const },
    { label: "Mintable", key: "has_mint_method", bad: "yes" as const },
    { label: "Hidden owner", key: "hidden_owner", bad: "yes" as const },
    { label: "Transfer pausable", key: "transfer_pausable", bad: "yes" as const },
    { label: "Blacklist method", key: "has_black_method", bad: "yes" as const },
    { label: "Proxy contract", key: "is_proxy", bad: "yes" as const },
    { label: "Trusted token", key: "trust_list", bad: "no" as const },
  ];

  const buyTax = Number(risk.buy_tax ?? 0) * 100;
  const sellTax = Number(risk.sell_tax ?? 0) * 100;
  const riskScore = Number(risk.risk_score ?? risk.analysis_risk_score ?? NaN);
  const aiLevel = risk.ai_report?.summary?.risk_level;

  return (
    <div className="space-y-3">
      {/* Summary line */}
      <div className="flex flex-wrap items-center gap-3">
        {aiLevel && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-small font-semibold uppercase tracking-wider",
              String(aiLevel).toLowerCase() === "low"
                ? "bg-primary-faint text-primary"
                : String(aiLevel).toLowerCase() === "medium"
                  ? "bg-warning/10 text-warning"
                  : "bg-loss/10 text-loss",
            )}
          >
            <ShieldCheck size={12} weight="fill" />
            {aiLevel} risk
          </span>
        )}
        {Number.isFinite(riskScore) && (
          <span className="num text-small text-text-secondary">
            AVE risk score:{" "}
            <span className="font-semibold text-text-primary">
              {Math.round(riskScore)}
            </span>
            /100
          </span>
        )}
        <span className="num text-small text-text-secondary">
          Buy tax{" "}
          <span
            className={cn(
              "font-semibold",
              buyTax > 10 ? "text-loss" : "text-text-primary",
            )}
          >
            {buyTax.toFixed(1)}%
          </span>
        </span>
        <span className="num text-small text-text-secondary">
          Sell tax{" "}
          <span
            className={cn(
              "font-semibold",
              sellTax > 10 ? "text-loss" : "text-text-primary",
            )}
          >
            {sellTax.toFixed(1)}%
          </span>
        </span>
      </div>

      {/* Checks */}
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 md:grid-cols-3">
        {rows.map((r) => {
          const state = flag(risk[r.key]);
          const isBad = state === r.bad;
          const isGood = state !== "unknown" && !isBad;
          return (
            <div
              key={r.key}
              className="flex items-center justify-between gap-2 bg-surface px-3 py-2.5"
            >
              <span className="text-small text-text-secondary">{r.label}</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  isGood && "bg-primary-faint text-primary",
                  isBad && "bg-loss/10 text-loss",
                  state === "unknown" && "bg-elevated text-text-muted",
                )}
              >
                {isBad && <Warning size={10} weight="fill" />}
                {isGood && <ShieldCheck size={10} weight="fill" />}
                {state === "unknown" ? "unknown" : isBad ? "risk" : "ok"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
