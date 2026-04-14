"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatUsd } from "@/lib/format";
import { useUIStore } from "@/lib/stores/useUIStore";

type Trade = {
  id: string;
  closed_at?: string;
  pnl_usd?: number;
};

type Range = "7D" | "30D" | "90D" | "ALL";

export function EquityCurve({
  history,
  range,
}: {
  history: Trade[];
  range: Range;
}) {
  const paperBalance = useUIStore((s) => s.paperBalance);

  const data = useMemo(() => {
    const sorted = [...history]
      .filter((t) => t.closed_at)
      .sort(
        (a, b) =>
          new Date(a.closed_at!).getTime() - new Date(b.closed_at!).getTime(),
      );

    const now = Date.now();
    const cutoff =
      range === "ALL"
        ? 0
        : now -
          { "7D": 7, "30D": 30, "90D": 90 }[range] * 24 * 60 * 60 * 1000;

    let running = paperBalance;
    const points: { t: number; equity: number; pnl: number }[] = [];
    for (const tr of sorted) {
      running += tr.pnl_usd ?? 0;
      const ts = new Date(tr.closed_at!).getTime();
      if (ts >= cutoff) {
        points.push({ t: ts, equity: running, pnl: tr.pnl_usd ?? 0 });
      }
    }
    if (points.length === 0) {
      return [
        { t: now - 86_400_000, equity: paperBalance, pnl: 0 },
        { t: now, equity: paperBalance, pnl: 0 },
      ];
    }
    return points;
  }, [history, range, paperBalance]);

  const start = data[0]?.equity ?? 0;
  const end = data[data.length - 1]?.equity ?? 0;
  const positive = end >= start;
  const stroke = positive ? "#3cc47b" : "#ef4a5f";

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.25} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="t"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v) =>
              new Date(v).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })
            }
            stroke="#5d6a80"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#1e2636" }}
          />
          <YAxis
            stroke="#5d6a80"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatUsd(v, 0)}
            width={56}
          />
          <Tooltip
            cursor={{ stroke: "#2c3648", strokeWidth: 1 }}
            contentStyle={{
              background: "#121620",
              border: "1px solid #1e2636",
              borderRadius: 6,
              fontSize: 12,
            }}
            labelFormatter={(v) => new Date(v).toLocaleString()}
            formatter={(val: number) => [formatUsd(val, 2), "Equity"]}
          />
          <Area
            type="monotone"
            dataKey="equity"
            stroke={stroke}
            strokeWidth={2}
            fill="url(#eqFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
