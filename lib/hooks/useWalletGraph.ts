"use client";

import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/lib/api/endpoints";

export type GraphNode = {
  address: string;
  chain?: string | null;
  alpha_score?: number | null;
  total_profit?: number | null;
  token_count?: number | null;
};

export type GraphEdge = {
  source: string;
  target: string;
  weight?: number | null;
};

export type GraphCluster = {
  cluster_id: number;
  size: number;
  chain?: string | null;
  wallet_addresses: string[];
};

export type WalletGraphResponse = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: GraphCluster[];
};

export function useWalletGraph(params?: Record<string, any>) {
  return useQuery<WalletGraphResponse>({
    queryKey: ["wallet-graph", params],
    queryFn: () => endpoints.walletGraph(params),
    staleTime: 5 * 60_000,
  });
}

export function useWalletDetail(address: string | null) {
  return useQuery({
    queryKey: ["wallet", address],
    queryFn: () => endpoints.getWallet(address!),
    enabled: !!address,
    staleTime: 60_000,
  });
}
