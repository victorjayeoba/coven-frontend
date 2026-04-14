"use client";

import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/lib/api/endpoints";

export function useTokenDetail(tokenId: string | null | undefined) {
  return useQuery({
    queryKey: ["token-detail", tokenId],
    queryFn: () => endpoints.getToken(tokenId!),
    enabled: !!tokenId,
    staleTime: 60_000,
  });
}

export function useTokenCandles(
  tokenId: string | null | undefined,
  interval: number = 60,
  limit: number = 300,
) {
  return useQuery({
    queryKey: ["token-candles", tokenId, interval, limit],
    queryFn: () => endpoints.tokenCandles(tokenId!, interval, limit),
    enabled: !!tokenId,
    staleTime: 30_000,
  });
}

export function useSignalTrades(signalId: string | null | undefined) {
  return useQuery({
    queryKey: ["signal-trades", signalId],
    queryFn: async () => {
      const { api } = await import("@/lib/api/client");
      const { data } = await api.get(`/signals/${signalId}/cluster-trades`);
      return data;
    },
    enabled: !!signalId,
    staleTime: 60_000,
  });
}
