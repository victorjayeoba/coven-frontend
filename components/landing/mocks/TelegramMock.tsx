"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ChartBar,
  CurrencyCircleDollar,
  DotsThreeVertical,
  Eye,
  Lightning,
  Microphone,
  Paperclip,
  Smiley,
  WarningCircle,
} from "@phosphor-icons/react";

type Msg = {
  id: number;
  status: "EXEC" | "WATCH" | "PARTIAL";
  conv: number;
  symbol: string;
  chain: "SOL" | "BSC";
  detail: string;
  stack?: string;
  fresh: boolean;
};

const FEED: Omit<Msg, "id" | "fresh">[] = [
  {
    status: "EXEC",
    conv: 88,
    symbol: "$PEPE",
    chain: "SOL",
    detail: "Cabal #3 · 4 wallets piling in",
    stack: "Stacked: gainer + Trending SOL",
  },
  {
    status: "EXEC",
    conv: 82,
    symbol: "$WIF",
    chain: "SOL",
    detail: "α-wallet · 12.34 alpha",
  },
  {
    status: "PARTIAL",
    conv: 72,
    symbol: "$DOGZ",
    chain: "BSC",
    detail: "Cabal #1 · 2/85 wallets",
  },
  {
    status: "EXEC",
    conv: 91,
    symbol: "$BONK",
    chain: "SOL",
    detail: "Cabal #5 · 3 wallets piling in",
    stack: "Stacked: momentum + Trending SOL",
  },
];

/* iOS-accurate status bar icons (SVG, fixed white stroke/fill) */

function IOSSignal() {
  return (
    <svg width="14" height="9" viewBox="0 0 14 9" fill="white" aria-hidden>
      <rect x="0" y="6" width="2.4" height="3" rx="0.6" />
      <rect x="3.6" y="4.2" width="2.4" height="4.8" rx="0.6" />
      <rect x="7.2" y="2.4" width="2.4" height="6.6" rx="0.6" />
      <rect x="10.8" y="0" width="2.4" height="9" rx="0.6" />
    </svg>
  );
}

function IOSWifi() {
  return (
    <svg width="13" height="9" viewBox="0 0 13 9" fill="none" aria-hidden>
      <path
        d="M6.5 8.4 a0.9 0.9 0 1 1 0.001 0z"
        fill="white"
      />
      <path
        d="M2.6 5.4 a5.5 5.5 0 0 1 7.8 0"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M0.6 2.9 a8.7 8.7 0 0 1 11.8 0"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function IOSBattery() {
  return (
    <span className="inline-flex items-center gap-[1px]">
      <span
        className="relative inline-block h-[10px] w-[22px] rounded-[3px]"
        style={{ border: "1px solid rgba(255,255,255,0.45)" }}
      >
        <span className="absolute inset-[1.5px] rounded-[1.5px] bg-white" />
      </span>
      <span
        className="inline-block h-[4px] w-[1.5px] rounded-r-[1px]"
        style={{ background: "rgba(255,255,255,0.45)" }}
      />
    </span>
  );
}

function StatusIcon({ status }: { status: Msg["status"] }) {
  if (status === "EXEC")
    return <Lightning size={13} weight="fill" className="text-[#3CC47B]" />;
  if (status === "PARTIAL")
    return <WarningCircle size={13} weight="fill" className="text-amber-400" />;
  return <Eye size={13} weight="fill" className="text-white/60" />;
}

function ChainDot({ chain }: { chain: "SOL" | "BSC" }) {
  const c = chain === "SOL" ? "#14f195" : "#f0b90b";
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full"
      style={{ background: c }}
    />
  );
}

const TG_BG = "#0e1621";
const TG_BUBBLE = "#182533";
const TG_ACCENT = "#5fb3f5";
const TG_TIME = "#6e8595";

export function TelegramMock() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { ...FEED[1], id: 1, fresh: false },
    { ...FEED[0], id: 2, fresh: true },
  ]);

  useEffect(() => {
    let i = 2;
    const next = setInterval(() => {
      setMsgs((prev) => {
        const incoming: Msg = {
          ...FEED[i % FEED.length],
          id: Date.now(),
          fresh: true,
        };
        i += 1;
        // demote old "fresh" to not-fresh, drop oldest
        const aged = prev.map((m) => ({ ...m, fresh: false }));
        return [...aged.slice(-1), incoming];
      });
    }, 3500);
    return () => clearInterval(next);
  }, []);

  return (
    <div className="relative">
      {/* iPhone frame — compact phone proportions for layout balance */}
      <div className="relative mx-auto w-full max-w-[280px]">
        {/* Body */}
        <div
          className="relative z-10 overflow-hidden rounded-[40px] border-[8px] border-[#0a0c10] bg-black ring-1 ring-white/5"
          style={{ aspectRatio: "9 / 16" }}
        >
          <div className="flex h-full flex-col">
          {/* Dynamic Island */}
          <div className="absolute left-1/2 top-1.5 z-30 h-[22px] w-[84px] -translate-x-1/2 rounded-full bg-black">
            <span className="absolute right-2 top-1/2 h-[5px] w-[5px] -translate-y-1/2 rounded-full bg-[#0a0c10] ring-[0.5px] ring-white/10" />
          </div>

          {/* Status bar — true iOS style icons */}
          <div className="flex items-center justify-between bg-black px-5 pb-1 pt-2 text-[10px] font-semibold text-white">
            <span className="tabular-nums">9:41</span>
            <span className="inline-flex items-center gap-1.5">
              <IOSSignal />
              <IOSWifi />
              <IOSBattery />
            </span>
          </div>

        {/* TG header */}
        <div
          className="flex items-center justify-between px-3 py-2.5"
          style={{ background: "#17212b" }}
        >
          <div className="inline-flex items-center gap-2">
            <ArrowLeft size={16} className="text-white/70" />
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#3CC47B] to-[#1f7c4d] text-[11px] font-bold text-white">
              C
            </span>
            <div className="leading-tight">
              <div className="text-[13px] font-semibold text-white">
                CovenAlpha
              </div>
              <div className="text-[10px] text-white/50">bot · always online</div>
            </div>
          </div>
          <DotsThreeVertical size={18} className="text-white/70" />
        </div>

        {/* Chat area */}
        <div
          className="relative flex-1 overflow-hidden"
          style={{ background: TG_BG }}
        >
          {/* Subtle pattern overlay (telegram has a dot/wave pattern) */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,1) 1px, transparent 0)",
              backgroundSize: "16px 16px",
            }}
          />

          {/* Date separator */}
          <div className="relative flex justify-center pt-3">
            <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-medium text-white/60 backdrop-blur">
              Today
            </span>
          </div>

          {/* Messages */}
          <div className="relative space-y-2 px-3 pt-3">
            <AnimatePresence initial={false}>
              {msgs.map((m, idx) => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: -16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.97 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="max-w-[88%]"
                  style={{
                    background: TG_BUBBLE,
                    borderRadius: "12px",
                    borderTopLeftRadius: 4,
                    color: "#fff",
                    padding: "8px 10px 6px",
                  }}
                >
                  <div className="text-[11px] font-semibold" style={{ color: TG_ACCENT }}>
                    CovenAlpha
                  </div>

                  <div className="mt-1 text-[12.5px] leading-snug">
                    <div className="inline-flex items-center gap-1.5 font-semibold">
                      <StatusIcon status={m.status} />
                      <span>
                        {m.status} · conviction {m.conv}
                      </span>
                    </div>
                    <div className="mt-0.5 inline-flex items-center gap-1.5">
                      <ChainDot chain={m.chain} />
                      <span className="font-bold">{m.symbol}</span>
                      <span className="rounded bg-white/10 px-1 text-[9px] uppercase tracking-wider">
                        {m.chain}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11.5px] italic text-white/70">
                      {m.detail}
                    </div>
                    {m.stack && (
                      <div className="text-[11.5px] italic text-white/70">
                        {m.stack}
                      </div>
                    )}
                  </div>

                  {/* Inline keyboard — TG style: white-on-darker, full-width */}
                  <div className="mt-2 flex gap-1">
                    <button
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-semibold text-white"
                      style={{ background: "#2a3b4d" }}
                    >
                      <CurrencyCircleDollar size={12} weight="fill" />
                      Buy $100
                    </button>
                    <button
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-semibold text-white"
                      style={{ background: "#2a3b4d" }}
                    >
                      <ChartBar size={12} weight="fill" />
                      View
                    </button>
                  </div>

                  {/* Time + delivered checkmarks */}
                  <div className="mt-1 flex items-center justify-end gap-0.5 text-[9.5px]" style={{ color: TG_TIME }}>
                    <span>{idx === msgs.length - 1 ? "9:41" : "9:40"}</span>
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                      <path
                        d="M1 5l3 3 5-7M6 8l5-7"
                        stroke={TG_ACCENT}
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* TG footer (input bar) */}
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{ background: "#17212b" }}
        >
          <Smiley size={18} className="text-white/40" />
          <div className="flex-1 rounded-full bg-[#242f3d] px-3 py-1.5 text-[11px] text-white/40">
            Message
          </div>
          <Paperclip size={16} className="text-white/40" />
          <Microphone size={16} weight="fill" className="text-white/40" />
        </div>

          {/* iOS home indicator */}
          <div className="flex justify-center bg-[#17212b] pb-1.5 pt-1">
            <span className="h-[4px] w-[100px] rounded-full bg-white/80" />
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
