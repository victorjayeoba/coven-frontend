import { api } from "./client";

export const endpoints = {
  // Signals
  listSignals: async (params?: Record<string, any>) =>
    (await api.get("/signals", { params })).data,
  liveSignals: async (minutes = 60) =>
    (await api.get("/signals/live", { params: { minutes } })).data,
  getSignal: async (id: string) => (await api.get(`/signals/${id}`)).data,

  // Wallets & graph
  walletGraph: async (params?: Record<string, any>) =>
    (await api.get("/wallets/graph", { params })).data,
  topWallets: async (params?: Record<string, any>) =>
    (await api.get("/wallets/top", { params })).data,
  getWallet: async (address: string) =>
    (await api.get(`/wallets/${address}`)).data,

  // Clusters
  listClusters: async () => (await api.get("/clusters")).data,
  getCluster: async (id: number) => (await api.get(`/clusters/${id}`)).data,

  // Tokens
  searchTokens: async (q: string, chain?: string) =>
    (await api.get("/tokens/search", { params: { q, chain } })).data,
  getToken: async (id: string) => (await api.get(`/tokens/${id}`)).data,
  tokenCandles: async (id: string, interval = 60, limit = 100) =>
    (await api.get(`/tokens/${id}/candles`, { params: { interval, limit } })).data,
  tokenRisk: async (id: string) => (await api.get(`/tokens/${id}/risk`)).data,
  trending: async (chain: string) =>
    (await api.get("/tokens/trending", { params: { chain } })).data,

  // Trades
  listTrades: async (params?: Record<string, any>) =>
    (await api.get("/trades", { params })).data,
  activeTrades: async () => (await api.get("/trades/active")).data,
  tradeHistory: async (limit = 100) =>
    (await api.get("/trades/history", { params: { limit } })).data,
  pnlSummary: async () => (await api.get("/trades/pnl")).data,

  // Backtests
  listBacktests: async (params?: Record<string, any>) =>
    (await api.get("/backtests", { params })).data,
  backtestSummary: async () => (await api.get("/backtests/summary")).data,

  // Settings
  getSettings: async () => (await api.get("/settings")).data,
  updateSettings: async (payload: Record<string, any>) =>
    (await api.patch("/settings", payload)).data,
};
