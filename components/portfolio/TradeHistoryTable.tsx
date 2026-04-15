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
  entry?: { size_usd?: number; price?: number; price_usd?: number };
  exit?: { price?: number; price_usd?: number; reason?: string };
  source?: "bot" | "signal";
  pnl_usd?: number;
  pnl_pct?: number;
  closed_at?: string;
  hold_duration_sec?: number;
};

function fmtHold(sec?: number) {
  if (!sec || sec <= 0) return "—";
  if (sec < 60) return `${sec.toFixed(0)}s`;
  if (sec < 3600) return `${(sec / 60).toFixed(0)}m`;
  if (sec < 86400) return `${(sec / 3600).toFixed(1)}h`;
  return `${(sec / 86400).toFixed(1)}d`;
}

export function TradeHistoryTable({
  trades,
  isLoading,
}: {
  trades: Trade[];
  isLoading?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full min-w-[760px] text-small">
        <thead className="bg-elevated">
          <tr className="text-left label-micro">
            <th className="px-4 py-2.5 font-medium">Token</th>
            <th className="px-4 py-2.5 font-medium">Size</th>
            <th className="px-4 py-2.5 font-medium">Entry → Exit</th>
            <th className="px-4 py-2.5 font-medium">Exit Reason</th>
            <th className="px-4 py-2.5 text-right font-medium">P&amp;L</th>
            <th className="px-4 py-2.5 text-right font-medium">%</th>
            <th className="px-4 py-2.5 text-right font-medium">Hold</th>
            <th className="px-4 py-2.5 text-right font-medium">Closed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {isLoading ? (
            <tr>
              <td colSpan={8} className="px-4 py-6 text-center text-text-muted">
                Loading history…
              </td>
            </tr>
          ) : trades.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-6 text-center text-text-muted">
                No closed trades yet.
              </td>
            </tr>
          ) : (
            trades.map((t) => {
              const symbol =
                t.symbol ?? t.token_id?.split("-")[0]?.slice(0, 6) ?? "?";
              const pct = t.pnl_pct ?? 0;
              const pnl = t.pnl_usd ?? 0;
              const positive = pnl >= 0;
              return (
                <tr key={t.id} className="transition-colors hover:bg-row-hover">
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
                    <span className="mx-1 text-text-muted">→</span>
                    {formatUsd(t.exit?.price_usd ?? t.exit?.price ?? 0, 6)}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="rounded-sm bg-elevated px-1.5 py-0.5 text-micro uppercase text-text-secondary">
                      {t.exit?.reason ?? "—"}
                    </span>
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
                    {fmtHold(t.hold_duration_sec)}
                  </td>
                  <td className="num px-4 py-2.5 text-right text-text-muted">
                    {t.closed_at ? formatRelativeTime(t.closed_at) : "—"}
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
