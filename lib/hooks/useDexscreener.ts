"use client";

import { useQuery } from "@tanstack/react-query";

/**
 * DexScreener free public API — same data their iframe and site show.
 *   https://docs.dexscreener.com/api/reference
 *
 * Rate limit: 300 req/min per endpoint, no auth. Plenty for UI polling.
 *
 * We query by token address (returns every pair on every chain) and pick the
 * highest-liquidity pair for the requested chain, which is what DS's own
 * token page shows by default.
 */

export type DexPair = {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; symbol: string };
  priceUsd?: string;
  priceChange?: { m5?: number; h1?: number; h6?: number; h24?: number };
  liquidity?: { usd?: number };
  fdv?: number;
  marketCap?: number;
  volume?: { h24?: number; h6?: number; h1?: number; m5?: number };
  txns?: {
    h24?: { buys?: number; sells?: number };
    h1?: { buys?: number; sells?: number };
  };
  pairCreatedAt?: number;
  info?: { imageUrl?: string };
};

export type DexSnapshot = {
  priceUsd: number | null;
  priceChange1h: number | null;
  priceChange24h: number | null;
  liquidityUsd: number | null;
  fdv: number | null;
  marketCap: number | null;
  volume24h: number | null;
  buys24h: number | null;
  sells24h: number | null;
  pair: DexPair | null;
};

const CHAIN_MAP: Record<string, string> = {
  solana: "solana",
  bsc: "bsc",
  eth: "ethereum",
  ethereum: "ethereum",
  base: "base",
  arbitrum: "arbitrum",
  polygon: "polygon",
};

function splitTokenId(tokenId: string): { address: string; chain: string } {
  if (!tokenId.includes("-")) return { address: tokenId, chain: "" };
  const idx = tokenId.lastIndexOf("-");
  return {
    address: tokenId.slice(0, idx),
    chain: tokenId.slice(idx + 1).toLowerCase(),
  };
}

function pickBestPair(pairs: DexPair[], chain: string): DexPair | null {
  if (!pairs.length) return null;
  const dsChain = CHAIN_MAP[chain] ?? chain;
  const sameChain = pairs.filter((p) => p.chainId === dsChain);
  const pool = sameChain.length ? sameChain : pairs;
  // Best = highest 24h volume; fall back to highest liquidity
  return [...pool].sort((a, b) => {
    const av = Number(a.volume?.h24 ?? a.liquidity?.usd ?? 0);
    const bv = Number(b.volume?.h24 ?? b.liquidity?.usd ?? 0);
    return bv - av;
  })[0];
}

export function useDexscreenerToken(
  tokenId: string | null | undefined,
  opts: { refetchMs?: number } = {},
) {
  const refetchMs = opts.refetchMs ?? 10_000;

  return useQuery<DexSnapshot | null>({
    queryKey: ["dex-token", tokenId],
    enabled: !!tokenId,
    staleTime: 5_000,
    refetchInterval: refetchMs,
    refetchIntervalInBackground: false,
    queryFn: async () => {
      if (!tokenId) return null;
      const { address } = splitTokenId(tokenId);
      if (!address) return null;

      const r = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${address}`,
      );
      if (!r.ok) return null;
      const data = await r.json();
      const pairs: DexPair[] = Array.isArray(data?.pairs) ? data.pairs : [];
      const { chain } = splitTokenId(tokenId);
      const pair = pickBestPair(pairs, chain);
      if (!pair) return null;

      const num = (v: any): number | null => {
        if (v == null || v === "") return null;
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
      };

      return {
        priceUsd: num(pair.priceUsd),
        priceChange1h: num(pair.priceChange?.h1),
        priceChange24h: num(pair.priceChange?.h24),
        liquidityUsd: num(pair.liquidity?.usd),
        fdv: num(pair.fdv),
        marketCap: num(pair.marketCap),
        volume24h: num(pair.volume?.h24),
        buys24h: num(pair.txns?.h24?.buys),
        sells24h: num(pair.txns?.h24?.sells),
        pair,
      };
    },
  });
}
