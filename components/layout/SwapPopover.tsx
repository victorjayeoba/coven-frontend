"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowsDownUp,
  ArrowDown,
  CurrencyDollar,
  MagnifyingGlass,
  PaperPlaneTilt,
  Plus,
  QrCode,
  Warning,
  X,
} from "@phosphor-icons/react";
import { endpoints } from "@/lib/api/endpoints";
import { formatUsd } from "@/lib/format";
import { useBalances } from "@/lib/hooks/useBalances";
import { useActiveTrades, usePnlSummary } from "@/lib/hooks/useTrades";

type ChainId = "solana" | "bsc";
type View = "home" | "swap";
type Direction = "buy" | "sell"; // buy = SOL→token, sell = token→SOL

type TokenRow = {
  token_id: string;
  symbol: string | null;
  chain: ChainId;
  price_usd?: number | null;
  logo_url?: string | null;
};

type OpenPosition = {
  id: string;
  token_id: string;
  symbol: string | null;
  chain: ChainId;
  size_usd: number;
  current_value_usd: number;
  pnl_usd: number;
  pnl_pct: number;
};

const NATIVE: Record<ChainId, { symbol: string; name: string; color: string; logo: string }> = {
  solana: {
    symbol: "SOL",
    name: "Solana",
    color: "#14f195",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png",
  },
  bsc: {
    symbol: "BNB",
    name: "BNB Chain",
    color: "#f0b90b",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
  },
};

function TokenLogo({
  src,
  alt,
  size = 32,
  fallbackBg,
  fallbackText,
}: {
  src?: string | null;
  alt: string;
  size?: number;
  fallbackBg?: string;
  fallbackText?: string;
}) {
  const [err, setErr] = useState(false);
  const px = `${size}px`;
  if (src && !err) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setErr(true)}
        style={{ width: px, height: px }}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }
  const text = fallbackText ?? alt.slice(0, 2).toUpperCase();
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-bold"
      style={{
        width: px,
        height: px,
        background: fallbackBg ?? "var(--elevated, #1b1b21)",
        color: fallbackBg ? "#000" : "var(--text-primary, #eee)",
        fontSize: Math.max(10, size * 0.4),
      }}
    >
      {text}
    </span>
  );
}

const PERCENTAGES = [10, 25, 50, 100] as const;

export function SwapPopover({
  open,
  onClose,
  onOpenFund,
}: {
  open: boolean;
  onClose: () => void;
  onOpenFund?: () => void;
}) {
  const qc = useQueryClient();
  const { data: balancesData } = useBalances();
  const balances = balancesData?.balances ?? { solana: 0, bsc: 0 };
  const { data: pnl } = usePnlSummary();
  const { data: active } = useActiveTrades();

  const [chain, setChain] = useState<ChainId>("solana");
  const [view, setView] = useState<View>("home");
  const [direction, setDirection] = useState<Direction>("buy");

  // swap-specific state
  const [amountUsd, setAmountUsd] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<TokenRow | null>(null);      // used in "buy"
  const [selectedPosition, setSelectedPosition] = useState<OpenPosition | null>(null); // used in "sell"
  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const balance = Number(balances[chain] ?? 0);

  // derive open positions for the active chain
  const positions = useMemo<OpenPosition[]>(() => {
    const arr = Array.isArray(active) ? active : [];
    return arr
      .filter((t: any) => t?.chain === chain && t?.status === "open")
      .map((t: any): OpenPosition => {
        const entry = t.entry ?? {};
        const size = Number(entry.size_usd ?? 0);
        const amt = Number(entry.amount_tokens ?? 0);
        const px = Number(t.current_price_usd ?? entry.price_usd ?? 0);
        const cur = amt * px;
        const pnlUsd = Number(t.unrealized_pnl_usd ?? cur - size);
        const pnlPct = size > 0 ? (pnlUsd / size) * 100 : 0;
        return {
          id: String(t.id ?? t._id),
          token_id: t.token_id,
          symbol: t.symbol ?? null,
          chain: t.chain,
          size_usd: size,
          current_value_usd: cur || size,
          pnl_usd: pnlUsd,
          pnl_pct: pnlPct,
        };
      });
  }, [active, chain]);

  const positionsValue = positions.reduce((s, p) => s + (p.current_value_usd || 0), 0);
  const positionsPnl = positions.reduce((s, p) => s + (p.pnl_usd || 0), 0);

  // "account total" for the selected chain: cash + open positions on that chain
  const chainTotal = balance + positionsValue;
  const chainPnlPct = chainTotal > 0 ? (positionsPnl / chainTotal) * 100 : 0;

  useEffect(() => {
    if (!open) {
      setView("home");
      setDirection("buy");
      setAmountUsd("");
      setSelectedToken(null);
      setSelectedPosition(null);
      setQuery("");
      setToast(null);
    }
  }, [open]);

  useEffect(() => {
    // when chain changes, clear selections
    setSelectedToken(null);
    setSelectedPosition(null);
    setAmountUsd("");
  }, [chain]);

  useEffect(() => {
    const h = setTimeout(() => setDebouncedQ(query.trim()), 180);
    return () => clearTimeout(h);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open, onClose]);

  const { data: searchData, isFetching } = useQuery({
    queryKey: ["swap-token-search", debouncedQ, chain],
    queryFn: () => endpoints.searchTokens(debouncedQ, chain),
    enabled: open && view === "swap" && direction === "buy" && debouncedQ.length >= 2,
    staleTime: 30_000,
  });

  const results = useMemo<TokenRow[]>(() => {
    const arr = Array.isArray(searchData) ? searchData : [];
    return arr
      .map((t: any): TokenRow | null => {
        const c: ChainId | undefined = (t.chain ?? t.chain_name) as ChainId | undefined;
        const contract = t.token ?? t.token_address ?? t.contract ?? t.address;
        const tid = t.token_id ?? (contract && c ? `${contract}-${c}` : null);
        if (!tid) return null;
        // Trust the backend's chain filter; only drop explicit mismatches.
        if (c && c !== chain) return null;
        return {
          token_id: tid,
          symbol: t.symbol ?? null,
          chain: (c ?? chain) as ChainId,
          price_usd:
            t.current_price_usd != null ? Number(t.current_price_usd) : null,
          logo_url: t.logo_url ?? t.logo ?? null,
        };
      })
      .filter(Boolean)
      .slice(0, 10) as TokenRow[];
  }, [searchData, chain]);

  const amountNum = Number(amountUsd);

  const buyMut = useMutation({
    mutationFn: () =>
      endpoints.openTrade({
        token_id: selectedToken!.token_id,
        size_usd: amountNum,
        symbol: selectedToken?.symbol ?? undefined,
      }),
    onSuccess: () => {
      setToast({
        kind: "ok",
        msg: `Bought ${selectedToken?.symbol ?? "token"} · ${formatUsd(amountNum, 2)}`,
      });
      setAmountUsd("");
      setSelectedToken(null);
      setQuery("");
      invalidateAll();
    },
    onError: (e: any) => setToast({ kind: "err", msg: errMsg(e) }),
  });

  const sellMut = useMutation({
    mutationFn: () => endpoints.closeTrade(selectedPosition!.id),
    onSuccess: () => {
      setToast({
        kind: "ok",
        msg: `Sold ${selectedPosition?.symbol ?? "token"} → ${NATIVE[chain].symbol}`,
      });
      setSelectedPosition(null);
      setAmountUsd("");
      invalidateAll();
    },
    onError: (e: any) => setToast({ kind: "err", msg: errMsg(e) }),
  });

  function invalidateAll() {
    qc.invalidateQueries({ queryKey: ["balances"] });
    qc.invalidateQueries({ queryKey: ["trades"] });
    qc.invalidateQueries({ queryKey: ["pnl-summary"] });
  }

  const buyValid =
    direction === "buy" &&
    !!selectedToken &&
    Number.isFinite(amountNum) &&
    amountNum > 0 &&
    amountNum <= balance;

  const buyInsufficient =
    direction === "buy" &&
    Number.isFinite(amountNum) &&
    amountNum > 0 &&
    amountNum > balance;

  const receiveEst = useMemo(() => {
    if (direction !== "buy") return 0;
    if (!selectedToken?.price_usd || !amountNum || amountNum <= 0) return 0;
    return amountNum / selectedToken.price_usd;
  }, [direction, selectedToken, amountNum]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-3 top-12 z-50 w-[400px] overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
    >
      {/* header: chain tabs + close */}
      <div className="flex items-center justify-between border-b border-border bg-elevated/40 px-4 py-2.5">
        <div className="inline-flex items-center gap-1">
          <ChainTab id="solana" active={chain === "solana"} onClick={() => setChain("solana")} />
          <ChainTab id="bsc" active={chain === "bsc"} onClick={() => setChain("bsc")} />
        </div>
        <div className="inline-flex items-center gap-1">
          <ViewTab label="Home" active={view === "home"} onClick={() => setView("home")} />
          <ViewTab label="Swap" active={view === "swap"} onClick={() => setView("swap")} />
          <button
            type="button"
            onClick={onClose}
            className="ml-1 rounded p-1 text-text-muted hover:bg-elevated hover:text-text-primary"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* ======================= HOME VIEW ======================= */}
      {view === "home" && (
        <div>
          {/* Portfolio hero */}
          <div className="flex flex-col items-center pb-3 pt-5">
            <div className="text-[11px] uppercase tracking-wider text-text-muted">
              {NATIVE[chain].name} · Paper wallet
            </div>
            <div className="num mt-1.5 text-[34px] font-semibold leading-none text-text-primary">
              {formatUsd(chainTotal, 2)}
            </div>
            <div
              className={`mt-1.5 inline-flex items-center gap-1.5 text-small ${
                positionsPnl >= 0 ? "text-primary" : "text-danger"
              }`}
            >
              <span className="num">
                {positionsPnl >= 0 ? "+" : ""}
                {formatUsd(positionsPnl, 2)}
              </span>
              <span
                className={`num rounded-md px-1.5 py-0.5 text-[10px] ${
                  positionsPnl >= 0
                    ? "bg-primary-faint text-primary"
                    : "bg-danger/15 text-danger"
                }`}
              >
                {chainPnlPct >= 0 ? "+" : ""}
                {chainPnlPct.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Action pills */}
          <div className="grid grid-cols-4 gap-2 px-4 pb-4">
            <ActionPill icon={<PaperPlaneTilt size={16} weight="fill" />} label="Send" disabled />
            <ActionPill
              icon={<ArrowsDownUp size={16} weight="bold" />}
              label="Swap"
              onClick={() => {
                setDirection("buy");
                setView("swap");
              }}
            />
            <ActionPill icon={<QrCode size={16} weight="fill" />} label="Receive" disabled />
            <ActionPill
              icon={<Plus size={16} weight="bold" />}
              label="Fund"
              onClick={() => {
                onOpenFund?.();
                onClose();
              }}
            />
          </div>

          {/* Tokens / positions */}
          <div className="border-t border-border">
            <div className="flex items-center justify-between px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              <span>Tokens</span>
              <span className="normal-case tracking-normal">
                {positions.length} open · {NATIVE[chain].name}
              </span>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {/* Native row */}
              <div className="flex items-center justify-between px-4 py-2 hover:bg-elevated/40">
                <div className="inline-flex items-center gap-2.5">
                  <TokenLogo
                    src={NATIVE[chain].logo}
                    alt={NATIVE[chain].symbol}
                    size={32}
                    fallbackBg={NATIVE[chain].color}
                    fallbackText={NATIVE[chain].symbol[0]}
                  />
                  <div>
                    <div className="text-small font-semibold text-text-primary">
                      {NATIVE[chain].name}
                    </div>
                    <div className="text-[11px] text-text-muted">
                      Paper · cash balance
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="num text-small font-semibold text-text-primary">
                    {formatUsd(balance, 2)}
                  </div>
                  <div className="num text-[11px] text-text-muted">
                    {NATIVE[chain].symbol}
                  </div>
                </div>
              </div>

              {/* Position rows */}
              {positions.length === 0 ? (
                <div className="px-4 py-3 text-center text-[11px] text-text-muted">
                  No open positions on {NATIVE[chain].name}. Swap into one to get started.
                </div>
              ) : (
                positions.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setDirection("sell");
                      setSelectedPosition(p);
                      setView("swap");
                    }}
                    className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-elevated/40"
                  >
                    <div className="inline-flex items-center gap-2.5">
                      <TokenLogo
                        alt={p.symbol ?? "?"}
                        size={32}
                        fallbackText={(p.symbol ?? "?").slice(0, 2).toUpperCase()}
                      />
                      <div className="min-w-0">
                        <div className="truncate text-small font-semibold text-text-primary">
                          {p.symbol ?? p.token_id.slice(0, 10)}
                        </div>
                        <div className="num truncate text-[11px] text-text-muted">
                          Size {formatUsd(p.size_usd, 2)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="num text-small font-semibold text-text-primary">
                        {formatUsd(p.current_value_usd, 2)}
                      </div>
                      <div
                        className={`num text-[11px] ${
                          p.pnl_usd >= 0 ? "text-primary" : "text-danger"
                        }`}
                      >
                        {p.pnl_usd >= 0 ? "+" : ""}
                        {p.pnl_pct.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {toast && <Toast toast={toast} onClear={() => setToast(null)} />}
        </div>
      )}

      {/* ======================= SWAP VIEW ======================= */}
      {view === "swap" && (
        <div className="space-y-2 p-3">
          {/* From panel */}
          {direction === "buy" ? (
            <PayPanel
              label="You Pay"
              balanceLabel={`Balance: ${formatUsd(balance, 2)}`}
              balance={balance}
              amountUsd={amountUsd}
              setAmountUsd={setAmountUsd}
              token={{
                symbol: NATIVE[chain].symbol,
                color: NATIVE[chain].color,
                logo: NATIVE[chain].logo,
              }}
            />
          ) : (
            <SellFromPanel
              positions={positions}
              selected={selectedPosition}
              onSelect={setSelectedPosition}
              chain={chain}
            />
          )}

          {/* Flip */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                setDirection((d) => (d === "buy" ? "sell" : "buy"));
                setSelectedToken(null);
                setSelectedPosition(null);
                setAmountUsd("");
                setQuery("");
              }}
              className="grid h-8 w-8 place-items-center rounded-full border border-border bg-elevated text-text-secondary transition-colors hover:border-primary hover:text-primary"
              title="Flip direction"
            >
              <ArrowDown size={14} weight="bold" />
            </button>
          </div>

          {/* To panel */}
          {direction === "buy" ? (
            <ReceiveBuyPanel
              chain={chain}
              selected={selectedToken}
              onSelect={setSelectedToken}
              onClear={() => setSelectedToken(null)}
              query={query}
              setQuery={setQuery}
              debouncedQ={debouncedQ}
              results={results}
              isFetching={isFetching}
              receiveEst={receiveEst}
            />
          ) : (
            <ReceiveSellPanel
              chain={chain}
              position={selectedPosition}
            />
          )}

          {buyInsufficient && (
            <div className="inline-flex w-full items-center gap-1.5 rounded-md border border-danger/40 bg-danger/10 px-2 py-1.5 text-[11px] text-danger">
              <Warning size={12} />
              Not enough {NATIVE[chain].symbol} balance.
            </div>
          )}
          {toast && <Toast toast={toast} onClear={() => setToast(null)} inline />}

          <button
            type="button"
            disabled={
              direction === "buy"
                ? !buyValid || buyMut.isPending
                : !selectedPosition || sellMut.isPending
            }
            onClick={() => (direction === "buy" ? buyMut.mutate() : sellMut.mutate())}
            className="h-10 w-full rounded-lg bg-primary text-small font-semibold text-base transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-elevated disabled:text-text-muted"
          >
            {direction === "buy"
              ? buyMut.isPending
                ? "Swapping…"
                : !selectedToken
                  ? "Select a token"
                  : !amountNum || amountNum <= 0
                    ? "Enter an amount"
                    : buyInsufficient
                      ? "Insufficient balance"
                      : `Swap ${NATIVE[chain].symbol} → ${selectedToken.symbol ?? "token"}`
              : sellMut.isPending
                ? "Selling…"
                : !selectedPosition
                  ? "Select a position to sell"
                  : `Swap ${selectedPosition.symbol ?? "token"} → ${NATIVE[chain].symbol}`}
          </button>
          <div className="text-center text-[10px] text-text-muted">
            Paper trade · {NATIVE[chain].name} wallet
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------

function ChainTab({ id, active, onClick }: { id: ChainId; active: boolean; onClick: () => void }) {
  const meta = NATIVE[id];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium transition-colors ${
        active ? "bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-secondary"
      }`}
    >
      <TokenLogo
        src={meta.logo}
        alt={meta.symbol}
        size={14}
        fallbackBg={meta.color}
        fallbackText={meta.symbol[0]}
      />
      {meta.symbol}
    </button>
  );
}

function ViewTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
        active ? "bg-primary-faint text-primary" : "text-text-muted hover:text-text-secondary"
      }`}
    >
      {label}
    </button>
  );
}

function ActionPill({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-xl border border-border bg-elevated/40 py-3 text-[11px] font-medium transition-colors ${
        disabled
          ? "cursor-not-allowed text-text-muted/70"
          : "text-text-primary hover:border-border-strong hover:bg-elevated"
      }`}
      title={disabled ? "Coming soon" : undefined}
    >
      <span
        className={`grid h-9 w-9 place-items-center rounded-full ${
          disabled ? "bg-surface text-text-muted/70" : "bg-primary-faint text-primary"
        }`}
      >
        {icon}
      </span>
      {label}
    </button>
  );
}

function PayPanel({
  label,
  balanceLabel,
  balance,
  amountUsd,
  setAmountUsd,
  token,
}: {
  label: string;
  balanceLabel: string;
  balance: number;
  amountUsd: string;
  setAmountUsd: (v: string) => void;
  token: { symbol: string; color: string; logo?: string };
}) {
  return (
    <div className="rounded-lg border border-border bg-base p-3">
      <div className="mb-1.5 flex items-center justify-between text-[11px] text-text-muted">
        <span>{label}</span>
        <span className="num text-text-secondary">{balanceLabel}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <input
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          value={amountUsd}
          onChange={(e) => setAmountUsd(e.target.value)}
          className="num w-full bg-transparent text-h2 font-semibold text-text-primary outline-none placeholder:text-text-muted/40"
        />
        <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-small">
          <TokenLogo
            src={token.logo}
            alt={token.symbol}
            size={18}
            fallbackBg={token.color}
            fallbackText={token.symbol[0]}
          />
          <span className="font-semibold text-text-primary">{token.symbol}</span>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        {PERCENTAGES.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setAmountUsd(((balance * p) / 100).toFixed(2))}
            className="rounded-md border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-text-secondary hover:border-border-strong hover:text-text-primary"
          >
            {p === 100 ? "Max" : `${p}%`}
          </button>
        ))}
      </div>
    </div>
  );
}

function SellFromPanel({
  positions,
  selected,
  onSelect,
  chain,
}: {
  positions: OpenPosition[];
  selected: OpenPosition | null;
  onSelect: (p: OpenPosition | null) => void;
  chain: ChainId;
}) {
  return (
    <div className="rounded-lg border border-border bg-base p-3">
      <div className="mb-1.5 flex items-center justify-between text-[11px] text-text-muted">
        <span>You Pay</span>
        {selected && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-[10px] text-text-secondary hover:text-text-primary"
          >
            Change
          </button>
        )}
      </div>
      {selected ? (
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="num truncate text-h2 font-semibold text-text-primary">
              {formatUsd(selected.current_value_usd, 2)}
            </div>
            <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-small">
              <TokenLogo
                alt={selected.symbol ?? "?"}
                size={18}
                fallbackText={(selected.symbol ?? "?").slice(0, 1).toUpperCase()}
              />
              <span className="font-semibold text-text-primary">
                {selected.symbol ?? "TOKEN"}
              </span>
            </div>
          </div>
          <div className="mt-1.5 text-[11px] text-text-muted">
            Closes the whole position — partial sells not supported yet.
          </div>
        </div>
      ) : positions.length === 0 ? (
        <div className="py-3 text-center text-[11px] text-text-muted">
          No open positions on {NATIVE[chain].name} to sell.
        </div>
      ) : (
        <div className="max-h-44 space-y-1 overflow-y-auto">
          {positions.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p)}
              className="flex w-full items-center justify-between rounded-md border border-border bg-surface px-2 py-1.5 text-left hover:border-border-strong hover:bg-elevated"
            >
              <div className="inline-flex min-w-0 items-center gap-2">
                <TokenLogo
                  alt={p.symbol ?? "?"}
                  size={22}
                  fallbackText={(p.symbol ?? "?").slice(0, 2).toUpperCase()}
                />
                <div className="min-w-0">
                <div className="truncate text-small font-semibold text-text-primary">
                  {p.symbol ?? p.token_id.slice(0, 10)}
                </div>
                <div className="num truncate text-[10px] text-text-muted">
                  Size {formatUsd(p.size_usd, 2)}
                </div>
                </div>
              </div>
              <div className="text-right">
                <div className="num text-small font-semibold text-text-primary">
                  {formatUsd(p.current_value_usd, 2)}
                </div>
                <div
                  className={`num text-[10px] ${
                    p.pnl_usd >= 0 ? "text-primary" : "text-danger"
                  }`}
                >
                  {p.pnl_usd >= 0 ? "+" : ""}
                  {p.pnl_pct.toFixed(2)}%
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ReceiveBuyPanel({
  chain,
  selected,
  onSelect,
  onClear,
  query,
  setQuery,
  debouncedQ,
  results,
  isFetching,
  receiveEst,
}: {
  chain: ChainId;
  selected: TokenRow | null;
  onSelect: (t: TokenRow) => void;
  onClear: () => void;
  query: string;
  setQuery: (s: string) => void;
  debouncedQ: string;
  results: TokenRow[];
  isFetching: boolean;
  receiveEst: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-base p-3">
      <div className="mb-1.5 flex items-center justify-between text-[11px] text-text-muted">
        <span>You Receive</span>
        {selected?.price_usd && receiveEst > 0 ? (
          <span className="num text-text-secondary">
            ~{receiveEst.toLocaleString(undefined, { maximumFractionDigits: 4 })}{" "}
            {selected.symbol ?? ""}
          </span>
        ) : null}
      </div>
      {selected ? (
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex min-w-0 items-center gap-2.5">
            <TokenLogo
              src={selected.logo_url}
              alt={selected.symbol ?? "?"}
              size={30}
              fallbackText={(selected.symbol ?? "?").slice(0, 2).toUpperCase()}
            />
            <div className="min-w-0">
              <div className="truncate text-h3 font-semibold text-text-primary">
                {selected.symbol ?? selected.token_id.slice(0, 6)}
              </div>
              <div className="num truncate text-[11px] text-text-muted">
                {selected.price_usd
                  ? `$${selected.price_usd.toPrecision(4)}`
                  : selected.token_id.split("-")[0].slice(0, 20)}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-text-secondary hover:border-border-strong hover:text-text-primary"
          >
            Change
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-2 py-1.5">
            <MagnifyingGlass size={12} className="text-text-muted" />
            <input
              type="text"
              placeholder={`Search ${NATIVE[chain].name} token by name or address`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-small text-text-primary outline-none placeholder:text-text-muted/60"
            />
          </div>
          {debouncedQ.length >= 2 && (
            <div className="mt-1 max-h-44 overflow-y-auto rounded-md border border-border bg-surface">
              {isFetching && results.length === 0 ? (
                <div className="px-2 py-2 text-[11px] text-text-muted">Searching…</div>
              ) : results.length === 0 ? (
                <div className="px-2 py-2 text-[11px] text-text-muted">
                  No tokens matched “{debouncedQ}”.
                </div>
              ) : (
                results.map((r) => (
                  <button
                    key={r.token_id}
                    type="button"
                    onClick={() => onSelect(r)}
                    className="flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left hover:bg-elevated"
                  >
                    <div className="inline-flex min-w-0 items-center gap-2">
                      <TokenLogo
                        src={r.logo_url}
                        alt={r.symbol ?? "?"}
                        size={22}
                        fallbackText={(r.symbol ?? "?").slice(0, 2).toUpperCase()}
                      />
                      <div className="min-w-0">
                        <div className="truncate text-small font-medium text-text-primary">
                          {r.symbol ?? r.token_id.slice(0, 8)}
                        </div>
                        <div className="num truncate text-[10px] text-text-muted">
                          {r.token_id.split("-")[0].slice(0, 14)}…
                        </div>
                      </div>
                    </div>
                    {r.price_usd != null && (
                      <div className="num shrink-0 text-[11px] text-text-secondary">
                        ${r.price_usd.toPrecision(4)}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReceiveSellPanel({
  chain,
  position,
}: {
  chain: ChainId;
  position: OpenPosition | null;
}) {
  return (
    <div className="rounded-lg border border-border bg-base p-3">
      <div className="mb-1.5 flex items-center justify-between text-[11px] text-text-muted">
        <span>You Receive</span>
        {position ? (
          <span className="num text-text-secondary">
            ~{formatUsd(position.current_value_usd, 2)}
          </span>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="num truncate text-h2 font-semibold text-text-primary">
          {position ? formatUsd(position.current_value_usd, 2) : "0.00"}
        </div>
        <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-small">
          <TokenLogo
            src={NATIVE[chain].logo}
            alt={NATIVE[chain].symbol}
            size={18}
            fallbackBg={NATIVE[chain].color}
            fallbackText={NATIVE[chain].symbol[0]}
          />
          <span className="font-semibold text-text-primary">{NATIVE[chain].symbol}</span>
        </div>
      </div>
      <div className="mt-1.5 text-[11px] text-text-muted">
        Proceeds (entry + live P&L) credit back to your {NATIVE[chain].name} cash balance.
      </div>
    </div>
  );
}

function Toast({
  toast,
  onClear,
  inline,
}: {
  toast: { kind: "ok" | "err"; msg: string };
  onClear: () => void;
  inline?: boolean;
}) {
  useEffect(() => {
    const t = setTimeout(onClear, 4000);
    return () => clearTimeout(t);
  }, [toast, onClear]);
  return (
    <div
      className={`${inline ? "" : "mx-4 mb-3"} rounded-md border px-2 py-1.5 text-[11px] ${
        toast.kind === "ok"
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-danger/40 bg-danger/10 text-danger"
      }`}
    >
      {toast.msg}
    </div>
  );
}

function errMsg(e: any): string {
  return e?.response?.data?.detail ?? e?.message ?? "Request failed.";
}
