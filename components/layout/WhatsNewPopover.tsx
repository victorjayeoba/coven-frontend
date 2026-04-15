"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkle, X, Lightning } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

const SEEN_KEY = "coven.whatsnew.seen.v1";

export function WhatsNewPopover() {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setSeen(localStorage.getItem(SEEN_KEY) === "1");
    } catch {}
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !seen) {
      try {
        localStorage.setItem(SEEN_KEY, "1");
      } catch {}
      setSeen(true);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      {/* Local keyframes — scoped to this component */}
      <style jsx>{`
        @keyframes cov-row-in {
          0%, 6% { opacity: 0; transform: translateY(4px); }
          14%, 100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes cov-dot-pop {
          0%, 20% { opacity: 0; transform: scale(0.6); }
          30%, 100% { opacity: 1; transform: scale(1); }
        }
        @keyframes cov-conv-tick {
          0%, 14% { opacity: 0; }
          22% { opacity: 1; content: "12"; }
          36% { content: "37"; }
          56% { content: "58"; }
          78%, 100% { content: "78"; }
        }
        @keyframes cov-badge-flip {
          0%, 30% { background: rgba(155,168,189,0.12); color: #9ba8bd; }
          45% { background: rgba(245,165,36,0.15); color: #f5a524; }
          65%, 100% { background: rgba(60,196,123,0.15); color: #3cc47b; }
        }
        @keyframes cov-badge-text {
          0%, 30% { content: "watch"; }
          45% { content: "partial"; }
          65%, 100% { content: "exec"; }
        }
        @keyframes cov-bar {
          0%, 14% { width: 0%; }
          22% { width: 15%; }
          36% { width: 37%; }
          56% { width: 58%; }
          78%, 100% { width: 78%; }
        }
        @keyframes cov-price {
          0%, 14% { opacity: 0; transform: translateY(2px); }
          22% { opacity: 1; transform: translateY(0); }
          40% { color: #3cc47b; }
          55% { transform: translateY(-1px); }
          75%, 100% { transform: translateY(0); color: #3cc47b; }
        }
        @keyframes cov-line {
          0% { stroke-dashoffset: 100; opacity: 0.4; }
          12% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        .cov-demo { animation: none; }
        .cov-row { animation: cov-row-in 5s ease-out infinite; }
        .cov-dot { animation: cov-dot-pop 5s ease-out infinite; }
        .cov-conv::after {
          content: "0";
          animation: cov-conv-tick 5s steps(1, end) infinite;
        }
        .cov-badge {
          animation: cov-badge-flip 5s steps(1, end) infinite;
        }
        .cov-badge::after {
          content: "watch";
          animation: cov-badge-text 5s steps(1, end) infinite;
        }
        .cov-bar { animation: cov-bar 5s ease-out infinite; }
        .cov-price { animation: cov-price 5s ease-out infinite; }
        .cov-line {
          stroke-dasharray: 100;
          animation: cov-line 5s ease-out infinite;
        }
      `}</style>

      <button
        type="button"
        onClick={toggle}
        className="flex h-8 w-full items-center gap-3 rounded-md px-2 text-small text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary"
      >
        <Sparkle size={16} />
        <span>What's New</span>
        {!seen && (
          <span className="relative ml-auto flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          className={cn(
            "absolute bottom-[calc(100%+8px)] left-0 z-50 w-[380px]",
            "overflow-hidden rounded-xl border border-border bg-surface shadow-2xl",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[14px] text-text-primary">
                What's new
              </span>
              <span className="num text-micro text-text-muted">v1.0</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-0.5 text-text-muted transition-colors hover:bg-elevated hover:text-text-primary"
            >
              <X size={11} weight="bold" />
            </button>
          </div>

          {/* Featured demo */}
          <div className="relative overflow-hidden border-b border-border bg-base p-3.5">
            {/* subtle grid */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(60,196,123,1) 1px, transparent 1px), linear-gradient(90deg, rgba(60,196,123,1) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />

            <div className="relative">
              {/* Mock mini chart — smooth Bézier curve, normalized path length */}
              <svg
                viewBox="0 0 320 60"
                className="mb-3 h-14 w-full"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="cov-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3cc47b" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#3cc47b" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="cov-stroke" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#3cc47b" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#3cc47b" stopOpacity="1" />
                  </linearGradient>
                </defs>
                {/* Filled area below the curve */}
                <path
                  d="M0,46 C40,44 80,42 120,38 S200,22 260,12 L320,6 L320,60 L0,60 Z"
                  fill="url(#cov-fill)"
                />
                {/* Animated stroke on top */}
                <path
                  d="M0,46 C40,44 80,42 120,38 S200,22 260,12 L320,6"
                  fill="none"
                  stroke="url(#cov-stroke)"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  pathLength={100}
                  className="cov-line"
                />
              </svg>

              {/* Signal row — mock */}
              <div className="cov-row flex items-center gap-3 rounded-md border border-border bg-surface/80 px-3 py-2 backdrop-blur">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-faint text-[10px] font-bold text-primary">
                  M
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-small font-semibold text-text-primary">
                      $MYX
                    </span>
                    <span className="rounded-sm bg-elevated px-1 text-[9px] uppercase tracking-wider text-text-muted">
                      bsc
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    {/* Wallet dots, staggered */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className="cov-dot h-1.5 w-1.5 rounded-full bg-primary"
                        style={{ animationDelay: `${i * 0.12}s` }}
                      />
                    ))}
                    <span className="ml-1 text-[10px] text-text-muted">
                      cabal piling in
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="num cov-price text-small font-semibold text-text-primary">
                    +62.4%
                  </span>
                  <span className="cov-badge rounded-sm px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider" />
                </div>
              </div>

              {/* Conviction bar */}
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-text-muted">
                  Conviction
                </span>
                <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-elevated">
                  <div className="cov-bar h-full rounded-full bg-gradient-to-r from-warning via-primary to-primary" />
                </div>
                <span className="num cov-conv min-w-[22px] text-right text-small font-semibold text-text-primary" />
              </div>
            </div>
          </div>

          {/* Headline beneath the demo */}
          <div className="px-4 pt-3">
            <div className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              <Lightning size={9} weight="fill" />
              Featured
            </div>
            <h3 className="mt-1 font-display text-[18px] leading-tight text-text-primary">
              See the circle before it moves.
            </h3>
            <p className="mt-1 text-small leading-snug text-text-secondary">
              Cluster signals stream the moment two or more smart-money wallets
              front-run the same token.
            </p>
          </div>

          {/* Secondary list */}
          <div className="px-4 pb-3 pt-3">
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
              Also in this release
            </div>
            <ul className="space-y-1">
              <Item>Copy-trade bots with per-wallet WSS</Item>
              <Item>Telegram alerts · tap-to-buy from chat</Item>
              <Item>Wallet graph with cabal highlighting</Item>
              <Item>Paper wallet fundable from web or Telegram</Item>
            </ul>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border bg-base/40 px-4 py-2">
            <span className="text-[10px] uppercase tracking-[0.14em] text-text-muted">
              Coven · v1.0
            </span>
            <span className="num text-[10px] text-text-muted">Apr 2026</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-small leading-snug text-text-secondary">
      <span
        aria-hidden
        className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-text-muted"
      />
      <span>{children}</span>
    </li>
  );
}
