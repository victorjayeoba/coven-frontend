"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Opens an EventSource to the backend and pipes signal events directly into
 * the TanStack Query cache. New signals appear in the UI without any
 * extra API roundtrip — the SSE payload IS the data.
 *
 * Falls back to invalidation for queries we can't surgically update
 * (pnl-summary, trades — these need server aggregation).
 */
export function useSignalStream({
  enabled = true,
  baseUrl,
}: { enabled?: boolean; baseUrl?: string } = {}) {
  const qc = useQueryClient();
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const url = baseUrl ?? "/api/stream/signals";

    console.log("[SSE] connecting to", url);
    const es = new EventSource(url, { withCredentials: true });
    esRef.current = es;

    es.onopen = () => {
      console.log("[SSE] connected");
    };
    es.addEventListener("connected", (e) => {
      console.log("[SSE] handshake:", (e as MessageEvent).data);
    });

    /** Match signals by id OR composite key (token+cluster+detected_at). */
    const sameSignal = (a: any, b: any) => {
      const aId = a?.id ?? a?._id;
      const bId = b?.id ?? b?._id;
      if (aId && bId && aId === bId) return true;
      // Composite fallback for records inserted before id was attached
      if (
        a?.token_id &&
        a.token_id === b?.token_id &&
        (a.cluster_id ?? null) === (b.cluster_id ?? null) &&
        (a.detected_at ?? null) === (b.detected_at ?? null)
      )
        return true;
      return false;
    };

    /** Add or update a signal in every cached signals list */
    const upsertIntoSignalCaches = (signal: any) => {
      if (!signal || !signal.token_id) return;

      // Patch the global signals feeds (dashboard + /signals page)
      const queries = qc.getQueriesData<any>({
        queryKey: ["signals"],
        exact: false,
      });

      let touched = 0;
      for (const [key, oldData] of queries) {
        if (!Array.isArray(oldData)) continue;
        const existingIdx = oldData.findIndex((r: any) =>
          sameSignal(r, signal),
        );
        let next: any[];
        if (existingIdx >= 0) {
          next = [...oldData];
          next[existingIdx] = { ...oldData[existingIdx], ...signal };
        } else {
          next = [signal, ...oldData];
        }
        qc.setQueryData(key, next);
        touched += 1;
      }

      if (touched === 0) {
        qc.invalidateQueries({ queryKey: ["signals"], exact: false });
      }

      // Also patch the token-specific signals query on the token detail page
      const tokenSignalQueries = qc.getQueriesData<any>({
        queryKey: ["token-signals", signal.token_id],
        exact: false,
      });
      for (const [key, oldData] of tokenSignalQueries) {
        if (!Array.isArray(oldData)) continue;
        const existingIdx = oldData.findIndex((r: any) =>
          sameSignal(r, signal),
        );
        let next: any[];
        if (existingIdx >= 0) {
          next = [...oldData];
          next[existingIdx] = { ...oldData[existingIdx], ...signal };
        } else {
          // Mark live signals with source="live" to match the token page UI
          next = [{ ...signal, source: signal.source ?? "live" }, ...oldData];
        }
        qc.setQueryData(key, next);
      }
    };

    es.addEventListener("signal.fired", (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data);
        console.log("[SSE] signal.fired", data);
        upsertIntoSignalCaches(data);
      } catch (err) {
        console.error("[SSE] parse error fired:", err);
      }
    });

    es.addEventListener("signal.scored", (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data);
        console.log("[SSE] signal.scored", data);
        upsertIntoSignalCaches(data);

        qc.invalidateQueries({ queryKey: ["pnl-summary"] });
        qc.invalidateQueries({ queryKey: ["trades"], exact: false });
      } catch (err) {
        console.error("[SSE] parse error scored:", err);
      }
    });

    /** Patch all token-markets caches with a live price update. */
    const applyPriceUpdate = (p: any) => {
      const tid = p?.token_id;
      if (!tid) return;

      // token-markets queries hold a dict { [token_id]: TokenMarket }
      const mkQueries = qc.getQueriesData<any>({
        queryKey: ["token-markets"],
        exact: false,
      });
      for (const [key, oldData] of mkQueries) {
        if (!oldData || typeof oldData !== "object") continue;
        if (!(tid in oldData)) continue;
        const prev = oldData[tid] ?? {};
        const merged = {
          ...prev,
          ...(p.price_usd != null ? { price_usd: p.price_usd } : {}),
          ...(p.price_change_24h != null
            ? { price_change_24h: p.price_change_24h }
            : {}),
          ...(p.price_change_1h != null
            ? { price_change_1h: p.price_change_1h }
            : {}),
          ...(p.tvl != null ? { tvl: p.tvl } : {}),
          ...(p.volume_24h != null ? { volume_24h: p.volume_24h } : {}),
          ...(p.makers_24h != null ? { makers_24h: p.makers_24h } : {}),
        };
        qc.setQueryData(key, { ...oldData, [tid]: merged });
      }

      // bot-trades + trades caches — each holds an array of trade rows.
      // Patch any row that's open on this token so portfolio + bot detail
      // reflect live P&L without any refetch.
      if (p.price_usd != null) {
        const patchTradeArray = (
          oldData: any,
        ): { next: any; touched: boolean } => {
          if (!Array.isArray(oldData)) return { next: oldData, touched: false };
          let touched = false;
          const next = oldData.map((row: any) => {
            if (row?.token_id !== tid || row?.status !== "open") return row;
            touched = true;
            const entry = row.entry || {};
            const entryPrice = Number(entry.price_usd || 0);
            const amount = Number(entry.amount_tokens || 0);
            const unrealized =
              entryPrice > 0 ? (p.price_usd - entryPrice) * amount : 0;
            const unrealizedPct =
              entryPrice > 0 ? (p.price_usd / entryPrice - 1) * 100 : 0;
            return {
              ...row,
              current_price_usd: p.price_usd,
              unrealized_pnl_usd: Number(unrealized.toFixed(2)),
              unrealized_pnl_pct: Number(unrealizedPct.toFixed(2)),
            };
          });
          return { next, touched };
        };

        for (const queryKey of [["bot-trades"], ["trades"]]) {
          const rows = qc.getQueriesData<any>({ queryKey, exact: false });
          for (const [key, oldData] of rows) {
            const { next, touched } = patchTradeArray(oldData);
            if (touched) qc.setQueryData(key, next);
          }
        }

        // P&L summary: derive a partial patch so the cards move in real time
        // (total unrealized + total equity). The numbers converge with the
        // backend on the next periodic refetch.
        const pnlEntries = qc.getQueriesData<any>({
          queryKey: ["pnl-summary"],
          exact: false,
        });
        for (const [key, oldPnl] of pnlEntries) {
          if (!oldPnl || typeof oldPnl !== "object") continue;
          // Walk the just-patched open bot + sys trades to recompute totals.
          let unrealized = 0;
          let openCount = 0;
          for (const qk of [["bot-trades"], ["trades"]]) {
            const arrs = qc.getQueriesData<any>({ queryKey: qk, exact: false });
            for (const [, data] of arrs) {
              if (!Array.isArray(data)) continue;
              for (const row of data) {
                if (row?.status !== "open") continue;
                openCount += 1;
                const u = Number(row?.unrealized_pnl_usd ?? 0);
                if (Number.isFinite(u)) unrealized += u;
              }
            }
          }
          qc.setQueryData(key, {
            ...oldPnl,
            unrealized_pnl_usd: Number(unrealized.toFixed(2)),
            open_positions: openCount,
          });
        }
      }

      // token-detail queries hold a single token dict (or {token: {...}} wrapper)
      const tdQueries = qc.getQueriesData<any>({
        queryKey: ["token-detail", tid],
        exact: false,
      });
      for (const [key, oldData] of tdQueries) {
        if (!oldData) continue;
        const tok =
          oldData.token && typeof oldData.token === "object"
            ? oldData.token
            : oldData;
        const patch: Record<string, any> = {};
        if (p.price_usd != null) patch.current_price_usd = p.price_usd;
        if (p.price_change_24h != null)
          patch.token_price_change_24h = p.price_change_24h;
        if (p.price_change_1h != null)
          patch.token_price_change_1h = p.price_change_1h;
        if (p.tvl != null) patch.main_pair_tvl = p.tvl;
        if (p.volume_24h != null) patch.token_tx_volume_usd_24h = p.volume_24h;
        if (p.makers_24h != null) patch.token_makers_24h = p.makers_24h;
        const newTok = { ...tok, ...patch };
        const next =
          oldData.token && typeof oldData.token === "object"
            ? { ...oldData, token: newTok }
            : newTok;
        qc.setQueryData(key, next);
      }
    };

    const invalidateBots = () => {
      qc.invalidateQueries({ queryKey: ["bots"], exact: false });
      qc.invalidateQueries({ queryKey: ["bot-trades"], exact: false });
      // Bot trades now show up in the portfolio feed too
      qc.invalidateQueries({ queryKey: ["trades"], exact: false });
      qc.invalidateQueries({ queryKey: ["pnl-summary"] });
    };

    es.addEventListener("bot.trade.opened", (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data);
        console.log("[SSE] bot.trade.opened", data);
        invalidateBots();
      } catch (err) {
        console.error("[SSE] parse error bot open:", err);
      }
    });

    es.addEventListener("bot.trade.closed", (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data);
        console.log("[SSE] bot.trade.closed", data);
        invalidateBots();
      } catch (err) {
        console.error("[SSE] parse error bot close:", err);
      }
    });

    es.addEventListener("bot.updated", () => {
      invalidateBots();
    });

    es.addEventListener("swap", (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data);
        if (typeof window !== "undefined" && data?.token_id) {
          window.dispatchEvent(
            new CustomEvent("coven:swap", { detail: data }),
          );
        }
      } catch (err) {
        console.error("[SSE] parse error swap:", err);
      }
    });

    es.addEventListener("price.update", (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data);
        applyPriceUpdate(data);
        if (typeof window !== "undefined" && data?.token_id) {
          window.dispatchEvent(
            new CustomEvent("coven:price", { detail: data }),
          );
        }
      } catch (err) {
        console.error("[SSE] parse error price:", err);
      }
    });

    es.onerror = (err) => {
      console.warn("[SSE] error / reconnecting", err);
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [enabled, baseUrl, qc]);
}
