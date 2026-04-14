"use client";

import { UsersThree, Graph, LinkSimple } from "@phosphor-icons/react";
import type { GraphCluster, GraphEdge, GraphNode } from "@/lib/hooks/useWalletGraph";

export function GraphStats({
  nodes,
  edges,
  clusters,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: GraphCluster[];
}) {
  return (
    <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border">
      <Cell
        label="Cabals"
        value={clusters.length.toString()}
        icon={<UsersThree size={12} weight="fill" className="text-primary" />}
      />
      <Cell
        label="Wallets"
        value={nodes.length.toString()}
        icon={<Graph size={12} weight="fill" className="text-primary" />}
      />
      <Cell
        label="Edges"
        value={edges.length.toString()}
        icon={<LinkSimple size={12} weight="bold" className="text-primary" />}
      />
    </div>
  );
}

function Cell({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-surface px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="label-micro">{label}</span>
      </div>
      <div className="num mt-1 text-h2 font-semibold text-text-primary">
        {value}
      </div>
    </div>
  );
}
