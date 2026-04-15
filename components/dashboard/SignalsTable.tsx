"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CaretLeft, CaretRight, Fire } from "@phosphor-icons/react";
import { endpoints } from "@/lib/api/endpoints";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatUsd, formatPct } from "@/lib/format";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 10;

type ChainFilter = "all" | "solana" | "bsc";

type Mover = {
  token_id: string;
  chain: "solana" | "bsc";
  symbol: string | null;
  logo_url?: string | null;
  price_usd: number | null;
  price_change_1h: number | null;
  price_change_24h: number | null;
  volume_24h: number | null;
  liquidity: number | null;
  fdv: number | null;
  market_cap: number | null;
};

const MOVERS_GRID =
  "grid-cols-[28px_minmax(200px,1.6fr)_110px_80px_80px_110px_100px_110px]";

export function SignalsTable() {
  const router = useRouter();
  const [chainFilter, setChainFilter] = useState<ChainFilter>("all");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery<Mover[]>({
    queryKey: ["movers", "solana,bsc"],
    queryFn: () => endpoints.movers("solana,bsc", 100),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const filtered = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    return arr.filter((r) =>
      chainFilter === "all" ? true : r.chain === chainFilter,
    );
  }, [data, chainFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Reset to page 0 when filter changes or page becomes out-of-range
  useEffect(() => {
    if (page > totalPages - 1) setPage(0);
  }, [page, totalPages]);

  useEffect(() => {
    setPage(0);
  }, [chainFilter]);

  const rows = useMemo(
    () => filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [filtered, page],
  );

  // Live-update prices from the SSE stream — StreamProvider writes into the
  // ["token-markets"] cache when it receives `price.update` events. We listen
  // for the same raw event to patch our movers cache in lockstep.
  const qc = useQueryClient();
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPrice = (e: Event) => {
      const detail = (e as CustomEvent<any>).detail;
      if (!detail?.token_id) return;
      const queries = qc.getQueriesData<Mover[]>({
        queryKey: ["movers"],
        exact: false,
      });
      for (const [key, oldData] of queries) {
        if (!Array.isArray(oldData)) continue;
        const idx = oldData.findIndex((r) => r.token_id === detail.token_id);
        if (idx < 0) continue;
        const next = [...oldData];
        const prev = next[idx];
        next[idx] = {
          ...prev,
          ...(detail.price_usd != null ? { price_usd: detail.price_usd } : {}),
          ...(detail.price_change_1h != null
            ? { price_change_1h: detail.price_change_1h }
            : {}),
          ...(detail.price_change_24h != null
            ? { price_change_24h: detail.price_change_24h }
            : {}),
          ...(detail.volume_24h != null
            ? { volume_24h: detail.volume_24h }
            : {}),
          ...(detail.tvl != null ? { liquidity: detail.tvl } : {}),
        };
        qc.setQueryData(key, next);
      }
    };
    window.addEventListener("coven:price", onPrice as EventListener);
    return () =>
      window.removeEventListener("coven:price", onPrice as EventListener);
  }, [qc]);

  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Fire size={14} weight="fill" className="text-warning" />
          <span className="text-h2 font-semibold text-text-primary">
            Movers
          </span>
          <span className="ml-1 inline-flex items-center gap-1 rounded-sm bg-primary-faint px-1.5 py-0.5 text-[10px] font-medium text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            LIVE
          </span>
          <span className="num ml-1 text-micro text-text-muted">{rows.length}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md border border-border bg-base p-0.5">
            {(["all", "solana", "bsc"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setChainFilter(c)}
                className={cn(
                  "rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider transition-colors",
                  chainFilter === c
                    ? "bg-elevated text-text-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {c === "all" ? "All" : c === "solana" ? "SOL" : "BSC"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[980px]">
          <MoversHeaders />

          {isLoading ? (
            <ul className="divide-y divide-border">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <MoverRowSkeleton key={i} />
              ))}
            </ul>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <Fire
                size={32}
                weight="duotone"
                className="mb-2 text-text-disabled"
              />
              <div className="text-small text-text-muted">
                No tokens on this chain are pumping right now.
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((r, idx) => (
                <MoverRow
                  key={r.token_id}
                  row={r}
                  rank={page * PAGE_SIZE + idx + 1}
                  onClick={() => router.push(`/tokens/${r.token_id}`)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
          <div className="text-[11px] text-text-muted">
            <span className="num">
              {page * PAGE_SIZE + 1}–
              {Math.min(filtered.length, (page + 1) * PAGE_SIZE)}
            </span>{" "}
            of <span className="num">{filtered.length}</span>
          </div>
          <div className="inline-flex items-center gap-1.5">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border"
            >
              <CaretLeft size={10} /> Prev
            </button>
            <span className="num px-1 text-[11px] text-text-muted">
              Page {page + 1} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border"
            >
              Next <CaretRight size={10} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MoversHeaders() {
  return (
    <div
      className={cn(
        "grid items-center gap-2 border-b border-border bg-base/40 px-3 py-2 text-micro font-medium uppercase tracking-wider text-text-muted",
        MOVERS_GRID,
      )}
    >
      <div className="text-left">#</div>
      <div className="text-left">Token</div>
      <div className="text-right">Price</div>
      <div className="text-right">1H</div>
      <div className="text-right">24H</div>
      <div className="text-right">Vol 24H</div>
      <div className="text-right">Liquidity</div>
      <div className="text-right" title="Fully Diluted Valuation">
        FDV
      </div>
    </div>
  );
}

function MoverRow({
  row,
  rank,
  onClick,
}: {
  row: Mover;
  rank: number;
  onClick: () => void;
}) {
  const symbol =
    row.symbol ?? row.token_id.split("-")[0]?.slice(0, 6) ?? "—";
  return (
    <li
      onClick={onClick}
      className={cn(
        "grid cursor-pointer items-center gap-2 px-3 py-2.5 transition-colors hover:bg-elevated",
        MOVERS_GRID,
      )}
    >
      <span className="num text-small font-semibold text-text-muted">
        {rank}
      </span>

      <div className="flex min-w-0 items-center gap-2.5">
        <TokenLogo
          symbol={symbol}
          chain={row.chain}
          tokenId={row.token_id}
          logoUrl={row.logo_url ?? undefined}
          size={28}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-body font-semibold text-text-primary">
              ${symbol}
            </span>
            <span className="rounded-sm bg-elevated px-1 text-[10px] uppercase tracking-wider text-text-muted">
              {row.chain}
            </span>
          </div>
          <div className="truncate text-micro text-text-muted">
            {row.token_id.split("-")[0]?.slice(0, 10)}…
          </div>
        </div>
      </div>

      <PriceCell value={row.price_usd} />
      <PctCell value={row.price_change_1h} />
      <PctCell value={row.price_change_24h} />
      <USDCell value={row.volume_24h} />
      <USDCell value={row.liquidity} />
      <USDCell value={row.fdv} />
    </li>
  );
}

function MoverRowSkeleton() {
  return (
    <li
      className={cn(
        "grid items-center gap-2 px-3 py-2.5",
        MOVERS_GRID,
      )}
    >
      <Skeleton w={14} h={12} />
      <div className="flex min-w-0 items-center gap-2.5">
        <Skeleton w={28} h={28} rounded="full" />
        <div className="min-w-0 space-y-1.5">
          <Skeleton w={80} h={12} />
          <Skeleton w={60} h={9} />
        </div>
      </div>
      <div className="flex justify-end"><Skeleton w={56} h={12} /></div>
      <div className="flex justify-end"><Skeleton w={40} h={12} /></div>
      <div className="flex justify-end"><Skeleton w={46} h={12} /></div>
      <div className="flex justify-end"><Skeleton w={60} h={12} /></div>
      <div className="flex justify-end"><Skeleton w={56} h={12} /></div>
      <div className="flex justify-end"><Skeleton w={60} h={12} /></div>
    </li>
  );
}

function PriceCell({ value }: { value: number | null }) {
  if (value === null || value === undefined) {
    return (
      <div className="text-right">
        <span className="num text-small text-text-muted">—</span>
      </div>
    );
  }
  return (
    <div className="text-right">
      <span className="num text-small text-text-primary">
        {value < 0.01 ? `$${value.toPrecision(3)}` : `$${value.toFixed(value < 1 ? 4 : 2)}`}
      </span>
    </div>
  );
}

function PctCell({ value }: { value: number | null }) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return (
      <div className="text-right">
        <span className="num text-small text-text-muted">—</span>
      </div>
    );
  }
  return (
    <div className="text-right">
      <span
        className={cn(
          "num text-small font-medium",
          value >= 0 ? "text-gain" : "text-loss",
        )}
      >
        {formatPct(value)}
      </span>
    </div>
  );
}

function USDCell({ value }: { value: number | null }) {
  if (value === null || value === undefined) {
    return (
      <div className="text-right">
        <span className="num text-small text-text-muted">—</span>
      </div>
    );
  }
  return (
    <div className="text-right">
      <span className="num text-small text-text-primary">
        {formatUsd(value, 2)}
      </span>
    </div>
  );
}
