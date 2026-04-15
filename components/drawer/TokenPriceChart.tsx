"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
  type SeriesMarker,
} from "lightweight-charts";

type Candle = {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
};

type Volume = {
  time: UTCTimestamp;
  value: number;
  color?: string;
};

type Marker = SeriesMarker<UTCTimestamp>;

function parseCandles(raw: any): { candles: Candle[]; volume: Volume[] } {
  const points =
    (raw && (raw.points || raw.list || raw.data || raw.klines)) || [];
  const list = Array.isArray(points) ? points : [];
  const candles: Candle[] = [];
  const volume: Volume[] = [];
  for (const p of list) {
    if (!p) continue;
    const t = Number(p.time ?? p.t ?? p.timestamp ?? 0);
    const open = Number(p.open ?? p.o);
    const high = Number(p.high ?? p.h);
    const low = Number(p.low ?? p.l);
    const close = Number(p.close ?? p.c);
    const vol = Number(p.volume ?? p.v ?? 0);
    if (!t || Number.isNaN(open) || Number.isNaN(close)) continue;
    candles.push({ time: t as UTCTimestamp, open, high, low, close });
    volume.push({
      time: t as UTCTimestamp,
      value: vol,
      color: close >= open ? "rgba(60,196,123,0.4)" : "rgba(239,74,95,0.4)",
    });
  }
  candles.sort((a, b) => (a.time as number) - (b.time as number));
  volume.sort((a, b) => (a.time as number) - (b.time as number));
  return { candles, volume };
}

export function TokenPriceChart({
  candlesRaw,
  markers = [],
  height = 320,
  tokenId,
  intervalMinutes = 60,
}: {
  candlesRaw: any;
  markers?: {
    time: number;
    side: "buy" | "sell";
    text?: string;
  }[];
  height?: number;
  tokenId?: string;
  intervalMinutes?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const lastBarRef = useRef<Candle | null>(null);

  const { candles, volume } = useMemo(
    () => parseCandles(candlesRaw),
    [candlesRaw],
  );

  // Mount chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#9ba8bd",
        fontSize: 11,
        fontFamily: "var(--font-space), system-ui, sans-serif",
        attributionLogo: false,
      } as any,
      grid: {
        vertLines: { color: "rgba(30,38,54,0.6)" },
        horzLines: { color: "rgba(30,38,54,0.6)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "#3cc47b", width: 1, labelBackgroundColor: "#1a1f2e" },
        horzLine: { color: "#3cc47b", width: 1, labelBackgroundColor: "#1a1f2e" },
      },
      rightPriceScale: {
        borderColor: "#1e2636",
        textColor: "#9ba8bd",
      },
      timeScale: {
        borderColor: "#1e2636",
        timeVisible: true,
        secondsVisible: false,
      },
      width: containerRef.current.clientWidth,
      height,
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#3cc47b",
      downColor: "#ef4a5f",
      borderUpColor: "#3cc47b",
      borderDownColor: "#ef4a5f",
      wickUpColor: "#3cc47b",
      wickDownColor: "#ef4a5f",
      priceFormat: { type: "price", precision: 6, minMove: 0.000001 },
    });
    candleSeriesRef.current = candleSeries;

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    volumeSeriesRef.current = volumeSeries;

    chartRef.current = chart;

    const handleResize = () => {
      if (!containerRef.current || !chartRef.current) return;
      chartRef.current.applyOptions({
        width: containerRef.current.clientWidth,
      });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [height]);

  // Push data when candles change
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return;
    candleSeriesRef.current.setData(candles);
    volumeSeriesRef.current.setData(volume);
    lastBarRef.current = candles.length ? candles[candles.length - 1] : null;
    if (chartRef.current && candles.length) {
      chartRef.current.timeScale().fitContent();
    }
  }, [candles, volume]);

  // Live streaming: update the current candle from price.update SSE events
  useEffect(() => {
    if (!tokenId) return;
    const bucketSec = Math.max(1, intervalMinutes) * 60;

    const onPrice = (e: Event) => {
      const p = (e as CustomEvent).detail;
      if (!p || p.token_id !== tokenId) return;
      const price = Number(p.price_usd);
      if (!Number.isFinite(price) || price <= 0) return;
      if (!candleSeriesRef.current) return;

      const nowSec = Math.floor(Date.now() / 1000);
      const bucketTime = Math.floor(nowSec / bucketSec) * bucketSec;
      const last = lastBarRef.current;

      let bar: Candle;
      if (last && (last.time as number) === bucketTime) {
        bar = {
          time: last.time,
          open: last.open,
          high: Math.max(last.high, price),
          low: Math.min(last.low, price),
          close: price,
        };
      } else {
        const openPrice = last ? last.close : price;
        bar = {
          time: bucketTime as UTCTimestamp,
          open: openPrice,
          high: Math.max(openPrice, price),
          low: Math.min(openPrice, price),
          close: price,
        };
      }
      candleSeriesRef.current.update(bar);
      lastBarRef.current = bar;
    };

    window.addEventListener("coven:price", onPrice);
    return () => window.removeEventListener("coven:price", onPrice);
  }, [tokenId, intervalMinutes]);

  // Markers for cluster entries / exits
  useEffect(() => {
    if (!candleSeriesRef.current) return;
    const formatted: Marker[] = markers
      .map((m) => ({
        time: Math.floor(m.time) as UTCTimestamp,
        position:
          m.side === "buy" ? ("belowBar" as const) : ("aboveBar" as const),
        color: m.side === "buy" ? "#3cc47b" : "#ef4a5f",
        shape: (m.side === "buy" ? "arrowUp" : "arrowDown") as
          | "arrowUp"
          | "arrowDown",
        text: m.text,
      }))
      .sort((a, b) => (a.time as number) - (b.time as number));
    candleSeriesRef.current.setMarkers(formatted);
  }, [markers]);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden rounded-md"
      style={{ height }}
    />
  );
}
