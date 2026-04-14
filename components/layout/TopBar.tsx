"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Wallet, CaretDown } from "@phosphor-icons/react";
import { endpoints } from "@/lib/api/endpoints";
import { formatUsd } from "@/lib/format";
import { useUIStore } from "@/lib/stores/useUIStore";
import { FundWalletModal } from "@/components/modals/FundWalletModal";

export function TopBar() {
  const [fundOpen, setFundOpen] = useState(false);
  const paperBalance = useUIStore((s) => s.paperBalance);

  const { data: pnl } = useQuery({
    queryKey: ["pnl-summary"],
    queryFn: endpoints.pnlSummary,
    refetchInterval: 30_000,
  });

  const pnlValue =
    (pnl?.unrealized_pnl_usd ?? 0) + (pnl?.total_realized_pnl_usd ?? 0);
  const walletValue = paperBalance + pnlValue;

  return (
    <header className="flex h-14 shrink-0 items-center justify-end gap-2 border-b border-border bg-base px-5">
      {/* Wallet pill */}
      <button
        type="button"
        onClick={() => setFundOpen(true)}
        className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-small transition-colors hover:border-border-strong hover:bg-elevated"
      >
        <span className="grid h-4 w-4 place-items-center rounded-sm bg-primary-faint">
          <Wallet size={10} weight="fill" className="text-primary" />
        </span>
        <span className="text-text-secondary">Wallet</span>
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
    </header>
  );
}
