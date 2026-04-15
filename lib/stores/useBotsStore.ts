"use client";

/**
 * Type definitions and defaults for bots.
 *
 * NOTE: the real source of truth is now the backend (`/api/bots`).
 * For data + mutations use the hooks in `lib/hooks/useBots.ts`.
 */

export type BotType = "copy" | "signal";
export type BotStatus = "active" | "paused";
export type Chain = "solana" | "bsc";
export type SizeMode = "fixed" | "multiplier" | "percent";

export type Bot = {
  id: string;
  name: string;
  type: BotType;
  status: BotStatus;
  chain: Chain;
  createdAt: string;

  sizeUsd: number;
  sizeMode: SizeMode;
  multiplier: number;
  percentOfTarget: number;

  targetWallet: string;
  targetLabel: string;
  copyExits: boolean;

  minConviction: number;
  clusterFilter: string;

  takeProfitPct: number;
  stopLossPct: number;
  trailingStopPct: number;

  maxSlippagePct: number;
  maxConcurrent: number;
  dailyLossLimitUsd: number;
  minLiquidityUsd: number;
  cooldownMin: number;
  antiRug: boolean;

  stats: { pnlUsd: number; trades: number; wins: number };
};

export const DEFAULTS = {
  chain: "solana" as Chain,
  sizeUsd: 100,
  sizeMode: "fixed" as SizeMode,
  multiplier: 1,
  percentOfTarget: 5,
  targetWallet: "",
  targetLabel: "",
  copyExits: true,
  minConviction: 70,
  clusterFilter: "",
  takeProfitPct: 50,
  stopLossPct: 20,
  trailingStopPct: 0,
  maxSlippagePct: 3,
  maxConcurrent: 5,
  dailyLossLimitUsd: 500,
  minLiquidityUsd: 10_000,
  cooldownMin: 15,
  antiRug: true,
};
