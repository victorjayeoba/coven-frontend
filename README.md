# Coven — Frontend

Dark-themed Next.js 14 app — Nansen-style green accent, DEXScreener-style density.

## Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000

Backend must be running at http://localhost:8000 (see `../backend/README.md`).

## Structure

```
app/
├── (auth)/              public — sign-in, sign-up
│   ├── sign-in/
│   └── sign-up/
└── (app)/               authenticated (middleware-gated)
    ├── page.tsx         dashboard
    ├── graph/           wallet cluster graph
    ├── signals/         live + historical signals
    ├── signals/[id]/    signal detail
    ├── backtest/        historical proof page
    ├── tokens/[id]/     token detail
    ├── clusters/[id]/   cluster + members
    ├── portfolio/       P&L + positions
    └── settings/        preferences

components/
├── layout/              Sidebar, TopBar, PageHeader
└── ui/                  Button, Card, Badge, Input, StatCard

lib/
├── api/                 axios client + typed endpoints
├── hooks/               TanStack Query hooks
├── stores/              Zustand (UI state)
├── cn.ts                className merger
└── format.ts            USD / %, address / time formatters
```

## Design Tokens

- Font: Inter (via next/font, weights 400/500/600/700)
- Primary accent: `#3cc47b` (Nansen green)
- Background: `#0b0e14` (near-black, blue-tinted)
- Icons: Phosphor (`@phosphor-icons/react`)

## API

Proxied through Next's rewrite: `/api/*` → `http://localhost:8000/api/*`.
Auth via httpOnly cookie `coven_session` — middleware redirects to `/sign-in` if missing.
