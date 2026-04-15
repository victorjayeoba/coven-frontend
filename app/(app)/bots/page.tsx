"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Robot,
  Copy,
  Lightning,
  Sparkle,
  TrendUp,
  ShieldCheck,
  ArrowRight,
} from "@phosphor-icons/react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { BotCard } from "@/components/bots/BotCard";
import { NewBotModal } from "@/components/bots/NewBotModal";
import { useBots } from "@/lib/hooks/useBots";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/cn";

type Filter = "all" | "copy" | "signal" | "active" | "paused";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "copy", label: "Copy Trade" },
  { id: "signal", label: "Signal Trigger" },
  { id: "active", label: "Active" },
  { id: "paused", label: "Paused" },
];

export default function BotsPage() {
  const { data: bots = [], isLoading } = useBots();
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  const stats = useMemo(() => {
    const active = bots.filter((b) => b.status === "active").length;
    const totalPnl = bots.reduce((s, b) => s + b.stats.pnlUsd, 0);
    const totalTrades = bots.reduce((s, b) => s + b.stats.trades, 0);
    return { total: bots.length, active, totalPnl, totalTrades };
  }, [bots]);

  const filtered = useMemo(() => {
    switch (filter) {
      case "copy":
        return bots.filter((b) => b.type === "copy");
      case "signal":
        return bots.filter((b) => b.type === "signal");
      case "active":
        return bots.filter((b) => b.status === "active");
      case "paused":
        return bots.filter((b) => b.status === "paused");
      default:
        return bots;
    }
  }, [bots, filter]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Bots"
        subtitle="Automated paper-trading bots for copy trading and signal triggers"
        actions={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-small font-semibold text-base transition-colors hover:bg-primary-hover"
          >
            <Plus size={14} weight="bold" /> New Bot
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total Bots"
          value={String(stats.total)}
          icon={<Robot size={14} />}
        />
        <StatCard
          label="Active"
          value={String(stats.active)}
          sub={<span>{stats.total - stats.active} paused</span>}
        />
        <StatCard
          label="Total P&L"
          value={formatUsd(stats.totalPnl, 2)}
          accent={
            stats.totalPnl > 0 ? "gain" : stats.totalPnl < 0 ? "loss" : undefined
          }
        />
        <StatCard
          label="Trades Executed"
          value={String(stats.totalTrades)}
        />
      </div>

      {/* Filter tabs */}
      {bots.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 border-b border-border">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            const count =
              f.id === "all"
                ? bots.length
                : f.id === "copy"
                  ? bots.filter((b) => b.type === "copy").length
                  : f.id === "signal"
                    ? bots.filter((b) => b.type === "signal").length
                    : f.id === "active"
                      ? bots.filter((b) => b.status === "active").length
                      : bots.filter((b) => b.status === "paused").length;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  "relative -mb-px h-9 px-3 text-small font-medium transition-colors",
                  active
                    ? "text-text-primary"
                    : "text-text-muted hover:text-text-secondary",
                )}
              >
                {f.label}
                <span className="num ml-1.5 rounded-sm bg-elevated px-1.5 text-micro text-text-secondary">
                  {count}
                </span>
                {active && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      {bots.length === 0 ? (
        <EmptyState onCreate={() => setModalOpen(true)} />
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-small text-text-muted">
          No bots match this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((bot) => (
            <BotCard key={bot.id} bot={bot} />
          ))}
        </div>
      )}

      <NewBotModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -left-40 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -top-24 h-[360px] w-[360px] rounded-full bg-info/10 blur-3xl" />
      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(60,196,123,1) 1px, transparent 1px), linear-gradient(90deg, rgba(60,196,123,1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative grid grid-cols-1 gap-10 p-8 md:grid-cols-[1.1fr_1fr] md:p-12 lg:gap-16">
        {/* LEFT — hero pitch */}
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-surface/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Paper trading · no real funds
          </div>

          <h3 className="mt-5 font-display text-[44px] leading-[0.95] text-text-primary md:text-[52px]">
            Launch your
            <br />
            <span className="italic text-primary">first bot</span>.
          </h3>

          <p className="mt-4 max-w-md text-body text-text-secondary">
            Automate what you'd do by hand. Mirror a sharp wallet, or let
            conviction scores pull the trigger — 24/7, in the background.
          </p>

          {/* Feature rows */}
          <ul className="mt-6 space-y-2">
            <FeatureRow
              icon={<TrendUp size={12} weight="fill" />}
              label="Take-profit, stop-loss & trailing stops"
            />
            <FeatureRow
              icon={<ShieldCheck size={12} weight="fill" />}
              label="Anti-rug gates & min-liquidity filters"
            />
            <FeatureRow
              icon={<Sparkle size={12} weight="fill" />}
              label="Live conviction routing on every signal"
            />
          </ul>

          <button
            type="button"
            onClick={onCreate}
            className="group mt-7 inline-flex h-11 w-fit items-center gap-2 rounded-lg bg-primary px-5 text-body font-semibold text-base shadow-[0_10px_30px_rgba(60,196,123,0.35)] transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_14px_40px_rgba(60,196,123,0.5)]"
          >
            <Plus size={16} weight="bold" />
            Create your first bot
            <ArrowRight
              size={14}
              weight="bold"
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
        </div>

        {/* RIGHT — strategy cards stacked */}
        <div className="flex flex-col gap-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
            Pick a strategy
          </div>
          <TypeTeaser
            icon={<Copy size={18} weight="fill" />}
            title="Copy Trade"
            desc="Mirror a wallet's entries and optional exits. Size by fixed USD, multiplier, or % of target."
            bullets={["1:1 mirroring", "Size modes", "Copy exits"]}
            accent="info"
            onClick={onCreate}
          />
          <TypeTeaser
            icon={<Lightning size={18} weight="fill" />}
            title="Signal Trigger"
            desc="Auto-enter when cluster conviction crosses your threshold. Filter by chain, cluster, and risk."
            bullets={["Conviction gate", "Cluster filter", "Fastest path"]}
            accent="warning"
            onClick={onCreate}
          />
        </div>
      </div>
    </div>
  );
}

function FeatureRow({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <li className="flex items-center gap-2.5 text-small text-text-secondary">
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-primary-faint text-primary">
        {icon}
      </span>
      {label}
    </li>
  );
}

function TypeTeaser({
  icon,
  title,
  desc,
  bullets,
  accent,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  bullets: string[];
  accent: "info" | "warning";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex-1 overflow-hidden rounded-xl border border-border bg-surface/70 p-5 text-left backdrop-blur transition-all",
        "hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface hover:shadow-[0_12px_32px_rgba(0,0,0,0.35)]",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-0.5 opacity-0 transition-opacity group-hover:opacity-100",
          accent === "info"
            ? "bg-gradient-to-r from-transparent via-info to-transparent"
            : "bg-gradient-to-r from-transparent via-warning to-transparent",
        )}
      />
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-lg transition-transform group-hover:scale-105",
            accent === "info"
              ? "bg-gradient-to-br from-info/25 to-info/5 text-info"
              : "bg-gradient-to-br from-warning/25 to-warning/5 text-warning",
          )}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="text-body-lg font-semibold text-text-primary">
              {title}
            </div>
            <ArrowRight
              size={14}
              className="shrink-0 text-text-muted transition-all group-hover:translate-x-0.5 group-hover:text-primary"
            />
          </div>
          <p className="mt-1 text-small leading-relaxed text-text-secondary">
            {desc}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {bullets.map((b) => (
              <span
                key={b}
                className="rounded-sm border border-border bg-base/60 px-1.5 py-0.5 text-[10px] font-medium text-text-muted"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}
