"use client";

import Link from "next/link";
import { ArrowRight, X, Wallet as WalletIcon } from "@phosphor-icons/react";
import { useWalletDetail } from "@/lib/hooks/useWalletGraph";
import { formatAddress, formatUsd } from "@/lib/format";
import { cn } from "@/lib/cn";

export function WalletDetail({
  address,
  onClose,
}: {
  address: string | null;
  onClose: () => void;
}) {
  const { data, isLoading } = useWalletDetail(address);

  if (!address) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-center text-small text-text-muted">
        Click a wallet on the graph to see its history.
      </div>
    );
  }

  const tokens = Array.isArray(data?.tokens) ? data.tokens : [];
  const alpha = Number(data?.alpha_score ?? 0);
  const totalProfit = Number(data?.total_profit ?? 0);

  return (
    <div className="rounded-lg border border-border bg-surface/95 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <div className="flex items-center gap-2">
          <WalletIcon size={14} weight="fill" className="text-primary" />
          <span className="text-small font-semibold text-text-primary">
            Selected wallet
          </span>
        </div>
        <button
          onClick={onClose}
          className="grid h-6 w-6 place-items-center rounded-md text-text-muted hover:bg-elevated hover:text-text-primary"
        >
          <X size={12} weight="bold" />
        </button>
      </div>

      <div className="space-y-3 p-3">
        <div>
          <div className="label-micro">Address</div>
          <div className="num mt-1 text-body font-semibold text-text-primary">
            {formatAddress(address, 8, 6)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="label-micro">Alpha score</div>
            <div
              className={cn(
                "num mt-1 text-body font-semibold",
                alpha > 1 ? "text-gain" : "text-text-primary",
              )}
            >
              {alpha.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="label-micro">Total profit</div>
            <div className="num mt-1 text-body font-semibold text-gain">
              {formatUsd(totalProfit)}
            </div>
          </div>
        </div>

        <div>
          <div className="label-micro">
            Current positions · {tokens.length}
          </div>
          <ul className="mt-2 max-h-[180px] divide-y divide-border overflow-y-auto rounded-md border border-border">
            {isLoading ? (
              <li className="px-3 py-3 text-small text-text-muted">Loading…</li>
            ) : tokens.length === 0 ? (
              <li className="px-3 py-3 text-small text-text-muted">
                No holdings returned.
              </li>
            ) : (
              [...tokens]
                .map((t: any) => {
                  const balance = Number(t.balance_usd);
                  const tp = Number(t.total_profit);
                  const up = Number(t.unrealized_profit);
                  const pnl = Number.isFinite(tp) && tp !== 0
                    ? tp
                    : Number.isFinite(up) && up !== 0
                      ? up
                      : null;
                  return {
                    ...t,
                    _balance: Number.isFinite(balance) ? balance : 0,
                    _pnl: pnl,
                  };
                })
                .sort((a, b) => {
                  // Sort by balance USD (biggest holdings first)
                  return (b._balance ?? 0) - (a._balance ?? 0);
                })
                .slice(0, 10)
                .map((t: any, i: number) => (
                  <li
                    key={t.token_id ?? i}
                    className="flex items-center justify-between gap-2 px-3 py-1.5 text-small"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-text-primary">
                        ${t.symbol ?? "?"}
                      </div>
                      <div className="truncate text-micro text-text-muted">
                        {t.chain ?? ""}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="num text-small font-semibold text-text-primary">
                        {t._balance > 0 ? formatUsd(t._balance) : "—"}
                      </div>
                      {t._pnl !== null ? (
                        <div
                          className={cn(
                            "num text-micro",
                            t._pnl >= 0 ? "text-gain" : "text-loss",
                          )}
                        >
                          {t._pnl >= 0 ? "+" : ""}
                          {formatUsd(t._pnl)}
                        </div>
                      ) : (
                        <div className="text-micro text-text-muted">
                          current bal
                        </div>
                      )}
                    </div>
                  </li>
                ))
            )}
          </ul>
        </div>

        <Link
          href={`/wallets/${address}`}
          className="inline-flex h-8 w-full items-center justify-center gap-2 rounded-md bg-primary text-small font-medium text-base transition-colors hover:bg-primary-hover"
        >
          View full wallet
          <ArrowRight size={12} weight="bold" />
        </Link>
      </div>
    </div>
  );
}
