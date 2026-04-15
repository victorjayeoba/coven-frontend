"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Coins,
  Lightning,
  PaperPlaneTilt,
  Robot,
  ShareNetwork,
  SquaresFour,
  Wallet,
} from "@phosphor-icons/react";

const NAV = [
  { icon: SquaresFour, label: "Dashboard", active: true },
  { icon: Lightning, label: "Signals" },
  { icon: ShareNetwork, label: "Wallet Graph" },
  { icon: Robot, label: "Bots" },
  { icon: Coins, label: "Portfolio" },
  { icon: PaperPlaneTilt, label: "Notifications" },
];

const TOKENS = [
  {
    sym: "$PEPE", chain: "SOL", color: "#14f195",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/24478.png",
    price: 0.000123, ch1: 24.6, ch24: 122.4, vol: 4.2, liq: 0.8,
  },
  {
    sym: "$BONK", chain: "SOL", color: "#14f195",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/23095.png",
    price: 0.0000182, ch1: 12.4, ch24: 38.2, vol: 18, liq: 6.4,
  },
  {
    sym: "$WIF", chain: "SOL", color: "#14f195",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/28752.png",
    price: 1.85, ch1: 8.2, ch24: 14.8, vol: 32, liq: 12.4,
  },
  {
    sym: "$FLOKI", chain: "BSC", color: "#f0b90b",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/10804.png",
    price: 0.000183, ch1: -2.4, ch24: 18.2, vol: 1.4, liq: 0.5,
  },
];

function fmtPct(v: number): string {
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function fmtUsd(n: number, suffix = "M"): string {
  return `$${n.toFixed(2)}${suffix}`;
}

export function DashboardMock() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1400);
    return () => clearInterval(t);
  }, []);

  // Live-ish derived numbers
  const walletUsd = 1462.04 + Math.sin(tick * 0.4) * 18.2;
  const signals7d = 333 + (tick % 8);
  const pepePnl = 84 + Math.round(Math.sin(tick * 0.5) * 22);
  const wifPnl = -23 + Math.round(Math.sin(tick * 0.3 + 1.5) * 12);

  return (
    <div className="relative">
      {/* Browser chrome */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface ring-1 ring-white/5">
        {/* Window controls */}
        <div className="flex items-center gap-2 border-b border-border bg-elevated/40 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <div className="ml-3 flex-1">
            <div className="mx-auto inline-flex h-4 max-w-[180px] items-center gap-1 rounded-md bg-base px-2 text-[9px] text-text-muted">
              app.coven.trade/dashboard
            </div>
          </div>
        </div>

        {/* App body */}
        <div className="grid grid-cols-[44px_1fr] bg-base">
          {/* Sidebar */}
          <aside className="flex flex-col items-center gap-2 border-r border-border bg-surface py-3">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-base">
              <Lightning size={12} weight="fill" />
            </span>
            <div className="mt-2 flex flex-col items-center gap-0.5">
              {NAV.map(({ icon: Icon, label, active }) => (
                <span
                  key={label}
                  className={`grid h-7 w-7 place-items-center rounded-md ${
                    active
                      ? "bg-primary-faint text-primary"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                  title={label}
                >
                  <Icon size={13} weight={active ? "fill" : "regular"} />
                </span>
              ))}
            </div>
          </aside>

          {/* Main */}
          <main className="min-w-0">
            {/* TopBar */}
            <div className="flex items-center justify-end gap-2 border-b border-border px-3 py-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-[9px] font-medium">
                <Wallet size={9} weight="fill" className="text-primary" />
                <span className="text-text-secondary">Wallet</span>
                <motion.span
                  key={Math.round(walletUsd)}
                  initial={{ color: "#3CC47B" }}
                  animate={{ color: undefined }}
                  transition={{ duration: 0.6 }}
                  className="num font-semibold text-text-primary"
                >
                  ${walletUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </motion.span>
              </span>
              <span className="rounded-md bg-primary px-2 py-1 text-[9px] font-medium text-[#0b0e14]">
                Fund
              </span>
            </div>

            {/* Page header */}
            <div className="px-4 pt-3">
              <div className="text-[14px] font-semibold leading-tight text-text-primary">
                Dashboard
              </div>
              <div className="text-[10px] text-text-muted">Smart money clusters, real-time.</div>
            </div>

            {/* Hero stats row */}
            <div className="grid grid-cols-3 gap-2 px-4 py-3">
              <StatCard label="Smart wallets" value="100+" />
              <StatCard label="Cabals" value="3" />
              <StatCard
                label="Signals · 7d"
                value={signals7d.toString()}
                accent="text-primary"
              />
            </div>

            {/* Movers table */}
            <div className="mx-4 mb-3 overflow-hidden rounded-lg border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border bg-elevated/40 px-2.5 py-1.5">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold">
                  <span className="text-warning">🔥</span> Movers
                  <span className="rounded-sm bg-primary-faint px-1 py-0.5 text-[8px] font-medium text-primary">
                    LIVE
                  </span>
                </div>
                <div className="inline-flex gap-0.5 rounded bg-base p-0.5 text-[8px] uppercase tracking-wider">
                  <span className="rounded bg-elevated px-1.5 py-0.5 text-text-primary">All</span>
                  <span className="px-1.5 py-0.5 text-text-muted">SOL</span>
                  <span className="px-1.5 py-0.5 text-text-muted">BSC</span>
                </div>
              </div>

              <div className="grid grid-cols-[16px_1.4fr_60px_50px_50px_60px] gap-1.5 border-b border-border bg-base/30 px-2.5 py-1 text-[8px] uppercase tracking-wider text-text-muted">
                <div>#</div>
                <div>Token</div>
                <div className="text-right">Price</div>
                <div className="text-right">1H</div>
                <div className="text-right">24H</div>
                <div className="text-right">Vol</div>
              </div>

              <div className="divide-y divide-border">
                {TOKENS.map((t, i) => {
                  // Animate price + ch with subtle drift
                  const drift = Math.sin(tick * 0.6 + i) * 0.02;
                  const price = t.price * (1 + drift);
                  const ch1 = t.ch1 + drift * 100;
                  return (
                    <div
                      key={t.sym}
                      className="grid grid-cols-[16px_1.4fr_60px_50px_50px_60px] items-center gap-1.5 px-2.5 py-1.5"
                    >
                      <span className="num text-[10px] font-semibold text-text-muted">
                        {i + 1}
                      </span>
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="relative shrink-0">
                          <img
                            src={t.logo}
                            alt={t.sym}
                            width={18}
                            height={18}
                            className="h-[18px] w-[18px] rounded-full object-cover"
                          />
                          <span
                            className="absolute -bottom-0.5 -right-0.5 h-[7px] w-[7px] rounded-full ring-[1.5px] ring-surface"
                            style={{ background: t.color }}
                          />
                        </span>
                        <div className="min-w-0">
                          <div className="text-[10px] font-semibold leading-tight">
                            {t.sym}
                            <span className="ml-1 rounded-sm bg-elevated px-1 text-[7px] uppercase tracking-wider text-text-muted">
                              {t.chain}
                            </span>
                          </div>
                        </div>
                      </div>
                      <motion.div
                        key={`${t.sym}-${tick}`}
                        initial={{ color: "#3CC47B" }}
                        animate={{ color: undefined }}
                        transition={{ duration: 0.6 }}
                        className="num text-right text-[10px]"
                      >
                        ${price < 0.01 ? price.toPrecision(3) : price.toFixed(3)}
                      </motion.div>
                      <div
                        className={`num text-right text-[10px] font-medium ${
                          ch1 >= 0 ? "text-gain" : "text-loss"
                        }`}
                      >
                        {fmtPct(ch1)}
                      </div>
                      <div
                        className={`num text-right text-[10px] font-medium ${
                          t.ch24 >= 0 ? "text-gain" : "text-loss"
                        }`}
                      >
                        {fmtPct(t.ch24)}
                      </div>
                      <div className="num text-right text-[10px] text-text-secondary">
                        {fmtUsd(t.vol)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom row — positions + cabals snippets */}
            <div className="mx-4 mb-4 grid grid-cols-2 gap-2">
              <MiniCard
                title="Positions"
                badge="2 open"
                rows={[
                  {
                    left: "$PEPE",
                    right: `${pepePnl >= 0 ? "+" : "-"}$${Math.abs(pepePnl)}`,
                    positive: pepePnl >= 0,
                  },
                  {
                    left: "$WIF",
                    right: `${wifPnl >= 0 ? "+" : "-"}$${Math.abs(wifPnl)}`,
                    positive: wifPnl >= 0,
                  },
                ]}
              />
              <MiniCard
                title="Cabals"
                badge="3 active"
                rows={[
                  { left: "Cabal #3", right: "85 wallets" },
                  { left: "Cabal #1", right: "84 wallets" },
                ]}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-surface px-2.5 py-1.5">
      <div className="text-[8px] uppercase tracking-wider text-text-muted">
        {label}
      </div>
      <div className={`num mt-0.5 text-[14px] font-semibold ${accent ?? "text-text-primary"}`}>
        {value}
      </div>
    </div>
  );
}

function MiniCard({
  title,
  badge,
  rows,
}: {
  title: string;
  badge: string;
  rows: { left: string; right: string; positive?: boolean }[];
}) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border bg-elevated/40 px-2 py-1">
        <div className="text-[10px] font-semibold">{title}</div>
        <span className="text-[8px] text-text-muted">{badge}</span>
      </div>
      <div className="divide-y divide-border">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between px-2 py-1">
            <span className="text-[10px] text-text-primary">{r.left}</span>
            <motion.span
              key={r.right}
              initial={{ opacity: 0.5, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`num text-[10px] font-medium ${
                r.positive === true
                  ? "text-gain"
                  : r.positive === false
                    ? "text-loss"
                    : "text-text-secondary"
              }`}
            >
              {r.right}
            </motion.span>
          </div>
        ))}
      </div>
    </div>
  );
}
