"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/lib/api/endpoints";

export type TelegramLink = {
  chat_id: number;
  username?: string | null;
  first_name?: string | null;
  linked_at?: string;
  prefs: {
    signals: boolean;
    trades: boolean;
    mute_until: string | null;
  };
};

export type TelegramStatus = {
  linked: boolean;
  link: TelegramLink | null;
};

export function useTelegramConfig() {
  return useQuery<{ configured: boolean; bot_username: string | null }>({
    queryKey: ["telegram", "config"],
    queryFn: endpoints.telegramConfig,
    staleTime: 60_000,
  });
}

/** Polls status every 2s while the modal is open so the UI flips instantly on link. */
export function useTelegramStatus(opts: { pollMs?: number } = {}) {
  return useQuery<TelegramStatus>({
    queryKey: ["telegram", "status"],
    queryFn: endpoints.telegramStatus,
    refetchInterval: opts.pollMs ?? false,
    refetchIntervalInBackground: false,
    staleTime: 5_000,
  });
}

export function useStartTelegramLink() {
  return useMutation({
    mutationFn: endpoints.telegramStartLink,
  });
}

export function useUnlinkTelegram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: endpoints.telegramUnlink,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["telegram", "status"] });
    },
  });
}

export function useUpdateTelegramPrefs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: endpoints.telegramPrefs,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["telegram", "status"] });
    },
  });
}

export function useTelegramTest() {
  return useMutation({
    mutationFn: (type: "signal" | "trade_open" | "trade_close" | "all") =>
      endpoints.telegramTest(type),
  });
}
