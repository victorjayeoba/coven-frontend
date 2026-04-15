"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Lightning,
  Pause,
  Play,
  Trash,
  CaretRight,
  ArrowSquareOut,
  Check,
} from "@phosphor-icons/react";
import { useState } from "react";
import { explorerAddressUrl, explorerName } from "@/lib/explorer";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import {
  useBot,
  useBotTrades,
  useDeleteBot,
  useToggleBotStatus,
} from "@/lib/hooks/useBots";
import { formatAddress, formatUsd, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";

export default function BotDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: bot, isLoading } = useBot(params.id);
  const { data: trades = [] } = useBotTrades(params.id);
  const toggle = useToggleBotStatus();
  const remove = useDeleteBot();

  if (isLoading) {
    return (
      <div className="p-10 text-center text-small text-text-muted">
        Loading bot…
      </div>
    );
  }
  if (!bot) {
    return (
      <div className="space-y-4">
        <Link
          href="/bots"
          className="inline-flex items-center gap-1 text-small text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft size={12} /> Back to bots
        </Link>
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-text-muted">
          Bot not found.
        </div>
      </div>
    );
  }

  const isActive = bot.status === "active";
  const TypeIcon = bot.type === "copy" ? Copy : Lightning;
  const typeColor = bot.type === "copy" ? "text-info" : "text-warning";
  const typeBg = bot.type === "copy" ? "bg-info/10" : "bg-warning/10";
  const winRate = bot.stats.trades
    ? (bot.stats.wins / bot.stats.trades) * 100
    : 0;

  const handleDelete = () => {
    if (confirm(`Delete bot "${bot.name}"?`)) {
      remove.mutate(bot.id, {
        onSuccess: () => router.push("/bots"),
      });
    }
  };

  const sizingLine =
    bot.type === "copy"
      ? bot.sizeMode === "fixed"
        ? `${formatUsd(bot.sizeUsd, 0)} fixed`
        : bot.sizeMode === "multiplier"
          ? `${bot.multiplier}× target size`
          : `${bot.percentOfTarget}% of target size`
      : `${formatUsd(bot.sizeUsd, 0)} per signal`;

  return (
    <div className="space-y-5">
      <Link
        href="/bots"
        className="inline-flex items-center gap-1 text-small text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft size={12} /> Back to bots
      </Link>

      <PageHeader
        title={bot.name}
        subtitle={
          bot.type === "copy"
            ? "Copy Trade Bot · mirrors a target wallet"
            : "Signal Trigger Bot · fires on conviction threshold"
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggle(bot)}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-small font-medium transition-colors",
                isActive
                  ? "border-border bg-surface text-text-secondary hover:text-text-primary"
                  : "border-primary/50 bg-primary-faint text-primary hover:border-primary",
              )}
            >
              {isActive ? (
                <>
                  <Pause size={12} weight="fill" /> Pause
                </>
              ) : (
                <>
                  <Play size={12} weight="fill" /> Resume
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-small font-medium text-text-secondary transition-colors hover:border-loss/40 hover:text-loss"
            >
              <Trash size={12} /> Delete
            </button>
          </div>
        }
      />

      {/* Identity / status row */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-4">
        <span className={cn("grid h-10 w-10 place-items-center rounded-md", typeBg)}>
          <TypeIcon size={18} weight="fill" className={typeColor} />
        </span>
        <div className="min-w-0">
          <div className="text-body font-semibold text-text-primary">
            {bot.name}
          </div>
          <div className="text-micro uppercase text-text-muted">
            {bot.type === "copy" ? "Copy Trade" : "Signal Trigger"} · {bot.chain}
            {" · "}
            Created {new Date(bot.createdAt).toLocaleDateString()}
          </div>
        </div>
        <span
          className={cn(
            "ml-auto inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[10px] font-semibold uppercase tracking-wide",
            isActive
              ? "bg-primary-faint text-primary"
              : "bg-elevated text-text-muted",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              isActive ? "bg-primary" : "bg-text-muted",
            )}
          />
          {bot.status}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="P&L"
          value={formatUsd(bot.stats.pnlUsd, 2)}
          accent={
            bot.stats.pnlUsd > 0
              ? "gain"
              : bot.stats.pnlUsd < 0
                ? "loss"
                : undefined
          }
        />
        <StatCard label="Trades" value={String(bot.stats.trades)} />
        <StatCard label="Win Rate" value={`${winRate.toFixed(1)}%`} />
        <StatCard
          label="Buy Size"
          value={sizingLine}
        />
      </div>

      {/* Config panels */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ConfigPanel title="Trigger">
          {bot.type === "copy" ? (
            <>
              <Row
                label="Target wallet"
                value={
                  <WalletLinks
                    chain={bot.chain}
                    address={bot.targetWallet}
                    label={bot.targetLabel}
                  />
                }
              />
              <Row
                label="Copy target's sells"
                value={bot.copyExits ? "Yes" : "No"}
              />
            </>
          ) : (
            <>
              <Row
                label="Min conviction"
                value={<span className="num">{bot.minConviction}+</span>}
              />
              <Row
                label="Cluster filter"
                value={bot.clusterFilter || "Any"}
              />
            </>
          )}
          <Row label="Network" value={bot.chain.toUpperCase()} />
        </ConfigPanel>

        <ConfigPanel title="Entry & Exit">
          <Row label="Sizing" value={sizingLine} />
          <Row
            label="Take profit"
            value={<span className="num text-gain">+{bot.takeProfitPct}%</span>}
          />
          <Row
            label="Stop loss"
            value={<span className="num text-loss">−{bot.stopLossPct}%</span>}
          />
          {bot.trailingStopPct > 0 && (
            <Row
              label="Trailing stop"
              value={<span className="num">{bot.trailingStopPct}%</span>}
            />
          )}
        </ConfigPanel>

        <ConfigPanel title="Risk & Safety" className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-3">
            <Row label="Max slippage" value={`${bot.maxSlippagePct}%`} />
            <Row label="Max concurrent" value={String(bot.maxConcurrent)} />
            <Row
              label="Daily loss limit"
              value={formatUsd(bot.dailyLossLimitUsd, 0)}
            />
            <Row
              label="Min liquidity"
              value={formatUsd(bot.minLiquidityUsd, 0)}
            />
            <Row label="Cooldown" value={`${bot.cooldownMin} min`} />
            <Row label="Anti-rug gates" value={bot.antiRug ? "On" : "Off"} />
          </div>
        </ConfigPanel>
      </div>

      {/* Paper trade log */}
      <div className="rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <span className="text-body font-semibold text-text-primary">
            Recent Activity
          </span>
          <span className="inline-flex items-center gap-1.5 text-micro text-text-muted">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Live paper trades · {trades.length}
          </span>
        </div>
        {trades.length === 0 ? (
          <div className="px-4 py-10 text-center text-small text-text-muted">
            No trades yet. When this bot fires, paper trades will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[600px] divide-y divide-border">
              {trades.slice(0, 50).map((t: any) => (
                <TradeRow key={t.id} trade={t} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TradeRow({ trade }: { trade: any }) {
  const entry = trade.entry || {};
  const exit = trade.exit || null;
  const isOpen = trade.status === "open";
  const pnlUsd = Number(trade.pnl_usd ?? 0);
  const pnlPct = Number(trade.pnl_pct ?? 0);
  const currPrice = Number(trade.current_price_usd ?? entry.price_usd ?? 0);
  const entryPrice = Number(entry.price_usd ?? 0);
  const livePct =
    entryPrice > 0 && currPrice > 0
      ? (currPrice / entryPrice - 1) * 100
      : 0;
  const shownPct = isOpen ? livePct : pnlPct;
  const tone = shownPct > 0 ? "gain" : shownPct < 0 ? "loss" : undefined;

  return (
    <Link
      href={`/tokens/${trade.token_id}`}
      className="grid grid-cols-[1fr_100px_110px_110px_90px] items-center gap-3 px-4 py-2.5 text-small transition-colors hover:bg-elevated"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate font-semibold text-text-primary">
            ${trade.symbol || trade.token_id?.split?.("-")?.[0]?.slice(0, 6)}
          </span>
          <span
            className={cn(
              "rounded-sm px-1 py-0.5 text-[10px] font-semibold uppercase",
              isOpen
                ? "bg-primary-faint text-primary"
                : "bg-elevated text-text-muted",
            )}
          >
            {isOpen ? "Open" : exit?.reason?.replace(/_/g, " ") || "Closed"}
          </span>
        </div>
        <div className="text-micro text-text-muted">
          {entry.trigger?.type === "signal"
            ? `Signal · conviction ${entry.trigger.conviction ?? "—"}`
            : entry.trigger?.type === "copy_entry"
              ? `Copied ${formatAddress(entry.trigger.source_wallet || "")}`
              : "Entry"}
        </div>
      </div>
      <div className="num text-right text-text-secondary">
        {formatUsd(Number(entry.size_usd) || 0, 0)}
      </div>
      <div className="num text-right text-text-secondary">
        {entryPrice > 0 ? formatUsd(entryPrice, 6) : "—"}
      </div>
      <div className={cn("num text-right", tone === "gain" ? "text-gain" : tone === "loss" ? "text-loss" : "text-text-secondary")}>
        {shownPct > 0 ? "+" : ""}
        {shownPct.toFixed(2)}%
        <div className="text-micro text-text-muted">
          {isOpen ? formatUsd(currPrice, 6) : formatUsd(Number(exit?.price_usd) || 0, 6)}
        </div>
      </div>
      <div className="text-right text-micro text-text-muted">
        {formatRelativeTime(entry.timestamp || trade.opened_at)}
      </div>
    </Link>
  );
}

function ConfigPanel({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="text-body font-semibold text-text-primary">
          {title}
        </span>
        <CaretRight size={12} className="text-text-muted" />
      </div>
      <div className="space-y-1 px-4 py-3">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-1 text-small">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-text-primary">{value}</span>
    </div>
  );
}

function WalletLinks({
  chain,
  address,
  label,
}: {
  chain: string;
  address: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  if (!address) return <span className="text-text-muted">—</span>;

  const explorer = explorerAddressUrl(chain, address);
  const explorerLabel = explorerName(chain);

  // Trader-focused external views
  const gmgn =
    chain === "solana"
      ? `https://gmgn.ai/sol/address/${address}`
      : chain === "bsc"
        ? `https://gmgn.ai/bsc/address/${address}`
        : null;
  const cielo = `https://app.cielo.finance/profile/${address}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {label && (
        <span className="text-text-secondary">{label} ·</span>
      )}
      <span className="num font-mono text-text-primary">
        {formatAddress(address)}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className="grid h-6 w-6 place-items-center rounded border border-border bg-surface text-text-muted transition-colors hover:border-primary/40 hover:text-primary"
        title="Copy address"
      >
        {copied ? <Check size={10} weight="bold" /> : <Copy size={10} />}
      </button>
      {explorer && (
        <a
          href={explorer}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-6 items-center gap-1 rounded border border-border bg-surface px-1.5 text-micro text-text-secondary transition-colors hover:border-primary/40 hover:text-primary"
          title={`Open on ${explorerLabel}`}
        >
          {explorerLabel}
          <ArrowSquareOut size={9} />
        </a>
      )}
      {gmgn && (
        <a
          href={gmgn}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-6 items-center gap-1 rounded border border-border bg-surface px-1.5 text-micro text-text-secondary transition-colors hover:border-primary/40 hover:text-primary"
          title="Open on GMGN — shows live trades, P&L, win rate"
        >
          GMGN
          <ArrowSquareOut size={9} />
        </a>
      )}
      <a
        href={cielo}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-6 items-center gap-1 rounded border border-border bg-surface px-1.5 text-micro text-text-secondary transition-colors hover:border-primary/40 hover:text-primary"
        title="Open on Cielo trader dashboard"
      >
        Cielo
        <ArrowSquareOut size={9} />
      </a>
    </div>
  );
}
