"use client";

import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/lib/api/endpoints";

export function useActiveTrades() {
  return useQuery({
    queryKey: ["trades", "active"],
    queryFn: endpoints.activeTrades,
    refetchInterval: 30_000,
  });
}

export function usePnlSummary() {
  return useQuery({
    queryKey: ["pnl-summary"],
    queryFn: endpoints.pnlSummary,
    refetchInterval: 30_000,
  });
}

export function useBacktestSummary() {
  return useQuery({
    queryKey: ["backtest", "summary"],
    queryFn: endpoints.backtestSummary,
    staleTime: 5 * 60_000,
  });
}

export function useClusters() {
  return useQuery({
    queryKey: ["clusters"],
    queryFn: endpoints.listClusters,
    staleTime: 5 * 60_000,
  });
}
