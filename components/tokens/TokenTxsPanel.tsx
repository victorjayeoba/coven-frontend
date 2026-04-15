"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ArrowSquareOut } from "@phosphor-icons/react";
import { endpoints } from "@/lib/api/endpoints";
import { formatAddress, formatRelativeTime, formatUsd } from "@/lib/format";
import { explorerAddressUrl, explorerTxUrl } from "@/lib/explorer";
import { cn } from "@/lib/cn";

type Tx = {
  id?: string;
  tx_hash?: string;
  transaction?: string;
  chain?: string;
  side: "buy" | "sell";
  wallet: string;
  timestamp: number;
  amount_usd?: number | null;
  from_amount?: number | null;
  to_amount?: number | null;
  from_symbol?: string;
  to_symbol?: string;
  price_usd?: number | null;
  source?: "live" | "history";
};

function normalizeRest(raw: any, chain: string | undefined): Tx | null {
  if (!raw || typeof raw !== "object") return null;
  const direction = (raw.direction || raw.side || "").toLowerCase();
  const side: "buy" | "sell" | null =
    direction === "buy" ? "buy" : direction === "sell" ? "sell" : null;
  if (!side) return null;
  const wallet = raw.wallet_address || raw.sender || raw.maker || raw.wallet;
  if (!wallet) return null;
  const ts = Number(raw.tx_time ?? raw.time ?? raw.block_time ?? 0);
  const fromAmt = Number(raw.from_amount ?? 0);
  const fromPrice = Number(raw.from_price_usd ?? 0);
  const amountUsd =
    Number(raw.amount_usd ?? 0) ||
    (fromAmt && fromPrice ? fromAmt * fromPrice : 0);
  return {
    id: raw.id ?? raw.tx_hash ?? raw.transaction,
    tx_hash: raw.transaction || raw.tx_hash || raw.id,
    chain: raw.chain || chain,
    side,
    wallet,
    timestamp: ts || Date.now() / 1000,
    amount_usd: amountUsd || null,
    from_amount: Number(raw.from_amount) || null,
    to_amount: Number(raw.to_amount) || null,
    from_symbol: raw.from_symbol,
    to_symbol: raw.to_symbol,
    price_usd:
      Number(raw.to_price_usd) || Number(raw.from_price_usd) || null,
    source: "history",
  };
}

function normalizeLive(raw: any): Tx | null {
  if (!raw || raw.side !== "buy" && raw.side !== "sell") return null;
  return {
    id: raw.tx_hash,
    tx_hash: raw.tx_hash,
    chain: raw.chain,
    side: raw.side,
    wallet: raw.wallet,
    timestamp: Number(raw.timestamp) || Date.now() / 1000,
    amount_usd:
      raw.amount_usd != null ? Number(raw.amount_usd) : null,
    source: "live",
  };
}

export function TokenTxsPanel({
  tokenId,
  chain,
}: {
  tokenId: string;
  chain?: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["token-txs", tokenId],
    queryFn: () => endpoints.tokenTxs(tokenId, 50),
    enabled: !!tokenId,
    staleTime: 30_000,
  });

  const [liveTxs, setLiveTxs] = useState<Tx[]>([]);
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    seenRef.current = new Set();
    setLiveTxs([]);
  }, [tokenId]);

  useEffect(() => {
    const onSwap = (e: Event) => {
      const raw = (e as CustomEvent).detail;
      if (!raw || raw.token_id !== tokenId) return;
      const tx = normalizeLive(raw);
      if (!tx) return;
      const key = tx.tx_hash || `${tx.wallet}-${tx.timestamp}`;
      if (seenRef.current.has(key)) return;
      seenRef.current.add(key);
      setLiveTxs((prev) => [tx, ...prev].slice(0, 200));
    };
    window.addEventListener("coven:swap", onSwap);
    return () => window.removeEventListener("coven:swap", onSwap);
  }, [tokenId]);

  const history: Tx[] = Array.isArray(data)
    ? data
        .map((r: any) => normalizeRest(r, chain))
        .filter((t): t is Tx => !!t)
    : [];

  const merged = [...liveTxs, ...history].slice(0, 200);

  if (isLoading && merged.length === 0) {
    return (
      <div className="py-8 text-center text-small text-text-muted">
        Loading transactions…
      </div>
    );
  }

  if (merged.length === 0) {
    return (
      <div className="rounded-md border border-border bg-base/50 py-8 text-center text-small text-text-muted">
        No recent transactions.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="grid grid-cols-[60px_1fr_110px_110px_80px_40px] items-center gap-3 border-b border-border bg-elevated/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        <span>Side</span>
        <span>Wallet</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Price</span>
        <span className="text-right">Age</span>
        <span></span>
      </div>
      <div className="max-h-[520px] divide-y divide-border overflow-y-auto">
        {merged.map((tx, i) => (
          <TxRow key={`${tx.id ?? i}-${i}`} tx={tx} />
        ))}
      </div>
    </div>
  );
}

function TxRow({ tx }: { tx: Tx }) {
  const isBuy = tx.side === "buy";
  const addrUrl = explorerAddressUrl(tx.chain, tx.wallet);
  const txUrl = tx.tx_hash ? explorerTxUrl(tx.chain, tx.tx_hash) : null;
  return (
    <div
      className={cn(
        "grid grid-cols-[60px_1fr_110px_110px_80px_40px] items-center gap-3 px-3 py-2 text-small",
        tx.source === "live" && "animate-fade-in bg-primary-faint/30",
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
          isBuy
            ? "bg-gain/10 text-gain"
            : "bg-loss/10 text-loss",
        )}
      >
        {isBuy ? <ArrowUp size={10} weight="bold" /> : <ArrowDown size={10} weight="bold" />}
        {tx.side}
      </span>
      {addrUrl ? (
        <a
          href={addrUrl}
          target="_blank"
          rel="noreferrer"
          className="truncate font-mono text-text-secondary hover:text-primary"
        >
          {formatAddress(tx.wallet)}
        </a>
      ) : (
        <span className="truncate font-mono text-text-secondary">
          {formatAddress(tx.wallet)}
        </span>
      )}
      <span
        className={cn(
          "num text-right",
          isBuy ? "text-gain" : "text-loss",
        )}
      >
        {tx.amount_usd != null ? formatUsd(tx.amount_usd) : "—"}
      </span>
      <span className="num text-right text-text-secondary">
        {tx.price_usd != null ? formatUsd(tx.price_usd, 6) : "—"}
      </span>
      <span className="text-right text-micro text-text-muted">
        {formatRelativeTime(tx.timestamp * 1000)}
      </span>
      {txUrl ? (
        <a
          href={txUrl}
          target="_blank"
          rel="noreferrer"
          className="justify-self-end text-text-muted hover:text-primary"
        >
          <ArrowSquareOut size={12} />
        </a>
      ) : (
        <span />
      )}
    </div>
  );
}
