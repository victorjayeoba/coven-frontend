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
  tokenTxs: async (id: string, limit = 50) =>
    (await api.get(`/tokens/${id}/txs`, { params: { limit } })).data,

  // Bots
  listBots: async () => (await api.get("/bots")).data,
  createBot: async (body: any) => (await api.post("/bots", body)).data,
  getBot: async (id: string) => (await api.get(`/bots/${id}`)).data,
  updateBot: async (id: string, body: any) =>
    (await api.patch(`/bots/${id}`, body)).data,
  deleteBot: async (id: string) => (await api.delete(`/bots/${id}`)).data,
  botTrades: async (id: string, status: "open" | "closed" | "all" = "all") =>
    (await api.get(`/bots/${id}/trades`, { params: { status } })).data,

  // Telegram
  telegramConfig: async () => (await api.get("/telegram/config")).data,
  telegramStatus: async () => (await api.get("/telegram/status")).data,
  telegramStartLink: async () =>
    (await api.post("/telegram/start-link")).data,
  telegramUnlink: async () => (await api.post("/telegram/unlink")).data,
  telegramPrefs: async (body: {
    signals?: boolean;
    trades?: boolean;
    mute_until?: string | null;
  }) => (await api.patch("/telegram/prefs", body)).data,
  telegramTest: async (
    type: "signal" | "trade_open" | "trade_close" | "all",
  ) => (await api.post("/telegram/test", { type })).data,

  // Paper balance
  getBalances: async () => (await api.get("/balance")).data,
  depositBalance: async (network: "solana" | "bsc", amount: number) =>
    (await api.post("/balance/deposit", { network, amount })).data,
  resetBalance: async () => (await api.post("/balance/reset")).data,
  trending: async (chain: string) =>
    (await api.get("/tokens/trending", { params: { chain } })).data,
  movers: async (chains: string = "solana,bsc", limit = 30) =>
    (await api.get("/tokens/movers", { params: { chains, limit } })).data,

  // Trades
  listTrades: async (params?: Record<string, any>) =>
    (await api.get("/trades", { params })).data,
  activeTrades: async () => (await api.get("/trades/active")).data,
  tradeHistory: async (limit = 100) =>
    (await api.get("/trades/history", { params: { limit } })).data,
  pnlSummary: async () => (await api.get("/trades/pnl")).data,
  closeTrade: async (id: string) =>
    (await api.post(`/trades/${id}/close`)).data,
  openTrade: async (payload: { token_id: string; size_usd: number; symbol?: string }) =>
    (await api.post("/trades/open", payload)).data,

  // Backtests
  listBacktests: async (params?: Record<string, any>) =>
    (await api.get("/backtests", { params })).data,
  backtestSummary: async () => (await api.get("/backtests/summary")).data,

  // Settings
  getSettings: async () => (await api.get("/settings")).data,
  updateSettings: async (payload: Record<string, any>) =>
    (await api.patch("/settings", payload)).data,
};
