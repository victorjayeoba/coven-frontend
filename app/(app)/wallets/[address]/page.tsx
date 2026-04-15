"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowSquareOut,
  Copy,
  Check,
  Lightning,
  UsersThree,
  Wallet as WalletIcon,
  Coins,
  LinkSimple,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { useWalletDetail } from "@/lib/hooks/useWalletGraph";
import { formatAddress, formatPct, formatRelativeTime, formatUsd } from "@/lib/format";
import { explorerAddressUrl, explorerName } from "@/lib/explorer";
import { cn } from "@/lib/cn";

const CHAIN_DOT: Record<string, string> = {
  solana: "bg-chain-solana",
  bsc: "bg-chain-bsc",
  eth: "bg-chain-eth",
  base: "bg-chain-base",
};

const STATUS_VARIANT: Record<string, any> = {
  exec: "exec",
  partial: "partial",
  watch: "watch",
  blocked: "blocked",
};

export default function WalletPage({
  params,
}: {
  params: { address: string };
}) {
  const { address } = params;
  const { data, isLoading } = useWalletDetail(address);
  const [copied, setCopied] = useState(false);
  const [posPage, setPosPage] = useState(0);
  const [posPageSize, setPosPageSize] = useState(10);

  const w = data;
  const chain = w?.chain ?? "";
  const alpha = Number(w?.alpha_score ?? 0);
  const totalProfit = Number(w?.total_profit ?? 0);
  const positions = Array.isArray(w?.tokens) ? w.tokens : [];
  const cluster = w?.cluster;
  const neighbors = Array.isArray(w?.neighbors) ? w.neighbors : [];
  const signals = Array.isArray(w?.recent_signals) ? w.recent_signals : [];

  // Filter out spam/decimals-bug tokens with bonkers balances.
  // Any single position > $10M is almost certainly bad data on AVE's side.
  const SPAM_VALUE_THRESHOLD = 10_000_000;

  const sortedPositions = [...positions]
    .filter((p: any) => {
      const v = Number(p.balance_usd);
      return !Number.isFinite(v) || v <= SPAM_VALUE_THRESHOLD;
    })
    .map((p: any) => {
      const balance = Number(p.balance_usd);
      const tp = Number(p.total_profit);
      const up = Number(p.unrealized_profit);

      // Combined P&L = realized + unrealized
      const hasRealized = Number.isFinite(tp);
      const hasUnrealized = Number.isFinite(up);
      const pnl =
        hasRealized || hasUnrealized
          ? (hasRealized ? tp : 0) + (hasUnrealized ? up : 0)
          : null;

      // Cost basis = current_value - unrealized (what they paid for what they hold)
      // For already-exited tokens, "invested" ≈ total_profit magnitude (rough proxy)
      const balanceN = Number.isFinite(balance) ? balance : 0;
      const cost =
        pnl !== null && balanceN > 0
          ? balanceN - (hasUnrealized ? up : 0)
          : null;
      const pctMargin =
        pnl !== null && cost !== null && cost > 0 ? (pnl / cost) * 100 : null;

      return {
        ...p,
        _balance: balanceN,
        _pnl: pnl,
        _cost: cost,
        _pct: pctMargin,
      };
    })
    // Rank: tokens with known P&L first (by size), then unknowns by balance
    .sort((a, b) => {
      const aHas = a._pnl !== null;
      const bHas = b._pnl !== null;
      if (aHas !== bHas) return aHas ? -1 : 1;
      if (aHas && bHas) return Math.abs(b._pnl) - Math.abs(a._pnl);
      return (b._balance ?? 0) - (a._balance ?? 0);
    });

  const totalBalance = sortedPositions.reduce(
    (s, p) => s + (p._balance ?? 0),
    0,
  );
  const tracked = sortedPositions.filter((p) => p._pnl !== null);
  const summedPnl = tracked.reduce((s, p) => s + (p._pnl ?? 0), 0);
  const summedCost = tracked.reduce((s, p) => s + (p._cost ?? 0), 0);
  const avgMarginPct = summedCost > 0 ? (summedPnl / summedCost) * 100 : 0;

  const explorerUrl = explorerAddressUrl(chain, address);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="space-y-4">
      {/* Back link */}
      <div>
        <Link
          href="/graph"
          className="inline-flex items-center gap-1 text-small text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft size={12} weight="bold" /> Back to graph
        </Link>
      </div>

      {/* HERO */}
      {isLoading ? (
        <div className="relative overflow-hidden rounded-lg border border-border bg-surface p-5 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-border" />
            <div className="space-y-3 flex-1">
              <div className="h-8 w-1/3 bg-border rounded" />
              <div className="h-4 w-1/2 bg-border rounded" />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-lg border border-border bg-surface p-5">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 600px 200px at 0% 0%, rgba(60,196,123,0.08), transparent 60%)",
            }}
          />

          <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary-faint">
                <WalletIcon size={20} weight="fill" className="text-primary" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="num text-h1 font-semibold text-text-primary">
                    {formatAddress(address, 8, 6)}
                  </h1>
                  <button
                    onClick={copy}
                    className="grid h-7 w-7 place-items-center rounded-md text-text-muted hover:bg-elevated hover:text-text-primary"
                    title="Copy address"
                  >
                    {copied ? (
                      <Check size={12} weight="bold" className="text-primary" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-elevated px-2 py-0.5 text-micro uppercase tracking-wider text-text-secondary">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        CHAIN_DOT[chain] ?? "bg-text-muted",
                      )}
                    />
                    {chain}
                  </span>
                  {cluster && (
                    <Link
                      href={`/clusters/${cluster.cluster_id}`}
                      className="inline-flex items-center gap-1 rounded-full bg-primary-faint px-2 py-0.5 text-micro uppercase tracking-wider text-primary hover:underline"
                    >
                      <UsersThree size={10} weight="fill" /> Cabal #
                      {cluster.cluster_id}
                    </Link>
                  )}
                  <span className="text-micro text-text-muted">
                    {positions.length} positions · {neighbors.length} connections
                  </span>
                </div>
              </div>
            </div>

            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-surface px-3 text-small text-text-primary transition-colors hover:bg-elevated"
              >
                {explorerName(chain)}
                <ArrowSquareOut size={12} weight="bold" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* STATS GRID */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface px-4 py-3 space-y-2">
              <div className="h-3 w-1/2 bg-border rounded" />
              <div className="h-6 w-3/4 bg-border rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-4">
          <StatCell
            label="Alpha score"
            value={alpha.toFixed(2)}
            accent={alpha > 1 ? "gain" : undefined}
          />
          <StatCell
            label="Total profit"
            value={formatUsd(totalProfit)}
            accent={totalProfit >= 0 ? "gain" : "loss"}
          />
          <StatCell
            label="Current portfolio"
            value={formatUsd(totalBalance)}
          />
          <StatCell
            label="Avg P&L (tracked)"
            value={`${avgMarginPct >= 0 ? "+" : ""}${avgMarginPct.toFixed(1)}%`}
            accent={avgMarginPct >= 0 ? "gain" : "loss"}
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* POSITIONS TABLE */}
        <div className="rounded-lg border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Coins size={14} weight="fill" className="text-primary" />
              <span className="text-h2 font-semibold text-text-primary">
                Current positions
              </span>
              <span className="num rounded-sm bg-elevated px-1.5 py-0.5 text-micro text-text-secondary">
                {positions.length}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-[minmax(0,1fr)_110px_110px_110px_80px] items-center gap-3 border-b border-border bg-base/40 px-4 py-2 text-micro font-medium uppercase tracking-wider text-text-muted">
                <div>Token</div>
                <div className="text-right">Cost</div>
                <div className="text-right">Value</div>
                <div className="text-right">P&L</div>
                <div className="text-right">Margin</div>
              </div>

              {isLoading ? (
                <div className="p-6 text-center text-small text-text-muted">
                  Loading…
                </div>
              ) : sortedPositions.length === 0 ? (
                <div className="p-6 text-center text-small text-text-muted">
                  No positions.
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {sortedPositions
                    .slice(posPage * posPageSize, (posPage + 1) * posPageSize)
                    .map((p: any, i: number) => {
                    const pnl = p._pnl;
                    const pct = p._pct;
                    return (
                      <li
                        key={p.token_id ?? i}
                        className="grid grid-cols-[minmax(0,1fr)_110px_110px_110px_80px] items-center gap-3 px-4 py-2.5 transition-colors hover:bg-elevated"
                      >
                        <Link
                          href={`/tokens/${p.token_id}`}
                          className="flex min-w-0 items-center gap-2.5 group"
                        >
                          <TokenLogo
                            symbol={p.symbol}
                            chain={p.chain}
                            tokenId={p.token_id}
                            size={24}
                          />
                          <div className="min-w-0">
                            <div className="truncate text-body font-semibold text-text-primary group-hover:text-primary">
                              ${p.symbol ?? "?"}
                            </div>
                            <div className="truncate text-micro text-text-muted">
                              {p.chain}
                            </div>
                          </div>
                        </Link>

                        {/* Cost (entry value) */}
                        <div className="num text-right text-small text-text-secondary">
                          {p._cost !== null && p._cost > 0
                            ? formatUsd(p._cost)
                            : "—"}
                        </div>

                        {/* Value (current balance) */}
                        <div className="num text-right text-small text-text-primary">
                          {p._balance > 0 ? formatUsd(p._balance) : "—"}
                        </div>

                        {/* P&L = realized + unrealized */}
                        <div className="text-right">
                          {pnl !== null ? (
                            <span
                              className={cn(
                                "num text-small font-semibold",
                                pnl >= 0 ? "text-gain" : "text-loss",
                              )}
                            >
                              {pnl >= 0 ? "+" : ""}
                              {formatUsd(pnl)}
                            </span>
                          ) : (
                            <span
                              className="text-micro text-text-muted"
                              title="No P&L data from AVE for this token"
                            >
                              open
                            </span>
                          )}
                        </div>

                        {/* Margin % */}
                        <div className="text-right">
                          {pct !== null ? (
                            <span
                              className={cn(
                                "num text-small font-semibold",
                                pct >= 0 ? "text-gain" : "text-loss",
                              )}
                            >
                              {formatPct(pct)}
                            </span>
                          ) : (
                            <span className="text-micro text-text-muted">—</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
          {sortedPositions.length > 0 && (
            <Pagination
              total={sortedPositions.length}
              page={posPage}
              pageSize={posPageSize}
              onPageChange={setPosPage}
              onPageSizeChange={(n) => {
                setPosPageSize(n);
                setPosPage(0);
              }}
            />
          )}
        </div>

        {/* RIGHT RAIL */}
        <div className="space-y-4">
          {/* Cabal panel */}
          {cluster && (
            <div className="rounded-lg border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <UsersThree
                    size={14}
                    weight="fill"
                    className="text-primary"
                  />
                  <span className="text-body font-semibold text-text-primary">
                    Cabal #{cluster.cluster_id}
                  </span>
                </div>
                <Link
                  href={`/clusters/${cluster.cluster_id}`}
                  className="text-micro uppercase tracking-wider text-text-secondary hover:text-text-primary"
                >
                  View →
                </Link>
              </div>
              <div className="p-3 text-small text-text-secondary">
                <div className="num text-body text-text-primary">
                  {cluster.size}{" "}
                  <span className="text-text-secondary">wallets</span>
                </div>
                <div className="mt-1 text-micro uppercase tracking-wider text-text-muted">
                  {cluster.chain}
                </div>
              </div>
            </div>
          )}

          {/* Connected wallets */}
          {neighbors.length > 0 && (
            <div className="rounded-lg border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <LinkSimple size={14} weight="bold" className="text-primary" />
                  <span className="text-body font-semibold text-text-primary">
                    Connections
                  </span>
                </div>
                <span className="num text-micro text-text-muted">
                  {neighbors.length}
                </span>
              </div>
              <ul className="max-h-[200px] divide-y divide-border overflow-y-auto">
                {neighbors.map((n: any) => (
                  <li key={n.address}>
                    <Link
                      href={`/wallets/${n.address}`}
                      className="flex items-center justify-between gap-2 px-3 py-1.5 text-small hover:bg-elevated"
                    >
                      <span className="num truncate text-text-primary">
                        {formatAddress(n.address, 6, 4)}
                      </span>
                      <span className="num text-micro text-text-muted">
                        {n.shared_count} shared
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recent signals involving this wallet */}
          {signals.length > 0 && (
            <div className="rounded-lg border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Lightning
                    size={14}
                    weight="fill"
                    className="text-primary"
                  />
                  <span className="text-body font-semibold text-text-primary">
                    Recent signals
                  </span>
                </div>
                <span className="num text-micro text-text-muted">
                  {signals.length}
                </span>
              </div>
              <ul className="divide-y divide-border">
                {signals.slice(0, 6).map((s: any) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-2 px-3 py-2 text-small hover:bg-elevated"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-text-primary">
                        ${s.symbol ?? s.token_id?.split("-")[0]?.slice(0, 6)}
                      </div>
                      <div className="text-micro text-text-muted">
                        Cabal #{s.cluster_id} ·{" "}
                        {s.detected_at
                          ? formatRelativeTime(s.detected_at)
                          : "—"}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Badge variant={STATUS_VARIANT[s.status] ?? "default"}>
                        {s.status ?? "watch"}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: "gain" | "loss";
}) {
  return (
    <div className="bg-surface px-4 py-3">
      <div className="label-micro">{label}</div>
      <div
        className={cn(
          "num mt-1 text-h1 font-semibold text-text-primary",
          accent === "gain" && "text-gain",
          accent === "loss" && "text-loss",
        )}
      >
        {value}
      </div>
    </div>
  );
}
