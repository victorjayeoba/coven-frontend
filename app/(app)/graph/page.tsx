"use client";

import { useMemo, useState } from "react";
import { ArrowsIn, Graph, LinkSimple, UsersThree, X } from "@phosphor-icons/react";
import { WalletGraph } from "@/components/graph/WalletGraph";
import { WalletDetail } from "@/components/graph/WalletDetail";
import { useWalletGraph } from "@/lib/hooks/useWalletGraph";
import { cn } from "@/lib/cn";

type ChainFilter = "all" | "solana" | "bsc";

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

export default function GraphPage() {
  const [chain, setChain] = useState<ChainFilter>("all");
  const [cabalsOnly, setCabalsOnly] = useState(true);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [legendOpen, setLegendOpen] = useState(true);

  const { data, isLoading } = useWalletGraph({
    chain: chain === "all" ? undefined : chain,
  });

  const { nodes, edges, clusters } = useMemo(() => {
    const allClusters = data?.clusters ?? [];
    const allNodes = data?.nodes ?? [];
    const allEdges = data?.edges ?? [];

    const walletToCluster = new Map<string, number>();
    const clusterChains = new Map<number, Set<string>>();
    allClusters.forEach((c) => {
      c.wallet_addresses.forEach((w) => walletToCluster.set(w, c.cluster_id));
      const chSet = new Set<string>();
      String(c.chain ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((v) => chSet.add(v));
      clusterChains.set(c.cluster_id, chSet);
    });

    let visibleClusters = allClusters;
    if (chain !== "all") {
      visibleClusters = allClusters.filter((c) =>
        clusterChains.get(c.cluster_id)?.has(chain),
      );
    }

    let visibleNodes = allNodes;
    if (cabalsOnly) {
      const inCabal = new Set<string>();
      visibleClusters.forEach((c) =>
        c.wallet_addresses.forEach((w) => inCabal.add(w)),
      );
      visibleNodes = allNodes.filter((n) => inCabal.has(n.address));
    }

    const visibleAddresses = new Set(visibleNodes.map((n) => n.address));
    const visibleEdges = allEdges.filter(
      (e) => visibleAddresses.has(e.source) && visibleAddresses.has(e.target),
    );

    return {
      nodes: visibleNodes,
      edges: visibleEdges,
      clusters: visibleClusters,
    };
  }, [data, chain, cabalsOnly]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h1 className="text-h1 font-semibold text-text-primary">Wallet Graph</h1>
        <p className="text-small text-text-secondary">
          Smart money cabals and their shared token history, visualized.
        </p>
      </div>

      {/* Graph canvas — full width with floating overlays */}
      <div className="relative h-[calc(100vh-200px)] min-h-[560px] overflow-hidden rounded-lg border border-border bg-base">
        {/* Graph */}
        {isLoading ? (
          <div className="grid h-full w-full place-items-center text-small text-text-muted">
            Building graph…
          </div>
        ) : nodes.length === 0 ? (
          <div className="grid h-full w-full place-items-center text-small text-text-muted">
            No wallets in graph for this chain.
          </div>
        ) : (
          <WalletGraph
            nodes={nodes}
            edges={edges}
            clusters={clusters}
            highlightCluster={highlight}
            selectedAddress={selected}
            onNodeClick={(addr) => setSelected(addr)}
          />
        )}

        {/* TOP-LEFT: filters overlay */}
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCabalsOnly((v) => !v)}
            className={cn(
              "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-micro font-medium uppercase tracking-wider backdrop-blur transition-colors",
              cabalsOnly
                ? "border-primary/40 bg-primary-faint text-primary"
                : "border-border bg-surface/80 text-text-secondary hover:text-text-primary",
            )}
          >
            <span
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full",
                cabalsOnly ? "bg-primary" : "bg-text-muted",
              )}
            />
            Cabals only
          </button>

          <div className="inline-flex rounded-md border border-border bg-surface/80 p-0.5 backdrop-blur">
            {(
              [
                { label: "All", value: "all" },
                { label: "Solana", value: "solana" },
                { label: "BSC", value: "bsc" },
              ] as { label: string; value: ChainFilter }[]
            ).map((o) => (
              <button
                key={o.value}
                onClick={() => setChain(o.value)}
                className={cn(
                  "rounded px-2.5 py-1.5 text-micro font-medium uppercase tracking-wider transition-colors",
                  chain === o.value
                    ? "bg-elevated text-text-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* TOP-RIGHT: stats pills */}
        <div className="absolute right-3 top-3 flex flex-wrap items-center gap-2">
          <StatPill
            icon={<UsersThree size={12} weight="fill" className="text-primary" />}
            label="Cabals"
            value={clusters.length}
          />
          <StatPill
            icon={<Graph size={12} weight="fill" className="text-primary" />}
            label="Wallets"
            value={nodes.length}
          />
          <StatPill
            icon={<LinkSimple size={12} weight="bold" className="text-primary" />}
            label="Edges"
            value={edges.length}
          />
        </div>

        {/* BOTTOM-LEFT: cabal legend */}
        {clusters.length > 0 && (
          <div
            className={cn(
              "absolute bottom-3 left-3 w-56 rounded-md border border-border bg-surface/90 backdrop-blur transition-all",
              legendOpen ? "" : "w-auto",
            )}
          >
            <button
              onClick={() => setLegendOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-2 border-b border-border px-3 py-2"
            >
              <span className="text-small font-semibold text-text-primary">
                Cabals
              </span>
              <span className="num text-micro text-text-muted">
                {clusters.length}
              </span>
            </button>
            {legendOpen && (
              <ul className="max-h-[220px] overflow-y-auto">
                {clusters.map((c) => {
                  const color =
                    CLUSTER_COLORS[c.cluster_id % CLUSTER_COLORS.length];
                  const active = highlight === c.cluster_id;
                  return (
                    <li key={c.cluster_id}>
                      <button
                        onClick={() =>
                          setHighlight(active ? null : c.cluster_id)
                        }
                        className={cn(
                          "flex w-full items-center gap-2 border-b border-border/50 px-3 py-1.5 text-left transition-colors hover:bg-elevated",
                          active && "bg-elevated",
                        )}
                      >
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-body font-semibold text-text-primary">
                            Cabal #{c.cluster_id}
                          </div>
                          <div className="truncate text-micro text-text-muted">
                            <span className="num">{c.size}</span> wallets ·{" "}
                            {c.chain ?? "?"}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {highlight !== null && (
              <button
                onClick={() => setHighlight(null)}
                className="flex w-full items-center justify-center gap-1 border-t border-border px-3 py-2 text-micro uppercase tracking-wider text-text-muted hover:text-text-primary"
              >
                <ArrowsIn size={10} weight="bold" /> Clear highlight
              </button>
            )}
          </div>
        )}

        {/* BOTTOM-RIGHT: selected wallet overlay */}
        {selected && (
          <div className="absolute bottom-3 right-3 w-80">
            <WalletDetail
              address={selected}
              onClose={() => setSelected(null)}
            />
          </div>
        )}

        {/* Help hint if nothing selected */}
        {!selected && clusters.length > 0 && (
          <div className="pointer-events-none absolute bottom-3 right-3 rounded-md border border-border bg-surface/70 px-3 py-2 text-micro text-text-muted backdrop-blur">
            Click a node to inspect its history
          </div>
        )}
      </div>
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-surface/80 px-2.5 text-small backdrop-blur">
      {icon}
      <span className="label-micro">{label}</span>
      <span className="num font-semibold text-text-primary">{value}</span>
    </div>
  );
}
