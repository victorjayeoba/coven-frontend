"use client";

import type { GraphCluster } from "@/lib/hooks/useWalletGraph";
import { cn } from "@/lib/cn";

const CLUSTER_COLORS = [
  "#3cc47b",
  "#5b9bff",
  "#f5a524",
  "#a855f7",
  "#ef4a5f",
  "#14f195",
  "#f472b6",
  "#34d399",
];

export function CabalPicker({
  clusters,
  selected,
  onSelect,
}: {
  clusters: GraphCluster[];
  selected: number | null;
  onSelect: (id: number | null) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <span className="text-small font-semibold text-text-primary">Cabals</span>
        {selected !== null && (
          <button
            onClick={() => onSelect(null)}
            className="text-micro uppercase tracking-wider text-text-secondary hover:text-text-primary"
          >
            Clear
          </button>
        )}
      </div>
      <ul className="max-h-[240px] overflow-y-auto divide-y divide-border">
        {clusters.length === 0 ? (
          <li className="px-3 py-4 text-center text-small text-text-muted">
            No cabals yet.
          </li>
        ) : (
          clusters.map((c) => {
            const color = CLUSTER_COLORS[c.cluster_id % CLUSTER_COLORS.length];
            const active = selected === c.cluster_id;
            const chains = String(c.chain ?? "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            return (
              <li key={c.cluster_id}>
                <button
                  onClick={() => onSelect(active ? null : c.cluster_id)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
                    active ? "bg-elevated" : "hover:bg-elevated",
                  )}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-body font-semibold text-text-primary">
                      Cabal #{c.cluster_id}
                    </div>
                    <div className="text-micro text-text-muted">
                      <span className="num">{c.size}</span> wallets · {chains.join(", ") || "?"}
                    </div>
                  </div>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
