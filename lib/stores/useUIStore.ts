"use client";

import { create } from "zustand";

type UIState = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  convictionThreshold: number;
  setConvictionThreshold: (n: number) => void;
};

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  convictionThreshold: 70,
  setConvictionThreshold: (n) => set({ convictionThreshold: n }),
}));
