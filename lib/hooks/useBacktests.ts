"use client";

import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/lib/api/endpoints";

export function useBacktests(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["backtests", params],
    queryFn: () => endpoints.listBacktests(params),
    staleTime: 5 * 60_000,
  });
}
