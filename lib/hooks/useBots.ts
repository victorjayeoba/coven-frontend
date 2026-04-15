"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/lib/api/endpoints";
import type { Bot, BotType, Chain, SizeMode } from "@/lib/stores/useBotsStore";

/** Backend -> UI shape */
function toUi(raw: any): Bot {
  const s = raw.stats || {};
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type as BotType,
    status: raw.status,
    chain: raw.chain as Chain,
    createdAt: raw.created_at ?? "",

    sizeUsd: Number(raw.size_usd ?? 0),
    sizeMode: (raw.size_mode ?? "fixed") as SizeMode,
    multiplier: Number(raw.multiplier ?? 1),
    percentOfTarget: Number(raw.percent_of_target ?? 5),

    targetWallet: raw.target_wallet ?? "",
    targetLabel: raw.target_label ?? "",
    copyExits: !!raw.copy_exits,

    minConviction: Number(raw.min_conviction ?? 70),
    clusterFilter: raw.cluster_filter ?? "",

    takeProfitPct: Number(raw.take_profit_pct ?? 0),
    stopLossPct: Number(raw.stop_loss_pct ?? 0),
    trailingStopPct: Number(raw.trailing_stop_pct ?? 0),

    maxSlippagePct: Number(raw.max_slippage_pct ?? 0),
    maxConcurrent: Number(raw.max_concurrent ?? 0),
    dailyLossLimitUsd: Number(raw.daily_loss_limit_usd ?? 0),
    minLiquidityUsd: Number(raw.min_liquidity_usd ?? 0),
    cooldownMin: Number(raw.cooldown_min ?? 0),
    antiRug: !!raw.anti_rug,

    stats: {
      pnlUsd: Number(s.pnl_usd ?? 0),
      trades: Number(s.trades ?? 0),
      wins: Number(s.wins ?? 0),
    },
  };
}

/** UI -> Backend shape */
export function toApi(bot: Partial<Bot>): Record<string, any> {
  const out: Record<string, any> = {};
  const map: Array<[keyof Bot, string]> = [
    ["name", "name"],
    ["type", "type"],
    ["chain", "chain"],
    ["status", "status"],
    ["sizeUsd", "size_usd"],
    ["sizeMode", "size_mode"],
    ["multiplier", "multiplier"],
    ["percentOfTarget", "percent_of_target"],
    ["targetWallet", "target_wallet"],
    ["targetLabel", "target_label"],
    ["copyExits", "copy_exits"],
    ["minConviction", "min_conviction"],
    ["clusterFilter", "cluster_filter"],
    ["takeProfitPct", "take_profit_pct"],
    ["stopLossPct", "stop_loss_pct"],
    ["trailingStopPct", "trailing_stop_pct"],
    ["maxSlippagePct", "max_slippage_pct"],
    ["maxConcurrent", "max_concurrent"],
    ["dailyLossLimitUsd", "daily_loss_limit_usd"],
    ["minLiquidityUsd", "min_liquidity_usd"],
    ["cooldownMin", "cooldown_min"],
    ["antiRug", "anti_rug"],
  ];
  for (const [ui, api] of map) {
    if (bot[ui] !== undefined) out[api] = bot[ui];
  }
  return out;
}

export function useBots() {
  return useQuery({
    queryKey: ["bots"],
    queryFn: async (): Promise<Bot[]> => {
      const data = await endpoints.listBots();
      return Array.isArray(data) ? data.map(toUi) : [];
    },
    staleTime: 15_000,
  });
}

export function useBot(id: string | undefined | null) {
  return useQuery({
    queryKey: ["bots", id],
    queryFn: async (): Promise<Bot> => toUi(await endpoints.getBot(id!)),
    enabled: !!id,
  });
}

export function useBotTrades(id: string | undefined | null) {
  return useQuery({
    queryKey: ["bot-trades", id],
    queryFn: () => endpoints.botTrades(id!, "all"),
    enabled: !!id,
    staleTime: 10_000,
  });
}

export function useCreateBot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Bot, "id" | "createdAt" | "status" | "stats">) =>
      endpoints.createBot(toApi(payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bots"] }),
  });
}

export function useUpdateBot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Bot> }) =>
      endpoints.updateBot(id, toApi(patch)),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["bots"] });
      qc.invalidateQueries({ queryKey: ["bots", id] });
    },
  });
}

export function useDeleteBot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => endpoints.deleteBot(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bots"] }),
  });
}

export function useToggleBotStatus() {
  const update = useUpdateBot();
  return (bot: Bot) =>
    update.mutate({
      id: bot.id,
      patch: { status: bot.status === "active" ? "paused" : "active" },
    });
}
