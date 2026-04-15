"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChartLineUp,
  ShareNetwork,
  TrendUp,
  Users,
} from "@phosphor-icons/react";

type View = "backtest" | "cluster";

const BACKTEST_ROWS = [
  {
    sym: "$PEPE",
    chain: "SOL",
    color: "#14f195",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/24478.png",
    peak: 721.98,
    realistic: 184.4,
    days: 6,
  },
  {
    sym: "$WIF",
    chain: "SOL",
    color: "#14f195",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/28752.png",
    peak: 460.38,
    realistic: 122.1,
    days: 4,
  },
  {
    sym: "$BONK",
    chain: "SOL",
    color: "#14f195",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/23095.png",
    peak: 241.32,
    realistic: 88.7,
    days: 5,
  },
  {
    sym: "$FLOKI",
    chain: "BSC",
    color: "#f0b90b",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/10804.png",
    peak: 199.04,
    realistic: 64.8,
    days: 7,
  },
  {
    sym: "$POPCAT",
    chain: "SOL",
    color: "#14f195",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/28782.png",
    peak: 168.42,
    realistic: 52.3,
    days: 3,
  },
  {
    sym: "$MEW",
    chain: "SOL",
    color: "#14f195",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/30126.png",
    peak: 142.86,
    realistic: 47.1,
    days: 5,
  },
  {
    sym: "$BABYDOGE",
    chain: "BSC",
    color: "#f0b90b",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/10407.png",
    peak: 124.05,
    realistic: 38.9,
    days: 6,
  },
  {
    sym: "$TURBO",
    chain: "SOL",
    color: "#14f195",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/24911.png",
    peak: 98.74,
    realistic: 31.5,
    days: 4,
  },
];

const CLUSTERS = [
  {
    id: 3,
    name: "Cabal #3",
    wallets: 85,
    active: 4,
    pnl: "+412%",
    note: "Memecoin sniper crew · 4 wallets piling in",
    logos: [
      "https://s2.coinmarketcap.com/static/img/coins/64x64/24478.png",
      "https://s2.coinmarketcap.com/static/img/coins/64x64/23095.png",
    ],
  },
  {
    id: 1,
    name: "Cabal #1",
    wallets: 84,
    active: 2,
    pnl: "+186%",
    note: "BSC degen circle · accumulating $FLOKI",
    logos: [
      "https://s2.coinmarketcap.com/static/img/coins/64x64/10804.png",
    ],
  },
  {
    id: 2,
    name: "Cabal #2",
    wallets: 31,
    active: 3,
    pnl: "+248%",
    note: "Pump.fun rotators · early on $WIF",
    logos: [
      "https://s2.coinmarketcap.com/static/img/coins/64x64/28752.png",
    ],
  },
];

export function BacktestClusterMock() {
  const [view, setView] = useState<View>("backtest");
  const [tick, setTick] = useState(0);

  // Auto-switch every 5s
  useEffect(() => {
    const switcher = setInterval(() => {
      setView((v) => (v === "backtest" ? "cluster" : "backtest"));
    }, 5000);
    const ticker = setInterval(() => setTick((t) => t + 1), 1300);
    return () => {
      clearInterval(switcher);
      clearInterval(ticker);
    };
  }, []);

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl border border-border bg-surface ring-1 ring-white/5">
        {/* Tab header */}
        <div className="flex items-center justify-between border-b border-border bg-elevated/40 px-3 py-2">
          <div className="inline-flex gap-1">
            <TabPill
              icon={<ChartLineUp size={11} weight="fill" />}
              label="Backtest"
              active={view === "backtest"}
              onClick={() => setView("backtest")}
            />
            <TabPill
              icon={<ShareNetwork size={11} weight="fill" />}
              label="Cabals"
              active={view === "cluster"}
              onClick={() => setView("cluster")}
            />
          </div>
          <span className="inline-flex items-center gap-1 text-[9px] text-text-muted">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            UPDATING
          </span>
        </div>

        {/* Body — animated swap */}
        <div className="relative h-[330px]">
          <AnimatePresence mode="wait">
            {view === "backtest" ? (
              <motion.div
                key="bt"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <BacktestView tick={tick} />
              </motion.div>
            ) : (
              <motion.div
                key="cl"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <ClusterView tick={tick} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function TabPill({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
        active
          ? "bg-primary-faint text-primary"
          : "text-text-muted hover:text-text-secondary"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function BacktestView({ tick }: { tick: number }) {
  return (
    <div className="flex h-full flex-col">
      <div className="grid grid-cols-[20px_1.4fr_70px_70px_50px] gap-2 border-b border-border bg-base/30 px-3 py-1.5 text-[8px] uppercase tracking-wider text-text-muted">
        <div>#</div>
        <div>Token</div>
        <div className="text-right">Peak</div>
        <div className="text-right">Realistic</div>
        <div className="text-right">Hold</div>
      </div>
      <div className="flex-1 divide-y divide-border overflow-y-auto">
        {BACKTEST_ROWS.map((r, i) => {
          const drift = Math.sin(tick * 0.5 + i) * 6;
          const peak = r.peak + drift;
          return (
            <div
              key={r.sym}
              className="grid grid-cols-[20px_1.4fr_70px_70px_50px] items-center gap-2 px-3 py-2"
            >
              <span className="num text-[10px] font-semibold text-text-muted">
                {i + 1}
              </span>
              <div className="flex min-w-0 items-center gap-2">
                <span className="relative shrink-0">
                  <img
                    src={r.logo}
                    alt={r.sym}
                    width={20}
                    height={20}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-[1.5px] ring-surface"
                    style={{ background: r.color }}
                  />
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold leading-tight">
                    {r.sym}
                    <span className="ml-1 rounded-sm bg-elevated px-1 text-[8px] uppercase tracking-wider text-text-muted">
                      {r.chain}
                    </span>
                  </div>
                </div>
              </div>
              <motion.div
                key={Math.round(peak)}
                initial={{ color: "#3CC47B" }}
                animate={{ color: undefined }}
                transition={{ duration: 0.6 }}
                className="num text-right text-[11px] font-semibold text-gain"
              >
                +{peak.toFixed(2)}%
              </motion.div>
              <div className="num text-right text-[10px] text-text-secondary">
                +{r.realistic.toFixed(1)}%
              </div>
              <div className="num text-right text-[10px] text-text-muted">
                {r.days}d
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ClusterView({ tick }: { tick: number }) {
  return (
    <div className="flex h-full flex-col">
      {/* Slim stats strip */}
      <div className="grid grid-cols-3 gap-2 border-b border-border bg-base/30 px-3 py-2">
        <ClusterStat
          icon={<Users size={11} weight="fill" />}
          label="Wallets"
          value={String(100 + (tick % 5))}
        />
        <ClusterStat
          icon={<ShareNetwork size={11} weight="fill" />}
          label="Cabals"
          value="3"
        />
        <ClusterStat
          icon={<TrendUp size={11} weight="fill" />}
          label="Avg P&L"
          value={`+${(282 + Math.sin(tick * 0.3) * 14).toFixed(0)}%`}
          accent="text-gain"
        />
      </div>

      {/* Cluster graph */}
      <div className="relative flex-1 overflow-hidden bg-base/20">
        <ClusterGraph tick={tick} />
      </div>
    </div>
  );
}

/* ---- Wallet cluster graph (animated SVG) ---------------------------- */

const CLUSTER_A = { cx: 110, cy: 120, color: "#3CC47B", id: 3, label: "Cabal #3" };
const CLUSTER_B = { cx: 290, cy: 90, color: "#7c3aed", id: 1, label: "Cabal #1" };
const CLUSTER_C = { cx: 250, cy: 200, color: "#f0b90b", id: 2, label: "Cabal #2" };

const NODES_A = [
  { x: 80, y: 80 }, { x: 140, y: 70 }, { x: 70, y: 150 },
  { x: 145, y: 165 }, { x: 110, y: 120 }, { x: 100, y: 105 },
  { x: 130, y: 135 },
];
const NODES_B = [
  { x: 270, y: 60 }, { x: 320, y: 75 }, { x: 290, y: 110 },
  { x: 260, y: 95 }, { x: 310, y: 110 }, { x: 290, y: 90 },
];
const NODES_C = [
  { x: 230, y: 180 }, { x: 270, y: 175 }, { x: 250, y: 215 },
  { x: 240, y: 200 }, { x: 280, y: 205 }, { x: 250, y: 200 },
];

function edgesFor(nodes: { x: number; y: number }[], center: { cx: number; cy: number }) {
  return nodes.map((n) => ({ from: n, to: { x: center.cx, y: center.cy } }));
}

function ClusterGraph({ tick }: { tick: number }) {
  // Pulse one cluster every 2 ticks
  const pulsing = ["A", "B", "C"][tick % 3] as "A" | "B" | "C";

  return (
    <svg
      viewBox="0 0 380 260"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="glowA" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3CC47B" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#3CC47B" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glowB" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glowC" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f0b90b" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f0b90b" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Cluster glows */}
      <ClusterHalo c={CLUSTER_A} grad="glowA" pulse={pulsing === "A"} />
      <ClusterHalo c={CLUSTER_B} grad="glowB" pulse={pulsing === "B"} />
      <ClusterHalo c={CLUSTER_C} grad="glowC" pulse={pulsing === "C"} />

      {/* Edges */}
      {edgesFor(NODES_A, CLUSTER_A).map((e, i) => (
        <line
          key={`ea-${i}`}
          x1={e.from.x}
          y1={e.from.y}
          x2={e.to.x}
          y2={e.to.y}
          stroke={CLUSTER_A.color}
          strokeOpacity={0.25}
          strokeWidth="0.6"
        />
      ))}
      {edgesFor(NODES_B, CLUSTER_B).map((e, i) => (
        <line
          key={`eb-${i}`}
          x1={e.from.x}
          y1={e.from.y}
          x2={e.to.x}
          y2={e.to.y}
          stroke={CLUSTER_B.color}
          strokeOpacity={0.25}
          strokeWidth="0.6"
        />
      ))}
      {edgesFor(NODES_C, CLUSTER_C).map((e, i) => (
        <line
          key={`ec-${i}`}
          x1={e.from.x}
          y1={e.from.y}
          x2={e.to.x}
          y2={e.to.y}
          stroke={CLUSTER_C.color}
          strokeOpacity={0.25}
          strokeWidth="0.6"
        />
      ))}

      {/* Inter-cluster bridges (some wallets show up in multiple) */}
      <line
        x1={CLUSTER_A.cx}
        y1={CLUSTER_A.cy}
        x2={CLUSTER_C.cx}
        y2={CLUSTER_C.cy}
        stroke="#5d6a80"
        strokeOpacity="0.18"
        strokeDasharray="2 2"
        strokeWidth="0.5"
      />
      <line
        x1={CLUSTER_B.cx}
        y1={CLUSTER_B.cy}
        x2={CLUSTER_C.cx}
        y2={CLUSTER_C.cy}
        stroke="#5d6a80"
        strokeOpacity="0.18"
        strokeDasharray="2 2"
        strokeWidth="0.5"
      />

      {/* Wallet nodes */}
      {NODES_A.map((n, i) => (
        <Node key={`na-${i}`} x={n.x} y={n.y} color={CLUSTER_A.color} pulse={pulsing === "A" && i === (tick % NODES_A.length)} />
      ))}
      {NODES_B.map((n, i) => (
        <Node key={`nb-${i}`} x={n.x} y={n.y} color={CLUSTER_B.color} pulse={pulsing === "B" && i === (tick % NODES_B.length)} />
      ))}
      {NODES_C.map((n, i) => (
        <Node key={`nc-${i}`} x={n.x} y={n.y} color={CLUSTER_C.color} pulse={pulsing === "C" && i === (tick % NODES_C.length)} />
      ))}

      {/* Labels */}
      <ClusterLabel c={CLUSTER_A} text="Cabal #3 · 85" />
      <ClusterLabel c={CLUSTER_B} text="Cabal #1 · 84" />
      <ClusterLabel c={CLUSTER_C} text="Cabal #2 · 31" />
    </svg>
  );
}

function ClusterHalo({
  c,
  grad,
  pulse,
}: {
  c: { cx: number; cy: number };
  grad: string;
  pulse: boolean;
}) {
  return (
    <motion.circle
      cx={c.cx}
      cy={c.cy}
      r={pulse ? 58 : 48}
      fill={`url(#${grad})`}
      animate={{ r: pulse ? [48, 64, 48] : 48 }}
      transition={{ duration: 1.4, ease: "easeInOut" }}
    />
  );
}

function Node({
  x,
  y,
  color,
  pulse,
}: {
  x: number;
  y: number;
  color: string;
  pulse: boolean;
}) {
  return (
    <g>
      {pulse && (
        <motion.circle
          cx={x}
          cy={y}
          r={3}
          fill={color}
          fillOpacity="0.4"
          animate={{ r: [3, 12], opacity: [0.6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <circle cx={x} cy={y} r={3} fill={color} />
      <circle cx={x} cy={y} r={3} fill="none" stroke="#0b0e14" strokeWidth="0.6" />
    </g>
  );
}

function ClusterLabel({
  c,
  text,
}: {
  c: { cx: number; cy: number; color: string };
  text: string;
}) {
  return (
    <g transform={`translate(${c.cx}, ${c.cy + 38})`}>
      <rect
        x={-32}
        y={-7}
        width={64}
        height={14}
        rx={4}
        fill="#0b0e14"
        stroke={c.color}
        strokeOpacity={0.4}
        strokeWidth={0.6}
      />
      <text
        x={0}
        y={3}
        textAnchor="middle"
        fontSize="8"
        fontWeight="600"
        fill="#e4eaf2"
      >
        {text}
      </text>
    </g>
  );
}

function ClusterStat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-surface px-2 py-1.5">
      <div className="inline-flex items-center gap-1 text-[8px] uppercase tracking-wider text-text-muted">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <motion.div
        key={value}
        initial={{ opacity: 0.5, y: -2 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`num mt-0.5 text-[14px] font-semibold ${accent ?? "text-text-primary"}`}
      >
        {value}
      </motion.div>
    </div>
  );
}
