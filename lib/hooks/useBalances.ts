"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/lib/api/endpoints";

export type NetworkId = "solana" | "bsc";
export type Balances = Record<NetworkId, number>;
export type BalancesResponse = { balances: Balances; total: number };

export function useBalances() {
  return useQuery<BalancesResponse>({
    queryKey: ["balances"],
    queryFn: endpoints.getBalances,
    staleTime: 5_000,
    refetchInterval: 15_000,
  });
}

export function useDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      network,
      amount,
    }: {
      network: NetworkId;
      amount: number;
    }) => endpoints.depositBalance(network, amount),
    onSuccess: (data) => {
      qc.setQueryData(["balances"], data);
    },
  });
}

export function useResetBalances() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: endpoints.resetBalance,
    onSuccess: (data) => {
      qc.setQueryData(["balances"], data);
    },
  });
}
