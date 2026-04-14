"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef } from "react";
import type {
  GraphNode,
  GraphEdge,
  GraphCluster,
} from "@/lib/hooks/useWalletGraph";

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

const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d").then((m) => m.default),
  { ssr: false, loading: () => <GraphLoader /> },
);

function GraphLoader() {
  return (
    <div className="grid h-full w-full place-items-center bg-base text-small text-text-muted">
      Loading graph…
    </div>
  );
}

type ForceNode = GraphNode & {
  id: string;
  cluster_id?: number;
  color: string;
  val: number;
};

type ForceLink = {
  source: string;
  target: string;
  weight: number;
};

export function WalletGraph({
  nodes,
  edges,
  clusters,
  highlightCluster,
  onNodeClick,
  selectedAddress,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: GraphCluster[];
  highlightCluster?: number | null;
  onNodeClick?: (address: string) => void;
  selectedAddress?: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);

  const { forceNodes, forceLinks } = useMemo(() => {
    const walletToCluster = new Map<string, number>();
    clusters.forEach((c) => {
      c.wallet_addresses.forEach((w) => walletToCluster.set(w, c.cluster_id));
    });

    const forceNodes: ForceNode[] = nodes.map((n) => {
      const cid = walletToCluster.get(n.address);
      const color =
        cid !== undefined
          ? CLUSTER_COLORS[cid % CLUSTER_COLORS.length]
          : "#5d6a80";
      const alpha = Math.max(1, Number(n.alpha_score ?? 0));
      const val = Math.max(4, 4 + Math.log10(alpha + 1) * 6);
      return { ...n, id: n.address, cluster_id: cid, color, val };
    });

    const forceLinks: ForceLink[] = edges
      .filter((e) => e.source && e.target)
      .map((e) => ({
        source: e.source,
        target: e.target,
        weight: Math.max(1, Number(e.weight ?? 1)),
      }));

    return { forceNodes, forceLinks };
  }, [nodes, edges, clusters]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (graphRef.current && el) {
        graphRef.current.width(el.clientWidth);
        graphRef.current.height(el.clientHeight);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!graphRef.current) return;
    if (forceNodes.length === 0) return;
    const t = setTimeout(() => {
      try {
        graphRef.current.zoomToFit(500, 80);
      } catch {}
    }, 700);
    return () => clearTimeout(t);
  }, [forceNodes.length, highlightCluster]);

  const drawCabalLabels = (ctx: CanvasRenderingContext2D, scale: number) => {
    if (scale < 0.25) return;
    const byCluster = new Map<number, ForceNode[]>();
    forceNodes.forEach((n) => {
      if (n.cluster_id === undefined) return;
      if (!byCluster.has(n.cluster_id)) byCluster.set(n.cluster_id, []);
      byCluster.get(n.cluster_id)!.push(n);
    });

    for (const [cid, members] of byCluster.entries()) {
      if (members.length < 2) continue;
      let cx = 0,
        cy = 0,
        minY = Infinity;
      for (const m of members as any[]) {
        if (m.x === undefined || m.y === undefined) continue;
        minY = Math.min(minY, m.y);
        cx += m.x;
        cy += m.y;
      }
      cx /= members.length;
      if (!Number.isFinite(cx) || !Number.isFinite(minY)) continue;

      const color = CLUSTER_COLORS[cid % CLUSTER_COLORS.length];
      const dimmed =
        highlightCluster !== null &&
        highlightCluster !== undefined &&
        highlightCluster !== cid;
      const labelY = minY - 14 / scale;
      const label = `CABAL #${cid} · ${members.length}`;

      ctx.font = `600 ${10 / scale}px -apple-system, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const metrics = ctx.measureText(label);
      const padX = 6 / scale;
      const w = metrics.width + padX * 2;
      const h = 14 / scale;

      ctx.globalAlpha = dimmed ? 0.3 : 1;
      ctx.fillStyle = "rgba(18, 22, 32, 0.92)";
      ctx.strokeStyle = color;
      ctx.lineWidth = 1 / scale;
      if ((ctx as any).roundRect) {
        ctx.beginPath();
        (ctx as any).roundRect(cx - w / 2, labelY - h / 2, w, h, 3 / scale);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(cx - w / 2, labelY - h / 2, w, h);
        ctx.strokeRect(cx - w / 2, labelY - h / 2, w, h);
      }
      ctx.fillStyle = color;
      ctx.fillText(label, cx, labelY);
      ctx.globalAlpha = 1;
    }
  };

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <ForceGraph2D
        ref={graphRef}
        graphData={{ nodes: forceNodes, links: forceLinks }}
        backgroundColor="#0b0e14"
        nodeRelSize={4}
        nodeVal={(n: any) => n.val}
        nodeLabel={(n: any) =>
          `<div style="font-family: system-ui; font-size: 11px; padding: 2px 4px;">
            <div><strong>${n.address.slice(0, 6)}…${n.address.slice(-4)}</strong></div>
            <div>${n.chain ?? ""} · Cabal #${n.cluster_id ?? "—"}</div>
            <div>alpha ${(n.alpha_score ?? 0).toFixed(2)}</div>
          </div>`
        }
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(n: any, ctx, globalScale) => {
          const isSelected = selectedAddress === n.address;
          const isHighlighted =
            highlightCluster !== undefined &&
            highlightCluster !== null &&
            n.cluster_id === highlightCluster;

          if (isSelected) {
            ctx.beginPath();
            const r = Math.max(5, Math.sqrt(n.val) * 3);
            ctx.arc(n.x, n.y, r + 3, 0, 2 * Math.PI);
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2 / globalScale;
            ctx.stroke();
          } else if (isHighlighted) {
            ctx.beginPath();
            const r = Math.max(5, Math.sqrt(n.val) * 3);
            ctx.arc(n.x, n.y, r + 2, 0, 2 * Math.PI);
            ctx.strokeStyle = n.color;
            ctx.lineWidth = 1.5 / globalScale;
            ctx.globalAlpha = 0.5;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
          return undefined;
        }}
        onRenderFramePost={(ctx: any, globalScale: number) => {
          drawCabalLabels(ctx, globalScale);
        }}
        nodeColor={(n: any) => {
          const isDimmed =
            (highlightCluster !== undefined &&
              highlightCluster !== null &&
              n.cluster_id !== highlightCluster) ||
            (selectedAddress && selectedAddress !== n.address);
          return isDimmed ? "rgba(60, 70, 90, 0.25)" : n.color;
        }}
        linkColor={(l: any) => {
          const src = typeof l.source === "object" ? l.source : null;
          const tgt = typeof l.target === "object" ? l.target : null;
          const srcCid = src?.cluster_id;
          const tgtCid = tgt?.cluster_id;
          const sameCluster =
            srcCid !== undefined && tgtCid !== undefined && srcCid === tgtCid;
          if (highlightCluster !== undefined && highlightCluster !== null) {
            return sameCluster && srcCid === highlightCluster
              ? "rgba(60,196,123,0.5)"
              : "rgba(40,50,70,0.12)";
          }
          if (selectedAddress) {
            const touchesSelected =
              src?.address === selectedAddress ||
              tgt?.address === selectedAddress;
            return touchesSelected
              ? "rgba(255,255,255,0.5)"
              : "rgba(40,50,70,0.12)";
          }
          return sameCluster
            ? "rgba(60,196,123,0.3)"
            : "rgba(100,115,140,0.12)";
        }}
        linkWidth={(l: any) =>
          Math.min(2, 0.5 + Math.log10((l.weight ?? 1) + 1))
        }
        linkDirectionalParticles={0}
        enableNodeDrag={true}
        cooldownTicks={200}
        warmupTicks={50}
        onNodeClick={(n: any) => onNodeClick?.(n.address)}
      />
    </div>
  );
}
