"use client";

import Link from "next/link";
import {
  Copy,
  Lightning,
  Pause,
  Play,
  Trash,
  ArrowRight,
} from "@phosphor-icons/react";
import { Bot } from "@/lib/stores/useBotsStore";
import { useDeleteBot, useToggleBotStatus } from "@/lib/hooks/useBots";
import { formatUsd, formatAddress } from "@/lib/format";
import { cn } from "@/lib/cn";

export function BotCard({ bot }: { bot: Bot }) {
  const toggle = useToggleBotStatus();
  const remove = useDeleteBot();

  const isActive = bot.status === "active";
  const TypeIcon = bot.type === "copy" ? Copy : Lightning;
  const typeColor = bot.type === "copy" ? "text-info" : "text-warning";
  const typeBg = bot.type === "copy" ? "bg-info/10" : "bg-warning/10";

  const winRate = bot.stats.trades
    ? (bot.stats.wins / bot.stats.trades) * 100
    : 0;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm(`Delete bot "${bot.name}"?`)) remove.mutate(bot.id);
  };

  return (
    <Link
      href={`/bots/${bot.id}`}
      className="group block rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "grid h-8 w-8 shrink-0 place-items-center rounded-md",
              typeBg,
            )}
          >
            <TypeIcon size={15} weight="fill" className={typeColor} />
          </span>
          <div className="min-w-0">
            <div className="truncate text-body font-semibold text-text-primary">
              {bot.name}
            </div>
            <div className="flex items-center gap-1.5 text-micro text-text-muted">
              <span className="uppercase">
                {bot.type === "copy" ? "Copy Trade" : "Signal Trigger"}
              </span>
              <span>·</span>
              <span className="uppercase">{bot.chain}</span>
            </div>
          </div>
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
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

      {/* Target / trigger */}
      <div className="mt-3 rounded-md border border-border bg-input px-3 py-2 text-small">
        {bot.type === "copy" ? (
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Target</span>
            <span className="num font-medium text-text-primary">
              {bot.targetLabel || formatAddress(bot.targetWallet)}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Min conviction</span>
            <span className="num font-medium text-text-primary">
              {bot.minConviction}+
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat
          label="P&L"
          value={formatUsd(bot.stats.pnlUsd, 2)}
          tone={
            bot.stats.pnlUsd > 0
              ? "gain"
              : bot.stats.pnlUsd < 0
                ? "loss"
                : undefined
          }
        />
        <Stat label="Trades" value={String(bot.stats.trades)} />
        <Stat label="Win %" value={`${winRate.toFixed(0)}%`} />
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-1.5">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggle(bot);
          }}
          className={cn(
            "inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md border text-small font-medium transition-colors",
            isActive
              ? "border-border bg-surface text-text-secondary hover:bg-elevated hover:text-text-primary"
              : "border-primary/40 bg-primary-faint text-primary hover:border-primary",
          )}
        >
          {isActive ? <Pause size={12} weight="fill" /> : <Play size={12} weight="fill" />}
          {isActive ? "Pause" : "Resume"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="grid h-8 w-8 place-items-center rounded-md border border-border bg-surface text-text-muted transition-colors hover:border-loss/40 hover:text-loss"
          title="Delete bot"
        >
          <Trash size={12} />
        </button>
        <span className="grid h-8 w-8 place-items-center rounded-md border border-border bg-surface text-text-muted transition-colors group-hover:border-border-strong group-hover:text-text-primary">
          <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "gain" | "loss";
}) {
  return (
    <div className="rounded-md bg-input px-2 py-1.5">
      <div className="label-micro">{label}</div>
      <div
        className={cn(
          "num text-small font-semibold",
          tone === "gain"
            ? "text-gain"
            : tone === "loss"
              ? "text-loss"
              : "text-text-primary",
        )}
      >
        {value}
      </div>
    </div>
  );
}
