"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NetworkId = "solana" | "bsc";
export type PaperBalances = Record<NetworkId, number>;

type UIState = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  // Mobile-only off-canvas drawer (not persisted — always starts closed).
  mobileSidebarOpen: boolean;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  convictionThreshold: number;
  setConvictionThreshold: (n: number) => void;

  // Paper-trading wallet — split per network
  paperBalances: PaperBalances;
  depositPaper: (network: NetworkId, amount: number) => void;
  resetPaperBalance: () => void;

  // Command palette (not persisted)
  paletteOpen: boolean;
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;
};

const EMPTY_BALANCES: PaperBalances = { solana: 0, bsc: 0 };

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      mobileSidebarOpen: false,
      openMobileSidebar: () => set({ mobileSidebarOpen: true }),
      closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
      convictionThreshold: 70,
      setConvictionThreshold: (n) => set({ convictionThreshold: n }),

      paperBalances: { ...EMPTY_BALANCES },
      depositPaper: (network, amount) =>
        set((s) => ({
          paperBalances: {
            ...s.paperBalances,
            [network]: (s.paperBalances[network] ?? 0) + Math.max(0, amount),
          },
        })),
      resetPaperBalance: () => set({ paperBalances: { ...EMPTY_BALANCES } }),

      paletteOpen: false,
      openPalette: () => set({ paletteOpen: true }),
      closePalette: () => set({ paletteOpen: false }),
      togglePalette: () => set((s) => ({ paletteOpen: !s.paletteOpen })),
    }),
    {
      name: "coven-ui",
      version: 2,
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        convictionThreshold: s.convictionThreshold,
        paperBalances: s.paperBalances,
      }),
      migrate: (persisted: any, fromVersion) => {
        if (!persisted || typeof persisted !== "object") return persisted;
        // v1 kept a single `paperBalance: number` — preserve the total by
        // dumping it into the first supported network (BSC).
        if (fromVersion < 2 && "paperBalance" in persisted) {
          const legacy = Number(persisted.paperBalance) || 0;
          persisted.paperBalances = { solana: 0, bsc: legacy };
          delete persisted.paperBalance;
        }
        if (!persisted.paperBalances) {
          persisted.paperBalances = { ...EMPTY_BALANCES };
        }
        return persisted;
      },
    },
  ),
);

/** Sum of every network balance — drop-in replacement for the old `paperBalance` selector. */
export function usePaperBalanceTotal(): number {
  return useUIStore((s) =>
    Object.values(s.paperBalances).reduce((a, b) => a + (Number(b) || 0), 0),
  );
}

/** Balance for a single network. */
export function usePaperBalance(network: NetworkId): number {
  return useUIStore((s) => Number(s.paperBalances[network]) || 0);
}
