"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Robot } from "@phosphor-icons/react";

const TRADES = [
  { sym: "PE", name: "$PEPE", pnl: 84 },
  { sym: "DO", name: "$DOGZ", pnl: 142 },
  { sym: "WH", name: "$WHALE", pnl: -23 },
  { sym: "YN", name: "$YN", pnl: 67 },
];

export function CopyBotMock() {
  const [tradeIdx, setTradeIdx] = useState(0);
  const [pnl, setPnl] = useState(1234);
  const [winRate, setWinRate] = useState(63);
  const [tradeCount, setTradeCount] = useState(47);

  useEffect(() => {
    const it = setInterval(() => {
      setTradeIdx((i) => (i + 1) % TRADES.length);
      setPnl((p) => p + Math.floor((Math.random() - 0.3) * 60));
      setTradeCount((n) => n + 1);
      setWinRate((w) => Math.min(99, Math.max(50, w + (Math.random() > 0.5 ? 1 : -1))));
    }, 2400);
    return () => clearInterval(it);
  }, []);

  const trade = TRADES[tradeIdx];

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border bg-elevated/40 px-4 py-2.5">
          <div className="inline-flex items-center gap-2">
            <Robot size={14} weight="fill" className="text-info" />
            <span className="text-small font-semibold">Copy bot · Whale 0x4f…</span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-sm bg-primary-faint px-1.5 py-0.5 text-[10px] font-medium text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            ACTIVE
          </span>
        </div>

        <div className="space-y-3 p-4">
          <div className="rounded-lg border border-border bg-base/40 p-3">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-text-muted">
              <span>Mirroring</span>
              <span className="num text-text-secondary">0x4fA8…b21c</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="num text-h3 font-semibold">$1,000</span>
              <span className="text-[10px] text-text-muted">per trade</span>
            </div>
          </div>

          {/* Animated live trade */}
          <div className="relative h-[78px] overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={trade.name + tradeIdx}
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.96 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="absolute inset-0 rounded-lg border border-primary/40 bg-primary-faint/20 p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-elevated text-[10px] font-bold">
                      {trade.sym}
                    </span>
                    <div>
                      <div className="text-small font-semibold">
                        {trade.name} {trade.pnl >= 0 ? "bought" : "sold"}
                      </div>
                      <div className="text-[10px] text-text-muted">
                        Just now · matched target
                      </div>
                    </div>
                  </div>
                  <span
                    className={`num inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${
                      trade.pnl >= 0
                        ? "bg-primary-faint text-primary"
                        : "bg-loss/15 text-loss"
                    }`}
                  >
                    {trade.pnl >= 0 ? "+" : ""}${Math.abs(trade.pnl)}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Trades" value={String(tradeCount)} />
            <Stat label="Win rate" value={`${winRate}%`} />
            <Stat
              label="P&L"
              value={`${pnl >= 0 ? "+" : "-"}$${Math.abs(pnl).toLocaleString()}`}
              tone={pnl >= 0 ? "gain" : "loss"}
            />
          </div>
        </div>
      </div>
    </div>
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
    <div className="rounded-md border border-border bg-base/40 p-2">
      <motion.div
        key={value}
        initial={{ opacity: 0.4, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`num text-body font-semibold ${
          tone === "gain"
            ? "text-gain"
            : tone === "loss"
              ? "text-loss"
              : "text-text-primary"
        }`}
      >
        {value}
      </motion.div>
      <div className="text-[9px] uppercase tracking-wider text-text-muted">
        {label}
      </div>
    </div>
  );
}
