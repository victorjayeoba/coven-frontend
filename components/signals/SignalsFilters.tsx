"use client";

import { Funnel } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

export type Source = "backtest" | "live";
export type SortKey = "peak_desc" | "peak_asc" | "conviction_desc" | "recent";
export type StatusFilter = "all" | "exec" | "partial" | "watch" | "blocked";
export type ChainFilter = "all" | "solana" | "bsc";
export type TypeFilter = "all" | "cluster" | "alpha" | "rank_stack";

type Props = {
  source: Source;
  onSource: (s: Source) => void;
  status: StatusFilter;
  onStatus: (s: StatusFilter) => void;
  chain: ChainFilter;
  onChain: (c: ChainFilter) => void;
  signalType: TypeFilter;
  onSignalType: (t: TypeFilter) => void;
  sort: SortKey;
  onSort: (s: SortKey) => void;
  minConviction: number;
  onMinConviction: (n: number) => void;
  total: number;
};

function Group({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="label-micro">{label}</span>
      {children}
    </div>
  );
}

function ChipGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { label: string; value: T }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-border bg-surface p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded px-2.5 py-1 text-micro font-medium uppercase tracking-wider transition-colors",
            value === o.value
              ? "bg-elevated text-text-primary"
              : "text-text-secondary hover:text-text-primary",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SignalsFilters({
  source,
  onSource,
  status,
  onStatus,
  chain,
  onChain,
  signalType,
  onSignalType,
  sort,
  onSort,
  minConviction,
  onMinConviction,
  total,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-surface px-4 py-3">
      <div className="flex items-center gap-2">
        <Funnel size={14} className="text-text-secondary" weight="fill" />
        <span className="text-small font-semibold text-text-primary">
          Filters
        </span>
        <span className="num rounded-sm bg-elevated px-1.5 py-0.5 text-micro text-text-secondary">
          {total}
        </span>
      </div>

      <div className="h-5 w-px bg-border" />

      <Group label="Type">
        <ChipGroup<TypeFilter>
          value={signalType}
          options={[
            { label: "All", value: "all" },
            { label: "Cluster", value: "cluster" },
            { label: "Alpha", value: "alpha" },
            { label: "Rank", value: "rank_stack" },
          ]}
          onChange={onSignalType}
        />
      </Group>

      <Group label="Source">
        <ChipGroup<Source>
          value={source}
          options={[
            { label: "Backtest", value: "backtest" },
            { label: "Live", value: "live" },
          ]}
          onChange={onSource}
        />
      </Group>

      <Group label="Status">
        <ChipGroup<StatusFilter>
          value={status}
          options={[
            { label: "All", value: "all" },
            { label: "Exec", value: "exec" },
            { label: "Partial", value: "partial" },
            { label: "Watch", value: "watch" },
          ]}
          onChange={onStatus}
        />
      </Group>

      <Group label="Chain">
        <ChipGroup<ChainFilter>
          value={chain}
          options={[
            { label: "All", value: "all" },
            { label: "SOL", value: "solana" },
            { label: "BSC", value: "bsc" },
          ]}
          onChange={onChain}
        />
      </Group>

      <Group label="Sort">
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value as SortKey)}
          className="h-7 rounded-md border border-border bg-surface px-2 text-small text-text-primary focus:border-primary focus:outline-none"
        >
          <option value="peak_desc">Peak P&L ↓</option>
          <option value="peak_asc">Peak P&L ↑</option>
          <option value="conviction_desc">Conviction ↓</option>
          <option value="recent">Most recent</option>
        </select>
      </Group>

      <Group label="Min conv.">
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={minConviction}
          onChange={(e) => onMinConviction(Number(e.target.value))}
          className="h-1 w-28 cursor-pointer appearance-none rounded-full bg-elevated accent-primary"
        />
        <span className="num w-8 text-right text-small font-semibold text-text-primary">
          {minConviction}
        </span>
      </Group>
    </div>
  );
}
