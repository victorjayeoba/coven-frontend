"use client";

import { useEffect, useState } from "react";
import { X, Warning, CaretDown, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { formatUsd } from "@/lib/format";
import { NetworkId } from "@/lib/stores/useUIStore";
import { useBalances, useDeposit } from "@/lib/hooks/useBalances";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Mode = "paper" | "live";

const NETWORKS = [
  { id: "solana", name: "Solana", symbol: "SOL", color: "#14f195" },
  { id: "bsc", name: "BNB Smart Chain", symbol: "BNB", color: "#f0b90b" },
];

const QUICK_AMOUNTS = [100, 500, 1000, 5000, 10000];

export function FundWalletModal({ open, onClose }: Props) {
  const [mode, setMode] = useState<Mode>("paper");
  const [network, setNetwork] = useState(NETWORKS[0].id);
  const [netOpen, setNetOpen] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [done, setDone] = useState(false);

  const { data: balancesData } = useBalances();
  const balances = balancesData?.balances ?? { solana: 0, bsc: 0 };
  const totalBalance = balancesData?.total ?? 0;
  const networkBalance = Number(balances[network as NetworkId] ?? 0);
  const depositMut = useDeposit();

  useEffect(() => {
    if (!open) {
      setAmount("");
      setDone(false);
      setNetOpen(false);
      setMode("paper");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const parsed = Number(amount);
  const valid = Number.isFinite(parsed) && parsed > 0;
  const selectedNet = NETWORKS.find((n) => n.id === network)!;

  const handleDeposit = async () => {
    if (!valid || depositMut.isPending) return;
    try {
      await depositMut.mutateAsync({
        network: network as NetworkId,
        amount: parsed,
      });
      setDone(true);
      setTimeout(() => {
        onClose();
      }, 1100);
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Deposit failed.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5">
          <div>
            <h2 className="font-display text-h1 text-text-primary">
              Fund Wallet
            </h2>
            <p className="mt-0.5 text-small text-text-secondary">
              Once funded, you can start trading instantly.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-text-muted transition-colors hover:bg-elevated hover:text-text-primary"
          >
            <X size={16} />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="px-5 pt-4">
          <div className="grid grid-cols-2 gap-1 rounded-md border border-border bg-input p-1">
            <button
              type="button"
              onClick={() => setMode("paper")}
              className={cn(
                "h-8 rounded text-small font-medium transition-colors",
                mode === "paper"
                  ? "bg-primary text-base"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              Paper Trading
            </button>
            <button
              type="button"
              onClick={() => setMode("live")}
              className={cn(
                "flex h-8 items-center justify-center gap-1.5 rounded text-small font-medium transition-colors",
                mode === "live"
                  ? "bg-elevated text-text-primary"
                  : "text-text-muted hover:text-text-secondary",
              )}
            >
              Live Trading
              <span className="rounded-sm bg-warning/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning">
                Soon
              </span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pb-5 pt-4">
          {mode === "live" ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-input py-10 text-center">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-warning/10">
                <Warning size={18} className="text-warning" />
              </div>
              <p className="mt-3 text-body font-semibold text-text-primary">
                Live Trading — Coming Soon
              </p>
              <p className="mt-1 max-w-xs text-small text-text-secondary">
                Real on-chain deposits and execution will be available in the
                next release. For now, use Paper Trading to test strategies
                risk-free.
              </p>
              <button
                type="button"
                onClick={() => setMode("paper")}
                className="mt-4 text-small font-medium text-primary hover:text-primary-hover"
              >
                Switch to Paper Trading →
              </button>
            </div>
          ) : done ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary-faint">
                <Check size={22} className="text-primary" weight="bold" />
              </div>
              <p className="mt-3 text-body-lg font-semibold text-text-primary">
                Deposit successful
              </p>
              <p className="mt-1 text-small text-text-secondary">
                {formatUsd(parsed, 2)} added to your {selectedNet.name} paper wallet.
              </p>
            </div>
          ) : (
            <>
              {/* Network select */}
              <label className="text-small font-medium text-text-secondary">
                Network
              </label>
              <div className="relative mt-1.5">
                <button
                  type="button"
                  onClick={() => setNetOpen((o) => !o)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-input px-3 text-body text-text-primary transition-colors hover:border-border-strong"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold text-black"
                      style={{ background: selectedNet.color }}
                    >
                      {selectedNet.symbol[0]}
                    </span>
                    {selectedNet.name}
                  </span>
                  <CaretDown size={12} className="text-text-muted" />
                </button>
                {netOpen && (
                  <div className="absolute left-0 right-0 top-11 z-10 overflow-hidden rounded-md border border-border bg-elevated shadow-lg">
                    {NETWORKS.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          setNetwork(n.id);
                          setNetOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-body text-text-primary hover:bg-row-hover"
                      >
                        <span
                          className="grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold text-black"
                          style={{ background: n.color }}
                        >
                          {n.symbol[0]}
                        </span>
                        {n.name}
                        <span className="ml-auto text-micro text-text-muted">
                          Supported
                        </span>
                      </button>
                    ))}
                    <div className="flex items-center gap-2 border-t border-border bg-surface px-3 py-2 text-micro text-text-muted">
                      More networks coming soon
                    </div>
                  </div>
                )}
              </div>

              {/* Info banner */}
              <div className="mt-3 flex gap-2 rounded-md border border-warning/25 bg-warning/5 p-2.5">
                <Warning
                  size={14}
                  weight="fill"
                  className="mt-0.5 shrink-0 text-warning"
                />
                <p className="text-small leading-snug text-text-secondary">
                  <span className="font-semibold text-warning">
                    Paper mode:
                  </span>{" "}
                  virtual USD credited instantly to your paper wallet. No real
                  funds are moved.
                </p>
              </div>

              {/* Amount */}
              <label className="mt-4 block text-small font-medium text-text-secondary">
                Deposit Amount (USD)
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-body text-text-muted">
                  $
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="num h-11 w-full rounded-md border border-border bg-input pl-7 pr-3 text-body-lg font-semibold text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                />
              </div>

              {/* Quick chips */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {QUICK_AMOUNTS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(String(v))}
                    className="num h-7 rounded border border-border bg-input px-2.5 text-small text-text-secondary transition-colors hover:border-primary/50 hover:text-text-primary"
                  >
                    ${v.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Balance rows */}
              <div className="mt-4 overflow-hidden rounded-md border border-border bg-input">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="inline-flex items-center gap-2 text-small text-text-secondary">
                    <span
                      className="grid h-4 w-4 place-items-center rounded-full text-[9px] font-bold text-black"
                      style={{ background: selectedNet.color }}
                    >
                      {selectedNet.symbol[0]}
                    </span>
                    {selectedNet.name} balance
                  </span>
                  <span className="num text-body font-semibold text-text-primary">
                    {formatUsd(networkBalance, 2)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border bg-surface/60 px-3 py-1.5">
                  <span className="text-micro text-text-muted">Total across networks</span>
                  <span className="num text-small font-semibold text-text-secondary">
                    {formatUsd(totalBalance, 2)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={!valid || depositMut.isPending}
                onClick={handleDeposit}
                className="mt-4 h-10 w-full rounded-md bg-primary text-body font-semibold text-base transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                {depositMut.isPending
                  ? "Depositing…"
                  : `Deposit ${valid ? formatUsd(parsed, 2) : ""}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
