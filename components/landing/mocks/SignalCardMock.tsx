"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightning } from "@phosphor-icons/react";

type Row = {
  symbol: string;
  chain: "SOL" | "BSC";
  color: string;
  basePrice: number;
  logo: string;
};

const ROWS: Row[] = [
  {
    symbol: "$PEPE",
    chain: "SOL",
    color: "#14f195",
    basePrice: 0.00012,
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/24478.png",
  },
  {
    symbol: "$BONK",
    chain: "SOL",
    color: "#14f195",
    basePrice: 0.000018,
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/23095.png",
  },
  {
    symbol: "$WIF",
    chain: "SOL",
    color: "#14f195",
    basePrice: 1.85,
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/28752.png",
  },
];

const KINDS = [
  { label: "🔥 3 topics", color: "text-warning bg-warning/10" },
  { label: "α 12.3 ★", color: "text-info bg-info/10" },
  { label: "#3 · 4/85", color: "text-text-secondary bg-elevated" },
  { label: "α 8.1", color: "text-info bg-info/10" },
  { label: "🔥 2 topics", color: "text-warning bg-warning/10" },
];

const STATUSES = ["EXEC", "PARTIAL", "WATCH", "EXEC", "EXEC"] as const;

function priceLabel(n: number): string {
  if (n < 0.01) return `$${n.toPrecision(3)}`;
  if (n < 1) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(2)}`;
}

export function SignalCardMock() {
  // Per-row independent state — token icons stay fixed, only numbers tick.
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1100);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-xl border border-border bg-surface">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-elevated/40 px-4 py-2.5">
          <div className="inline-flex items-center gap-2">
            <Lightning size={14} weight="fill" className="text-primary" />
            <span className="text-small font-semibold">Live signals</span>
            <span className="ml-1 inline-flex items-center gap-1 rounded-sm bg-primary-faint px-1.5 py-0.5 text-[10px] font-medium text-primary">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              LIVE
            </span>
          </div>
          <span className="text-[10px] text-text-muted">3 firing</span>
        </div>

        <div className="divide-y divide-border">
          {ROWS.map((row, idx) => (
            <SignalRow key={row.symbol} row={row} tick={tick} idx={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SignalRow({ row, tick, idx }: { row: Row; tick: number; idx: number }) {
  // Stagger each row's update so they don't all change at the same instant
  const seed = (tick + idx * 7) % 1000;

  // Price jitters smoothly around base
  const priceJitter = Math.sin(seed * 0.7 + idx) * 0.03;
  const livePrice = row.basePrice * (1 + priceJitter);

  // % change drifts within a believable band
  const ch = 12 + Math.sin(seed * 0.4 + idx * 1.3) * 18 + idx * 4;

  // Conviction nudges 1–3 points
  const conv = 78 + Math.round(Math.sin(seed * 0.5 + idx * 2.1) * 8);

  // Kind + status rotate slowly so the badges feel alive
  const kindIdx = Math.floor(tick / 4 + idx) % KINDS.length;
  const kind = KINDS[kindIdx];
  const status = STATUSES[Math.floor(tick / 6 + idx) % STATUSES.length];

  const statusCls =
    status === "EXEC"
      ? "bg-primary-faint text-primary"
      : status === "PARTIAL"
        ? "bg-warning/15 text-warning"
        : "bg-elevated text-text-secondary";

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* Token logo + chain marker */}
      <span className="relative shrink-0">
        <img
          src={row.logo}
          alt={row.symbol}
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-cover"
        />
        <span
          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-surface"
          style={{ background: row.color }}
          title={row.chain}
        />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-small font-semibold">{row.symbol}</span>
          <span className="rounded-sm bg-elevated px-1 text-[10px] uppercase tracking-wider text-text-muted">
            {row.chain}
          </span>
        </div>
        <TickingText className="num text-[10px] text-text-muted" value={priceLabel(livePrice)} />
      </div>

      <TickingText
        className="num shrink-0 text-small font-medium text-gain"
        value={`+${ch.toFixed(2)}%`}
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={kind.label}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.25 }}
          className={`num inline-flex shrink-0 items-center rounded-sm px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${kind.color}`}
        >
          {kind.label}
        </motion.span>
      </AnimatePresence>

      <TickingText
        className="num shrink-0 text-small font-semibold text-primary"
        value={String(conv)}
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={status}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.2 }}
          className={`shrink-0 rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusCls}`}
        >
          {status}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/** Number/text that briefly flashes primary-green on every change. */
function TickingText({ className, value }: { className: string; value: string }) {
  return (
    <motion.span
      key={value}
      initial={{ color: "#3CC47B" }}
      animate={{ color: undefined }}
      transition={{ duration: 0.7 }}
      className={className}
    >
      {value}
    </motion.span>
  );
}
