"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, X, Lightning, Clock, TrendUp } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { useLiveSignals } from "@/lib/hooks/useSignals";
import { useBacktests } from "@/lib/hooks/useBacktests";
import { formatPct, formatRelativeTime, formatUsd } from "@/lib/format";
import { cn } from "@/lib/cn";

type RecentItem = {
  token_id: string;
  chain?: string;
  symbol?: string;
  signal_type?: string;
  status?: string;
  conviction_score?: number;
  detected_at?: string;
  peak_pnl_pct?: number | null;
};

/**
 * Ctrl/Cmd-K command palette. Opens a full-screen overlay with search +
 * recent tokens from live + backtest signals.
 */
export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");

  const { data: liveData } = useLiveSignals(240, 30);
  const { data: btData } = useBacktests({ limit: 20 });

  // Server-side search via AVE proxy
  const { data: searchResults } = useQuery({
    queryKey: ["token-search", q],
    queryFn: () => endpoints.searchTokens(q),
    enabled: q.trim().length >= 2,
    staleTime: 60_000,
  });

  const recent = useMemo<RecentItem[]>(() => {
    const seen = new Set<string>();
    const out: RecentItem[] = [];
    const add = (r: any, source: "live" | "backtest") => {
      if (!r?.token_id || seen.has(r.token_id)) return;
      seen.add(r.token_id);
      out.push({
        token_id: r.token_id,
        chain: r.chain,
        symbol: r.symbol,
        signal_type: r.signal_type,
        status: r.status,
        conviction_score: r.conviction_score,
        detected_at: r.detected_at ?? r.first_entry_at,
        peak_pnl_pct: r.peak_pnl_pct,
      });
    };
    (Array.isArray(liveData) ? liveData : []).forEach((r: any) => add(r, "live"));
    (Array.isArray(btData) ? btData : []).forEach((r: any) => add(r, "backtest"));
    return out.slice(0, 24);
  }, [liveData, btData]);

  // Focus the input when modal opens
  useEffect(() => {
    if (open) {
      setQ("");
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const navigateTo = (tokenId: string) => {
    router.push(`/tokens/${tokenId}`);
    onClose();
  };

  if (!open) return null;

  const showSearch = q.trim().length >= 2;
  const searchList = Array.isArray(searchResults) ? searchResults : [];

  return (
    <>
      {/* Scrim */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className="fixed left-1/2 top-[10vh] z-50 w-[min(760px,92vw)] -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
      >
        {/* Header: search input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <MagnifyingGlass size={16} className="text-text-muted" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tokens, wallets, or paste a contract…"
            className="flex-1 bg-transparent text-body text-text-primary outline-none placeholder:text-text-muted"
          />
          <kbd className="hidden items-center rounded border border-border bg-base px-1.5 py-0.5 text-[10px] text-text-muted md:inline-flex">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-md text-text-muted hover:bg-elevated hover:text-text-primary"
          >
            <X size={14} weight="bold" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto p-3">
          {showSearch ? (
            <Section
              icon={<MagnifyingGlass size={12} weight="fill" />}
              label={`Search results · ${searchList.length}`}
            >
              {searchList.length === 0 ? (
                <EmptyHint>No matches. Try a different keyword.</EmptyHint>
              ) : (
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {searchList.slice(0, 24).map((t: any, i: number) => {
                    const chain = t.chain ?? t.chain_name;
                    const contract =
                      t.token ??
                      t.token_address ??
                      t.contract ??
                      t.address;
                    const tid =
                      t.token_id ??
                      (contract && chain ? `${contract}-${chain}` : null);
                    if (!tid) return null;
                    return (
                      <TokenTile
                        key={`${tid}-${i}`}
                        tokenId={tid}
                        symbol={t.symbol}
                        chain={chain}
                        onClick={() => navigateTo(tid)}
                        secondary={
                          t.current_price_usd
                            ? formatUsd(Number(t.current_price_usd), 4)
                            : null
                        }
                      />
                    );
                  })}
                </div>
              )}
            </Section>
          ) : (
            <>
              <Section
                icon={<Lightning size={12} weight="fill" />}
                label="Recent signals"
              >
                {recent.length === 0 ? (
                  <EmptyHint>
                    No signals yet. Leave Coven running and they'll appear here.
                  </EmptyHint>
                ) : (
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {recent.map((r) => (
                      <TokenTile
                        key={r.token_id}
                        tokenId={r.token_id}
                        symbol={r.symbol}
                        chain={r.chain}
                        onClick={() => navigateTo(r.token_id)}
                        meta={
                          <div className="flex items-center gap-1.5">
                            {r.signal_type === "alpha" ? (
                              <span className="rounded-sm bg-info/10 px-1 text-[10px] font-semibold uppercase tracking-wider text-info">
                                α
                              </span>
                            ) : (
                              <span className="rounded-sm bg-elevated px-1 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                                cluster
                              </span>
                            )}
                            {typeof r.conviction_score === "number" && (
                              <span className="num text-[10px] text-text-secondary">
                                {r.conviction_score}
                              </span>
                            )}
                            {r.status ? (
                              <Badge
                                variant={
                                  r.status === "exec"
                                    ? "exec"
                                    : r.status === "partial"
                                      ? "partial"
                                      : r.status === "blocked"
                                        ? "blocked"
                                        : "watch"
                                }
                              >
                                {r.status}
                              </Badge>
                            ) : null}
                          </div>
                        }
                        secondary={
                          typeof r.peak_pnl_pct === "number" ? (
                            <span
                              className={cn(
                                "num",
                                r.peak_pnl_pct >= 0 ? "text-gain" : "text-loss",
                              )}
                            >
                              {formatPct(r.peak_pnl_pct)}
                            </span>
                          ) : r.detected_at ? (
                            <span className="text-text-muted">
                              {formatRelativeTime(r.detected_at)}
                            </span>
                          ) : null
                        }
                      />
                    ))}
                  </div>
                )}
              </Section>

              <div className="mt-3 flex items-center gap-3 border-t border-border px-1 pt-3 text-micro text-text-muted">
                <span className="inline-flex items-center gap-1">
                  <TrendUp size={10} /> Latest
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={10} /> Signal history
                </span>
                <span className="ml-auto">
                  Tip: type a contract address or symbol to search
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Section({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-2">
        <span className="text-primary">{icon}</span>
        <span className="text-micro font-semibold uppercase tracking-wider text-text-muted">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-base/50 p-4 text-center text-small text-text-muted">
      {children}
    </div>
  );
}

function TokenTile({
  tokenId,
  symbol,
  chain,
  onClick,
  meta,
  secondary,
}: {
  tokenId: string;
  symbol?: string;
  chain?: string;
  onClick: () => void;
  meta?: React.ReactNode;
  secondary?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 rounded-md border border-border bg-base px-3 py-2.5 text-left transition-colors hover:border-primary/30 hover:bg-elevated"
    >
      <TokenLogo
        symbol={symbol}
        chain={chain}
        tokenId={tokenId}
        size={28}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-body font-semibold text-text-primary group-hover:text-primary">
            ${symbol ?? tokenId.split("-")[0]?.slice(0, 6)}
          </span>
          {chain && (
            <span className="rounded-sm bg-elevated px-1 text-[10px] uppercase tracking-wider text-text-muted">
              {chain}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-micro text-text-muted">
          {meta}
        </div>
      </div>
      {secondary ? (
        <div className="shrink-0 text-small">{secondary}</div>
      ) : null}
    </button>
  );
}
