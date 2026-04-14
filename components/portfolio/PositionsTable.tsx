"use client";

import Link from "next/link";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { formatPct, formatUsd, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";

type Trade = {
  id: string;
  symbol?: string;
  chain?: string;
  token_id?: string;
  entry?: { size_usd?: number; price?: number };
  current_price?: number;
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
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {isLoading ? (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-text-muted">
                Loading positions…
              </td>
            </tr>
          ) : positions.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-text-muted">
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
                    </Link>
                  </td>
                  <td className="num px-4 py-2.5 text-text-primary">
                    {formatUsd(t.entry?.size_usd ?? 0, 0)}
                  </td>
                  <td className="num px-4 py-2.5 text-text-secondary">
                    {formatUsd(t.entry?.price ?? 0, 4)}
                  </td>
                  <td className="num px-4 py-2.5 text-text-secondary">
                    {formatUsd(t.current_price ?? 0, 4)}
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
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
