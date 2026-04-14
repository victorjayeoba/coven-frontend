"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type UIState = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  convictionThreshold: number;
  setConvictionThreshold: (n: number) => void;

  // Paper-trading wallet (persisted)
  paperBalance: number;
  depositPaper: (amount: number) => void;
  resetPaperBalance: () => void;

  // Command palette (not persisted)
  paletteOpen: boolean;
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      convictionThreshold: 70,
      setConvictionThreshold: (n) => set({ convictionThreshold: n }),

      paperBalance: 0,
      depositPaper: (amount) =>
        set((s) => ({ paperBalance: s.paperBalance + Math.max(0, amount) })),
      resetPaperBalance: () => set({ paperBalance: 0 }),

      paletteOpen: false,
      openPalette: () => set({ paletteOpen: true }),
      closePalette: () => set({ paletteOpen: false }),
      togglePalette: () => set((s) => ({ paletteOpen: !s.paletteOpen })),
    }),
    {
      name: "coven-ui",
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        convictionThreshold: s.convictionThreshold,
        paperBalance: s.paperBalance,
      }),
    },
  ),
);
