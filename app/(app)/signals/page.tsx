"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CaretLeft, CaretRight, Lightning } from "@phosphor-icons/react";
import {
  SignalRow,
  SignalRowHeaders,
} from "@/components/signals/SignalRow";
import {
  SignalsFilters,
  type ChainFilter,
  type SortKey,
  type Source,
  type StatusFilter,
} from "@/components/signals/SignalsFilters";
import { useLiveSignals } from "@/lib/hooks/useSignals";
import { useBacktests } from "@/lib/hooks/useBacktests";
import { useTokenMarkets } from "@/lib/hooks/useTokenMarkets";

export default function SignalsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [source, setSource] = useState<Source>("backtest");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [chain, setChain] = useState<ChainFilter>("all");
  const [sort, setSort] = useState<SortKey>("peak_desc");
  const [minConviction, setMinConviction] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  // Reset to first page whenever filters change
  useEffect(() => {
    setPage(0);
  }, [source, status, chain, minConviction, sort, pageSize]);

  const { data: liveData, isLoading: liveLoading } = useLiveSignals(60 * 24, 200);
  const { data: btData, isLoading: btLoading } = useBacktests({ limit: 200 });

  const raw = source === "live"
    ? (Array.isArray(liveData) ? liveData : [])
    : (Array.isArray(btData) ? btData : []).map((b: any) => ({
        ...b,
        detected_at: b.first_entry_at,
      }));

  const filtered = useMemo(() => {
    let rows = [...raw];
    if (status !== "all") rows = rows.filter((r: any) => r.status === status);
    if (chain !== "all") rows = rows.filter((r: any) => r.chain === chain);
    if (minConviction > 0)
      rows = rows.filter(
        (r: any) => (r.conviction_score ?? 0) >= minConviction,
      );

    switch (sort) {
      case "peak_desc":
        rows.sort((a, b) => (b.peak_pnl_pct ?? -Infinity) - (a.peak_pnl_pct ?? -Infinity));
        break;
      case "peak_asc":
        rows.sort((a, b) => (a.peak_pnl_pct ?? Infinity) - (b.peak_pnl_pct ?? Infinity));
        break;
      case "conviction_desc":
        rows.sort(
          (a, b) => (b.conviction_score ?? 0) - (a.conviction_score ?? 0),
        );
        break;
      case "recent":
        rows.sort((a, b) => {
          const ta = new Date(a.detected_at ?? 0).getTime();
          const tb = new Date(b.detected_at ?? 0).getTime();
          return tb - ta;
        });
        break;
    }
    return rows;
  }, [raw, status, chain, minConviction, sort]);

  const openDrawer = (signalId: string) => {
    const next = new URLSearchParams(params.toString());
    next.set("signal", signalId);
    router.replace(`${pathname}?${next.toString()}`);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * pageSize;
  const end = start + pageSize;
  const pageRows = filtered.slice(start, end);

  const tokenIds = pageRows.map((r) => r.token_id);
  const { data: markets } = useTokenMarkets(tokenIds);

  const mode = source === "live" ? "live" : "backtest";
  const loading = source === "live" ? liveLoading : btLoading;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-h1 font-semibold text-text-primary">Signals</h1>
        <p className="text-small text-text-secondary">
          Every cluster movement detected — filter, sort, explore.
        </p>
      </div>

      <SignalsFilters
        source={source}
        onSource={setSource}
        status={status}
        onStatus={setStatus}
        chain={chain}
        onChain={setChain}
        sort={sort}
        onSort={setSort}
        minConviction={minConviction}
        onMinConviction={setMinConviction}
        total={filtered.length}
      />

      <div className="rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Lightning size={14} weight="fill" className="text-primary" />
            <span className="text-h2 font-semibold text-text-primary">
              {source === "live" ? "Live signals" : "Backtested signals"}
            </span>
            {source === "live" ? (
              <span className="ml-1 inline-flex items-center gap-1 rounded-sm bg-primary-faint px-1.5 py-0.5 text-micro font-medium text-primary">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                LIVE
              </span>
            ) : (
              <span className="ml-1 rounded-sm bg-elevated px-1.5 py-0.5 text-micro font-medium text-text-secondary">
                7D BACKTEST
              </span>
            )}
            <span className="num ml-1 text-micro text-text-muted">
              {filtered.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1080px]">
            <SignalRowHeaders mode={mode} />

            {loading ? (
              <div className="p-8 text-center text-small text-text-muted">
                Loading…
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Lightning
                  size={36}
                  weight="duotone"
                  className="mb-2 text-text-disabled"
                />
                <div className="text-small text-text-muted">
                  No signals match the current filters.
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {pageRows.map((r: any, idx: number) => {
                  const globalIdx = start + idx;
                  return (
                    <SignalRow
                      key={r.id}
                      row={r}
                      rank={globalIdx + 1}
                      market={markets?.[r.token_id]}
                      mode={mode}
                      highlighted={globalIdx === 0 && mode === "backtest"}
                      onClick={() => openDrawer(r.id)}
                    />
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-2.5">
            <div className="flex items-center gap-3 text-small text-text-secondary">
              <span className="num">
                {start + 1}–{Math.min(end, filtered.length)} of{" "}
                <span className="text-text-primary">{filtered.length}</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="label-micro">Rows</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-6 rounded border border-border bg-surface px-1.5 text-small text-text-primary focus:border-primary focus:outline-none"
                >
                  {[10, 25, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(0, safePage - 1))}
                disabled={safePage === 0}
                className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-surface px-2 text-small text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CaretLeft size={12} weight="bold" /> Prev
              </button>
              <span className="num px-2 text-small text-text-primary">
                Page {safePage + 1} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setPage(Math.min(totalPages - 1, safePage + 1))
                }
                disabled={safePage >= totalPages - 1}
                className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-surface px-2 text-small text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next <CaretRight size={12} weight="bold" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
