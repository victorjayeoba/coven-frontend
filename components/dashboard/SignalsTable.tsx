"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Lightning } from "@phosphor-icons/react";
import {
  SignalRow,
  SignalRowHeaders,
} from "@/components/signals/SignalRow";
import { useLiveSignals } from "@/lib/hooks/useSignals";
import { useBacktests } from "@/lib/hooks/useBacktests";
import { useTokenMarkets } from "@/lib/hooks/useTokenMarkets";

export function SignalsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const openDrawer = (signalId: string) => {
    const next = new URLSearchParams(params.toString());
    next.set("signal", signalId);
    router.replace(`${pathname}?${next.toString()}`);
  };

  const { data: liveData, isLoading: liveLoading } = useLiveSignals(240, 15);
  const { data: btData, isLoading: btLoading } = useBacktests({ limit: 15 });

  const { rows, mode, loading } = useMemo(() => {
    const live = Array.isArray(liveData) ? liveData : [];
    const bt = Array.isArray(btData) ? btData : [];
    if (live.length > 0) {
      return {
        rows: live,
        mode: "live" as const,
        loading: liveLoading,
      };
    }
    const mapped = [...bt]
      .map((b: any) => ({ ...b, detected_at: b.first_entry_at }))
      .sort((a, b) => (b.peak_pnl_pct ?? 0) - (a.peak_pnl_pct ?? 0));
    return { rows: mapped, mode: "backtest" as const, loading: btLoading };
  }, [liveData, btData, liveLoading, btLoading]);

  const tokenIds = rows.slice(0, 15).map((r) => r.token_id);
  const { data: markets } = useTokenMarkets(tokenIds);

  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Lightning size={14} weight="fill" className="text-primary" />
          <span className="text-h2 font-semibold text-text-primary">
            Signal Screener
          </span>
          {mode === "live" ? (
            <span className="ml-1 inline-flex items-center gap-1 rounded-sm bg-primary-faint px-1.5 py-0.5 text-micro font-medium text-primary">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              LIVE
            </span>
          ) : (
            <span className="ml-1 rounded-sm bg-elevated px-1.5 py-0.5 text-micro font-medium text-text-secondary">
              BACKTEST · 7D
            </span>
          )}
          <span className="num ml-1 text-micro text-text-muted">{rows.length}</span>
        </div>
        <Link
          href="/signals"
          className="inline-flex items-center gap-1 text-small text-text-secondary hover:text-text-primary"
        >
          View all <ArrowRight size={12} />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1080px]">
          <SignalRowHeaders mode={mode} />

          {loading ? (
            <div className="p-8 text-center text-small text-text-muted">
              Loading…
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Lightning
                size={36}
                weight="duotone"
                className="mb-2 text-text-disabled"
              />
              <div className="text-small text-text-muted">
                Scanner listening. Signals will populate as clusters move.
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {rows.slice(0, 15).map((r: any, idx: number) => (
                <SignalRow
                  key={r.id}
                  row={r}
                  rank={idx + 1}
                  market={markets?.[r.token_id]}
                  mode={mode}
                  highlighted={idx === 0 && mode === "backtest"}
                  onClick={() => openDrawer(r.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
