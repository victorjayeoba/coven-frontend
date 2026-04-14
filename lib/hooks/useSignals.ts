"use client";

import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/lib/api/endpoints";

export function useLiveSignals(minutes = 240, limit = 20) {
  return useQuery({
    queryKey: ["signals", "live", minutes, limit],
    queryFn: async () => {
      const data = await endpoints.liveSignals(minutes);
      return Array.isArray(data) ? data.slice(0, limit) : [];
    },
    refetchInterval: 15_000,
    staleTime: 10_000,
  });
}

export function useAllSignals(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["signals", "all", params],
    queryFn: () => endpoints.listSignals(params),
    refetchInterval: 30_000,
  });
}
