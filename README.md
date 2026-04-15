# Coven

**Signals that trade themselves.**

On-chain alpha, detected and acted on in real time. Coven watches the smart-money wallets that move markets and turns their behavior into instant, executable trade signals — across Solana and BNB Chain.

[🎬 Watch the demo](#-demo) · [🌐 Live site](#) · [⚙️ Backend repo](#)

> Replace the three links above with your demo video URL, deployed URL, and backend GitHub URL.

---

## Table of contents

1. [The problem](#the-problem)
2. [Our solution](#our-solution)
3. [What makes Coven special](#what-makes-coven-special)
4. [Key features](#key-features)
5. [Demo](#-demo)
6. [System architecture](#system-architecture)
7. [Tech stack](#tech-stack)
8. [Setup](#setup)
9. [Team](#team)
10. [License](#license)

---

## The problem

Crypto trading runs on information asymmetry, and right now retail loses every time. **Smart-money wallets — the ones running cabals, sniping memecoin launches, and front-running pumps — are visible on-chain, but invisible to the people they're trading against.** By the time a token shows up on Twitter, the chart is already a graveyard and you're the exit liquidity.

Existing tools all stop short:

- **Nansen** shows you who the smart money *is*, but not what they're doing right now.
- **DexScreener / Birdeye** show you what's pumping, but not *why* or *who* started it.
- **Trading bots** copy a wallet, but only one wallet at a time and only on one chain.
- **Telegram alpha groups** are noisy, paid, and human-paced — you're still 10 minutes late.

There is no product that detects, scores, and *acts on* on-chain alpha in a single live loop.

## Our solution

Coven is the missing loop.

We graph every wallet trading on Solana and BNB Chain, cluster them by who-trades-with-whom, and stream every swap they make in real time. When a behavioral cluster (a "cabal") piles into the same token within minutes — or a single high-alpha wallet snipes something fresh — we score the move and publish a **signal**. That signal can:

1. **Land in your Telegram DM** with a one-tap Buy button, or
2. **Trigger a bot** that paper- or live-trades it for you with full take-profit / stop-loss / trailing-stop logic, or
3. **Just sit on the dashboard** for you to watch and learn from.

Every signal is timestamped, scored, and backtested against the next 7 days of price action. The numbers are receipts, not vibes.

## What makes Coven special

- **Multi-source signal engine.** Three orthogonal pipelines feed the same signal feed: behavioral clusters (cabals piling in), alpha solos (one high-conviction wallet acting alone), and rank-stack (tokens climbing multiple AVE leaderboards simultaneously). A token that triggers all three is unmissable.
- **Detection-to-action loop in seconds.** From the moment a smart-money wallet swaps to the moment your bot opens a trade — sub-second on the WebSocket path, sub-5-seconds on the polling path. Most competitors stop at "we'll tell you about it."
- **Multi-chain native.** Solana via Helius (real-time WebSocket), BNB Chain via BSCScan + AVE. Same UI, same bots, same Telegram alerts. No "we'll add other chains soon."
- **Auto-execution that respects you.** Conviction threshold is per-user. Set it to 90 and only elite signals fire your bots; set it to 50 and you copy everything. Paper mode by default — no surprise capital deployment.
- **Built-in Phantom-style swap.** Because if you're going to act on a signal, you shouldn't have to leave the app. Bidirectional, percentage-based, with real token logos and live balance.

## Key features

### 🔔 Real-time signal detection
- **Cluster signals** — fire when 2+ wallets from the same behavioral cluster ("cabal") buy the same token within a short time window.
- **Alpha signals** — fire when a single high-alpha wallet (alpha score ≥ 1.0) makes a non-stable swap on a token they don't already hold.
- **Rank-stack signals** — fire when a token appears on multiple AVE leaderboards (Top Gainers, Trending, Pump-In-Hot, etc.) simultaneously. The more boards, the higher the conviction.

### 🤖 Auto-trading bots
- **Signal bots** — fire automatically when a signal's conviction meets your threshold. Configurable size, max concurrent positions, take-profit, stop-loss, trailing stop.
- **Copy bots** — mirror any wallet on Solana or BSC, swap-for-swap. Catches Pump.fun, Raydium, PancakeSwap, Jupiter, Meteora, DFlow — anything that produces a token transfer.
- All bots respect your paper wallet balance per chain. No overdrafts.

### 💬 Telegram alerts
- One-tap Buy button on every alert — wired to your paper or live wallet.
- Per-user conviction threshold means *you* decide how loud the bot is. Mute when you sleep.
- Inline cluster + topic context so you know *why* this signal exists.

### 📊 Live dashboard
- **Movers** — DexScreener-style table mixing Solana + BSC trending tokens, ranked by composite momentum (1h + 24h change, dampened by liquidity, weighted by volume). Streamed via SSE — no refresh required.
- **Open positions** with live unrealized P&L, sortable, one-click close.
- **Portfolio** view merging system, signal-bot, and copy-bot trades into one feed.

### 🧠 Wallet graph
- Interactive force-directed graph of every tracked wallet, clustered by trading affinity.
- Click a cluster → see every token they've piled into in the last 7 days, with peak/realistic backtest P&L.

### 💱 Built-in Phantom-style swap
- Native SOL ↔ token and token ↔ SOL with one click.
- 10% / 25% / 50% / Max percentage buttons.
- Real token logos and live balance display.
- Same flow on Solana and BSC.

### ⚙️ Per-user settings that actually do something
- Conviction threshold (0–95) — slider with live "Loose / Balanced / Tight / Elite" feedback.
- Active chains — toggle SOL / BSC at any time.
- Max position size — hard cap per bot trade.
- Paper / live trading mode — clear "Real funds" warning when switched.

## 🎬 Demo

> Embed your demo video here. Suggested formats:

```markdown
[![Coven demo](path/to/thumbnail.png)](https://your-demo-link)
```

Or a direct video file:

```html
<video src="path/to/demo.mp4" controls width="100%"></video>
```

**Live deployment:** <https://your-deployed-url>
**Test account:** `kryptos@gmail.com` / `Test123$`

Walk-through points to call out in the video:

1. Landing page with the live signal grid scan background.
2. Sign in → land on dashboard with live Movers + Cabals.
3. Click a signal → token detail page with full chart, holders, signal history.
4. Create a signal bot → set conviction threshold → watch it auto-open a paper trade when a rank-stack signal fires.
5. Telegram bot alert lands in your DM with the same signal and a one-tap Buy button.
6. Open the Phantom-style swap from the top bar, swap SOL → memecoin in 3 clicks.

## System architecture

Coven is built as four loosely-coupled layers connected by an in-process event bus on the backend and an SSE stream on the frontend.

```
┌──────────────────────────────────────────────────────────────┐
│  External feeds                                              │
│  ───────────────                                             │
│  • Helius WSS  (Solana wallet activity, real-time)           │
│  • AVE WSS    (multi-chain pool swaps + rank topics)         │
│  • BSCScan    (BSC wallet polling — REST fallback)           │
│  • Jupiter    (price fallback for unindexed Solana tokens)   │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Backend (FastAPI · Python 3.11 · MongoDB)                   │
│  ──────────────────────────────────────────                  │
│  Background jobs (asyncio):                                  │
│   • helius_stream  → wallet swaps (WSS)                      │
│   • ws_listener    → token-level swaps (WSS)                 │
│   • wallet_poller  → BSC + Solana fallback (REST)            │
│   • price_listener → live token prices (WSS)                 │
│   • rank_poller    → AVE leaderboard topics (REST 5-min)     │
│   • position_monitor → mark open trades, fire TP/SL/trail    │
│                                                              │
│  Services (in-proc event bus):                               │
│   contagion_detector → SIGNAL_FIRED                          │
│         ↓                                                    │
│   signal_enricher    → SIGNAL_SCORED (conviction + risk)     │
│         ↓                                                    │
│   bot_runner         → opens paper trades when bots match    │
│         ↓                                                    │
│   telegram_dispatcher → DMs alerts to opted-in users         │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  API + SSE                                                   │
│  ─────────                                                   │
│  REST endpoints (auth via JWT cookie):                       │
│   /api/signals/live · /api/tokens/movers · /api/trades/...   │
│   /api/bots · /api/settings · /api/balance · /api/telegram   │
│                                                              │
│  SSE stream:                                                 │
│   /api/stream/signals → signal.fired · signal.scored ·       │
│                          price.update · swap · bot.trade.*   │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Frontend (Next.js 14 · React 18 · Tailwind · Three.js)      │
│  ────────────────────────────────────────────────────────    │
│  • Landing page (/)         — public, GridScan WebGL hero    │
│  • Dashboard (/dashboard)   — auth, live Movers + cards      │
│  • Signals (/signals)       — filter / sort / paginate       │
│  • Tokens (/tokens/[id])    — detail + chart + history       │
│  • Bots (/bots)             — create + manage signal/copy    │
│  • Portfolio (/portfolio)   — equity curve + open + closed   │
│  • Settings (/settings)     — conviction, chains, mode       │
│                                                              │
│  Live updates via SSE → patches React Query cache directly.  │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Telegram bot (separate poller)                              │
│  ──────────────────────────────                              │
│  • Receives /start with a link code → binds chat_id to user  │
│  • Listens for inline Buy / View callback_data on alerts     │
│  • Delivers signal cards filtered by user threshold          │
└──────────────────────────────────────────────────────────────┘
```

### How a signal becomes a trade

1. **Helius WSS** notifies the backend that a tracked wallet just swapped on Solana.
2. **`helius_stream`** fetches the parsed transaction, normalizes it into a `SWAP_EVENT`, publishes to the bus.
3. **`contagion_detector`** sees the event. The wallet belongs to Cluster #3. Two other Cluster #3 wallets bought the same token in the last 8 minutes → it fires a `SIGNAL_FIRED` event.
4. **`signal_enricher`** picks it up, fetches risk + momentum data from AVE, computes conviction, publishes `SIGNAL_SCORED`.
5. **`bot_runner`** sees the scored signal. A user has a signal bot with `min_conviction=70`, `chain=solana` → opens a paper trade against their balance.
6. **`telegram_dispatcher`** sees the scored signal. The user's `conviction_threshold` is 50 → DMs a card with a Buy button.
7. The **SSE stream** pushes both events to the user's open browser tab → the signal appears in the table and the new bot trade shows up in Open Positions, both without a refresh.

End-to-end latency: typically under 2 seconds from on-chain confirmation.

## Tech stack

| Layer | Tech | Why |
|---|---|---|
| Frontend framework | Next.js 14 (App Router) + React 18 | SSR-capable, file-based routing, server-side route handlers |
| Styling | Tailwind CSS + custom design tokens | Fast iteration, consistent dark theme |
| Animations | Framer Motion + Three.js / R3F | Hero scan effect + live UI tape feel |
| Data layer | TanStack Query + SSE | Cache + invalidation + real-time patches |
| Forms / state | React hooks + Zustand | No Redux ceremony |
| Backend | FastAPI (Python 3.11) | Async-first, clean DI, fast |
| Database | MongoDB (Motor async driver) | Schema-flexible for fast-evolving signal docs |
| Event bus | In-process `asyncio` pub/sub | Zero infra, sub-ms fanout |
| On-chain feeds | Helius (Solana) + AVE Data API + BSCScan v2 | Best-in-class coverage, paid + free tiers |
| Auth | JWT in HTTP-only cookies | Standard, secure, CSRF-protected |
| Bot framework (TG) | Telegram Bot API via long-polling | Simple, no webhook infra needed |
| Deployment | Vercel (frontend) · Fly.io / Railway (backend) | Suggested — TBD |

## Setup

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 20 | `nvm install 20` |
| npm | ≥ 10 | ships with Node |
| Python | 3.11 | [python.org](https://www.python.org/) |
| MongoDB | ≥ 6 | local or [Atlas free tier](https://www.mongodb.com/atlas) |

You'll also need:

- An **AVE Data API key** — sign up at [ave.ai](https://ave.ai)
- A **Helius API key** (Solana indexing) — [helius.dev](https://www.helius.dev)
- A **BSCScan API key** (BSC tx polling) — [bscscan.com/apis](https://bscscan.com/apis)
- A **Telegram bot token** (optional, for alerts) — message [@BotFather](https://t.me/botfather)

### 1. Clone

```bash
git clone <your-fork-url> coven
cd coven
```

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Fill in:
#   MONGO_URI=mongodb://localhost:27017
#   AVE_API_KEY=...
#   HELIUS_API_KEY=...
#   BSCSCAN_API_KEY=...
#   JWT_SECRET=<any-long-random-string>
#   TELEGRAM_BOT_TOKEN=...      (optional)
#   TELEGRAM_BOT_USERNAME=...   (optional)

uvicorn app.main:app --reload --port 8000
```

The backend boots all background jobs (Helius stream, AVE listener, rank poller, position monitor, etc.) automatically.

### 3. Frontend

```bash
cd frontend
npm install --legacy-peer-deps
# (--legacy-peer-deps required because we use react-three-fiber@8 with React 18)

cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000/api

npm run dev
```

Open <http://localhost:3000>.

### 4. First run

1. Click **Sign up** in the top right (or use the pre-filled `kryptos@gmail.com` / `Test123$` if running the demo).
2. Visit **Settings** → set your conviction threshold (default 70 — drop to 50 if you want more pings).
3. Visit **Bots** → create a new signal bot. Pick chain, size, max concurrent.
4. Wait ~5 minutes — rank-stack signals fire on the first poll. Check **Signals** to see them appear live.
5. Optional: link Telegram via **Settings** → Telegram → scan the QR code with the bot.

## Team

> Replace with your actual team. Suggested format:

| Name | Role | GitHub |
|---|---|---|
| TBD | Founder / Backend | `@github-handle` |
| TBD | Frontend / Design | `@github-handle` |
| TBD | Smart contracts / Web3 | `@github-handle` |

## License

MIT — do whatever, just credit Coven.
