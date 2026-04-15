"use client";

import Link from "next/link";
import { ArrowRight, UsersThree } from "@phosphor-icons/react";
import { useClusters } from "@/lib/hooks/useTrades";
import { cn } from "@/lib/cn";

const CHAIN_DOT: Record<string, string> = {
  solana: "bg-chain-solana",
  bsc: "bg-chain-bsc",
  eth: "bg-chain-eth",
  base: "bg-chain-base",
  arbitrum: "bg-chain-arbitrum",
  polygon: "bg-chain-polygon",
};

export function CabalsList() {
  const { data, isLoading } = useClusters();
  const clusters = Array.isArray(data) ? data : [];
  const sorted = [...clusters].sort((a, b) => (a.size ?? 0) - (b.size ?? 0));

  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <UsersThree size={14} weight="fill" className="text-primary" />
          <span className="text-body font-semibold text-text-primary">
            Cabals
          </span>
          <span className="num rounded-sm bg-elevated px-1.5 text-micro text-text-secondary">
            {clusters.length}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="px-4 py-3 text-small text-text-muted">Loading…</div>
      ) : sorted.length === 0 ? (
        <div className="px-4 py-3 text-small text-text-muted">None yet.</div>
      ) : (
        <ul className="divide-y divide-border">
          {sorted.map((c: any) => {
            const chains = String(c.chain ?? "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            return (
              <li key={c.cluster_id}>
                <Link
                  href={`/graph?cabal=${c.cluster_id}`}
                  className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-elevated"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-body font-semibold text-text-primary">
                        Cabal #{c.cluster_id}
                      </span>
                      <div className="flex gap-1">
                        {chains.map((ch) => (
                          <span
                            key={ch}
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              CHAIN_DOT[ch] ?? "bg-text-muted",
                            )}
                            title={ch}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="mt-0.5 text-micro text-text-muted">
                      <span className="num">{c.size}</span> wallets
                    </div>
                  </div>
                  <ArrowRight size={12} className="text-text-muted" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
