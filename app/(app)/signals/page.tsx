"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Lightning } from "@phosphor-icons/react";
import { Pagination } from "@/components/ui/Pagination";
import {
  SignalRow,
  SignalRowHeaders,
  SignalRowSkeleton,
} from "@/components/signals/SignalRow";
import {
  SignalsFilters,
  type ChainFilter,
  type SortKey,
  type Source,
  type StatusFilter,
  type TypeFilter,
} from "@/components/signals/SignalsFilters";
import { useLiveSignals } from "@/lib/hooks/useSignals";
import { useBacktests } from "@/lib/hooks/useBacktests";
import { useTokenMarkets } from "@/lib/hooks/useTokenMarkets";

export default function SignalsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [source, setSource] = useState<Source>("live");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [chain, setChain] = useState<ChainFilter>("all");
  const [signalType, setSignalType] = useState<TypeFilter>("all");
  const [sort, setSort] = useState<SortKey>("peak_desc");
  const [minConviction, setMinConviction] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    setPage(0);
  }, [source, status, chain, signalType, minConviction, sort, pageSize]);

  const { data: liveData, isLoading: liveLoading } = useLiveSignals(60 * 24, 200);
  const { data: btData, isLoading: btLoading } = useBacktests({ limit: 200 });

  const raw = source === "live"
    ? (Array.isArray(liveData) ? liveData : [])
    : (Array.isArray(btData) ? btData : []).map((b: any) => ({
        ...b,
        detected_at: b.first_entry_at,
      }));

  const rawFiltered = useMemo(() => {
    let rows = [...raw];
    if (status !== "all") rows = rows.filter((r: any) => r.status === status);
    if (chain !== "all") rows = rows.filter((r: any) => r.chain === chain);
    if (signalType !== "all") {
      rows = rows.filter(
        (r: any) => (r.signal_type ?? "cluster") === signalType,
      );
    }
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
  }, [raw, status, chain, signalType, minConviction, sort]);

  // Detector now upserts one signal per (token, cluster), so no client-side
  // dedup is needed — the API already returns a clean list.
  const filtered = rawFiltered;

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
        signalType={signalType}
        onSignalType={setSignalType}
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
              <ul className="divide-y divide-border">
                {Array.from({ length: Math.min(pageSize, 8) }).map((_, i) => (
                  <SignalRowSkeleton key={i} mode={mode} />
                ))}
              </ul>
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
                      onClick={() => router.push(`/tokens/${r.token_id}`)}
                    />
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <Pagination
          total={filtered.length}
          page={safePage}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(n) => {
            setPageSize(n);
            setPage(0);
          }}
        />
      </div>
    </div>
  );
}
