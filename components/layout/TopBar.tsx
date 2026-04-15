"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Wallet, CaretDown, ArrowsDownUp } from "@phosphor-icons/react";
import { endpoints } from "@/lib/api/endpoints";
import { formatUsd } from "@/lib/format";
import { useBalances } from "@/lib/hooks/useBalances";
import { FundWalletModal } from "@/components/modals/FundWalletModal";
import { SwapPopover } from "@/components/layout/SwapPopover";

export function TopBar() {
  const [fundOpen, setFundOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const { data: balancesData } = useBalances();
  const paperBalance = balancesData?.total ?? 0;
  const paperBalances = balancesData?.balances ?? { solana: 0, bsc: 0 };

  const { data: pnl } = useQuery({
    queryKey: ["pnl-summary"],
    queryFn: endpoints.pnlSummary,
    refetchInterval: 30_000,
  });

  const pnlValue =
    (pnl?.unrealized_pnl_usd ?? 0) + (pnl?.total_realized_pnl_usd ?? 0);
  const walletValue = paperBalance + pnlValue;

  return (
    <header className="relative flex h-14 shrink-0 items-center justify-end gap-2 border-b border-border bg-base px-5">
      {/* Swap button — opens Phantom-style swap popover */}
      <button
        type="button"
        onClick={() => setSwapOpen((o) => !o)}
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 text-small text-text-primary transition-colors hover:border-border-strong hover:bg-elevated"
      >
        <ArrowsDownUp size={12} className="text-primary" weight="bold" />
        <span className="font-medium">Swap</span>
      </button>

      {/* Wallet pill with per-network dropdown */}
      <WalletPill
        total={walletValue}
        balances={paperBalances}
        onFund={() => setFundOpen(true)}
      />
      <div className="hidden" />
      <button
        type="button"
        onClick={() => setFundOpen(true)}
        className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-small transition-colors hover:border-border-strong hover:bg-elevated md:hidden"
      >
        <span className="grid h-4 w-4 place-items-center rounded-sm bg-primary-faint">
          <Wallet size={10} weight="fill" className="text-primary" />
        </span>
        <span className="num font-semibold text-text-primary">
          {formatUsd(walletValue, 2)}
        </span>
        <CaretDown size={10} className="text-text-muted" />
      </button>

      {/* Fund Wallet CTA */}
      <button
        type="button"
        onClick={() => setFundOpen(true)}
        className="h-8 rounded-md bg-primary px-3 text-small font-medium text-base transition-colors hover:bg-primary-hover"
      >
        Fund Wallet
      </button>

      <FundWalletModal open={fundOpen} onClose={() => setFundOpen(false)} />
      <SwapPopover
        open={swapOpen}
        onClose={() => setSwapOpen(false)}
        onOpenFund={() => setFundOpen(true)}
      />
    </header>
  );
}

const NETWORK_META: Record<
  string,
  { name: string; symbol: string; color: string }
> = {
  solana: { name: "Solana", symbol: "SOL", color: "#14f195" },
  bsc: { name: "BNB Smart Chain", symbol: "BNB", color: "#f0b90b" },
};

function WalletPill({
  total,
  balances,
  onFund,
}: {
  total: number;
  balances: Record<string, number>;
  onFund: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-small transition-colors hover:border-border-strong hover:bg-elevated"
      >
        <span className="grid h-4 w-4 place-items-center rounded-sm bg-primary-faint">
          <Wallet size={10} weight="fill" className="text-primary" />
        </span>
        <span className="text-text-secondary">Wallet</span>
        <span className="num font-semibold text-text-primary">
          {formatUsd(total, 2)}
        </span>
        <CaretDown
          size={10}
          className={`text-text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-40 w-64 overflow-hidden rounded-md border border-border bg-surface shadow-xl">
          <div className="border-b border-border px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Paper balance · by network
            </div>
          </div>
          <div className="divide-y divide-border">
            {Object.entries(balances).map(([id, amount]) => {
              const meta =
                NETWORK_META[id] ?? { name: id, symbol: "?", color: "#888" };
              return (
                <div
                  key={id}
                  className="flex items-center justify-between px-3 py-2"
                >
                  <span className="inline-flex items-center gap-2 text-small text-text-primary">
                    <span
                      className="grid h-4 w-4 place-items-center rounded-full text-[9px] font-bold text-black"
                      style={{ background: meta.color }}
                    >
                      {meta.symbol[0]}
                    </span>
                    {meta.name}
                  </span>
                  <span className="num text-small font-semibold text-text-primary">
                    {formatUsd(amount, 2)}
                  </span>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setOpen(false);
              onFund();
            }}
            className="block w-full border-t border-border bg-primary-faint/30 px-3 py-2 text-left text-small font-medium text-primary hover:bg-primary-faint"
          >
            + Fund a network
          </button>
        </div>
      )}
    </div>
  );
}
