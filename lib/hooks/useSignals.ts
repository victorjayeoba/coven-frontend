"use client";

import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/lib/api/endpoints";

// With the SSE stream (see useSignalStream) invalidating these queries on
// every new signal, we can be much lazier about polling — the stream carries
// the live-ness. Fallback polling covers stream drops.
export function useLiveSignals(minutes = 240, limit = 20) {
  return useQuery({
    queryKey: ["signals", "live", minutes, limit],
    queryFn: async () => {
      const data = await endpoints.liveSignals(minutes);
      return Array.isArray(data) ? data.slice(0, limit) : [];
    },
    refetchInterval: 60_000, // fallback — SSE does the real-time work
    staleTime: 30_000,
  });
}

export function useAllSignals(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["signals", "all", params],
    queryFn: () => endpoints.listSignals(params),
    refetchInterval: 60_000,
  });
}
