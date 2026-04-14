"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export type TokenMarket = {
  symbol?: string;
  name?: string;
  chain?: string;
  logo_url?: string;
  price_usd?: number | null;
  price_change_1h?: number | null;
  price_change_24h?: number | null;
  market_cap?: number | null;
  fdv?: number | null;
  tvl?: number | null;
  volume_24h?: number | null;
  tx_count_24h?: number | null;
  makers_24h?: number | null;
  launch_at?: number | null;
  risk_score?: number | string | null;
};

export function useTokenMarkets(tokenIds: (string | undefined | null)[]) {
  const ids = Array.from(
    new Set(
      tokenIds.filter((t): t is string => typeof t === "string" && t.length > 0),
    ),
  );
  const key = ["token-markets", ids.sort().join(",")];

  return useQuery<Record<string, TokenMarket>>({
    queryKey: key,
    queryFn: async () => {
      if (ids.length === 0) return {};
      const { data } = await api.post<Record<string, TokenMarket>>(
        "/tokens/batch",
        { token_ids: ids },
      );
      return data ?? {};
    },
    // SSE price.update events patch this cache live with sub-second latency.
    // REST is only for initial load + refreshing fields SSE doesn't stream
    // (mcap, holders, age). So poll only every 5 minutes.
    staleTime: 2 * 60_000,
    refetchInterval: 5 * 60_000,
    refetchIntervalInBackground: false,
    enabled: ids.length > 0,
  });
}
