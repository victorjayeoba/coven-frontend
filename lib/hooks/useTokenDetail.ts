"use client";

import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/lib/api/endpoints";
import { api } from "@/lib/api/client";

export function useTokenDetail(tokenId: string | null | undefined) {
  return useQuery({
    queryKey: ["token-detail", tokenId],
    queryFn: () => endpoints.getToken(tokenId!),
    enabled: !!tokenId,
    // Price/TVL/Vol/Makers stream live via SSE. Everything else
    // (mcap, holders, age) changes slowly — refresh every 5 min.
    staleTime: 2 * 60_000,
    refetchInterval: 5 * 60_000,
    refetchIntervalInBackground: false,
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
      const { data } = await api.get(`/signals/${signalId}/cluster-trades`);
      return data;
    },
    enabled: !!signalId,
    staleTime: 60_000,
  });
}

export function useTokenRisk(tokenId: string | null | undefined) {
  return useQuery({
    queryKey: ["token-risk", tokenId],
    queryFn: () => endpoints.tokenRisk(tokenId!),
    enabled: !!tokenId,
    staleTime: 5 * 60_000,
  });
}

export function useTokenSignals(tokenId: string | null | undefined) {
  return useQuery({
    queryKey: ["token-signals", tokenId],
    queryFn: async () => {
      const { data } = await api.get(`/tokens/${tokenId}/signals`);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!tokenId,
    staleTime: 60_000,
  });
}

export function useTokenSmartHolders(tokenId: string | null | undefined) {
  return useQuery({
    queryKey: ["token-smart-holders", tokenId],
    queryFn: async () => {
      const { data } = await api.get(`/tokens/${tokenId}/smart-holders`);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!tokenId,
    staleTime: 60_000,
  });
}
