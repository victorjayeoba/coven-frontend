"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "@phosphor-icons/react";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { endpoints } from "@/lib/api/endpoints";
import { formatPct, formatUsd, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";

type Trade = {
  id: string;
  symbol?: string;
  chain?: string;
  token_id?: string;
  entry?: {
    size_usd?: number;
    price?: number;
    price_usd?: number;
    trigger?: { type?: string; source_wallet?: string };
  };
  current_price?: number;
  current_price_usd?: number;
  source?: "bot" | "signal";
  bot_id?: string;
  unrealized_pnl_usd?: number;
  unrealized_pnl_pct?: number;
  opened_at?: string;
};

export function PositionsTable({
  positions,
  isLoading,
}: {
  positions: Trade[];
  isLoading?: boolean;
}) {
  const qc = useQueryClient();
  const closeMutation = useMutation({
    mutationFn: (id: string) => endpoints.closeTrade(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trades"], exact: false });
      qc.invalidateQueries({ queryKey: ["pnl-summary"] });
    },
  });

  const handleClose = (t: Trade) => {
    const label = t.symbol ?? t.token_id ?? "this position";
    if (!confirm(`Close ${label} at market?`)) return;
    closeMutation.mutate(t.id);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <table className="w-full text-small">
        <thead className="bg-elevated">
          <tr className="text-left label-micro">
            <th className="px-4 py-2.5 font-medium">Token</th>
            <th className="px-4 py-2.5 font-medium">Size</th>
            <th className="px-4 py-2.5 font-medium">Entry</th>
            <th className="px-4 py-2.5 font-medium">Price</th>
            <th className="px-4 py-2.5 text-right font-medium">P&amp;L</th>
            <th className="px-4 py-2.5 text-right font-medium">%</th>
            <th className="px-4 py-2.5 text-right font-medium">Age</th>
            <th className="px-4 py-2.5 text-right font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {isLoading ? (
            <tr>
              <td colSpan={8} className="px-4 py-6 text-center text-text-muted">
                Loading positions…
              </td>
            </tr>
          ) : positions.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-6 text-center text-text-muted">
                No open positions.
              </td>
            </tr>
          ) : (
            positions.map((t) => {
              const symbol =
                t.symbol ?? t.token_id?.split("-")[0]?.slice(0, 6) ?? "?";
              const pct = t.unrealized_pnl_pct ?? 0;
              const pnl = t.unrealized_pnl_usd ?? 0;
              const positive = pct >= 0;
              return (
                <tr
                  key={t.id}
                  className="transition-colors hover:bg-row-hover"
                >
                  <td className="px-4 py-2.5">
                    <Link
                      href={t.token_id ? `/tokens/${t.token_id}` : "#"}
                      className="flex items-center gap-2"
                    >
                      <TokenLogo
                        symbol={symbol}
                        chain={t.chain}
                        tokenId={t.token_id}
                        size={22}
                      />
                      <span className="font-semibold text-text-primary">
                        ${symbol}
                      </span>
                      <span className="text-micro uppercase text-text-muted">
                        {t.chain}
                      </span>
                      {t.source === "bot" && (
                        <span
                          className="rounded-sm bg-info/10 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-info"
                          title="Opened by a bot"
                        >
                          Bot
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="num px-4 py-2.5 text-text-primary">
                    {formatUsd(t.entry?.size_usd ?? 0, 0)}
                  </td>
                  <td className="num px-4 py-2.5 text-text-secondary">
                    {formatUsd(t.entry?.price_usd ?? t.entry?.price ?? 0, 6)}
                  </td>
                  <td className="num px-4 py-2.5 text-text-secondary">
                    {formatUsd(t.current_price_usd ?? t.current_price ?? 0, 6)}
                  </td>
                  <td
                    className={cn(
                      "num px-4 py-2.5 text-right font-semibold",
                      positive ? "text-gain" : "text-loss",
                    )}
                  >
                    {formatUsd(pnl, 2)}
                  </td>
                  <td
                    className={cn(
                      "num px-4 py-2.5 text-right font-semibold",
                      positive ? "text-gain" : "text-loss",
                    )}
                  >
                    {formatPct(pct)}
                  </td>
                  <td className="num px-4 py-2.5 text-right text-text-muted">
                    {t.opened_at ? formatRelativeTime(t.opened_at) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleClose(t)}
                      disabled={
                        closeMutation.isPending &&
                        closeMutation.variables === t.id
                      }
                      className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-surface px-2 text-micro font-medium text-text-secondary transition-colors hover:border-loss/40 hover:text-loss disabled:cursor-not-allowed disabled:opacity-50"
                      title="Close at market"
                    >
                      <X size={11} weight="bold" />
                      {closeMutation.isPending &&
                      closeMutation.variables === t.id
                        ? "Closing…"
                        : "Close"}
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
