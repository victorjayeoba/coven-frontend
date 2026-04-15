"use client";

import { useQuery } from "@tanstack/react-query";
import { me, type User } from "@/lib/api/auth";

/**
 * Returns the signed-in user (or null if anonymous).
 * 401s resolve to `data: null` rather than throwing so consumers can
 * conditionally render public vs authenticated UI without try/catch.
 */
export function useMe() {
  return useQuery<User | null>({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        return await me();
      } catch (e: any) {
        if (e?.response?.status === 401) return null;
        throw e;
      }
    },
    staleTime: 60_000,
    retry: false,
  });
}
