"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Lightning,
  PaperPlaneTilt,
} from "@phosphor-icons/react";
import { useTelegramStatus } from "@/lib/hooks/useTelegram";

/**
 * Compact banner above the signals table:
 * - Live countdown to the next rank-poll scan (every 5 minutes).
 * - "Connect Telegram" CTA, hidden once linked.
 */
export function SignalsBanner() {
  const { data: tg } = useTelegramStatus();
  const linked = !!tg?.linked;
  const secsUntil = useNextScanCountdown();

  return (
    <div className="flex flex-col items-stretch gap-3 rounded-xl border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Left — countdown */}
      <div className="inline-flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary-faint text-primary">
          <Lightning size={16} weight="fill" />
        </span>
        <div className="leading-tight">
          <div className="text-small font-semibold text-text-primary">
            Next signal scan
          </div>
          <div className="text-[11px] text-text-muted">
            New rank-stack signals fire every 5 minutes
          </div>
        </div>
        <div className="ml-1 inline-flex items-center gap-1 rounded-md border border-border bg-base/40 px-2 py-1 num text-body font-semibold text-primary">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          <span>{formatMMSS(secsUntil)}</span>
        </div>
      </div>

      {/* Right — TG state */}
      {linked ? (
        <div className="inline-flex items-center gap-2 rounded-md bg-primary-faint px-3 py-1.5 text-[12px] font-medium text-primary">
          <CheckCircle size={14} weight="fill" />
          Telegram alerts on
        </div>
      ) : (
        <Link
          href="/notifications"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-small font-semibold text-[#0b0e14] transition-colors hover:bg-primary-hover"
        >
          <PaperPlaneTilt size={14} weight="fill" />
          Get signals on Telegram
          <ArrowRight size={12} weight="bold" />
        </Link>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** Seconds until the next 5-minute wall-clock boundary. Resyncs every tick. */
function useNextScanCountdown(): number {
  const [secs, setSecs] = useState(() => secondsUntilNextFiveMin());
  useEffect(() => {
    const id = setInterval(() => setSecs(secondsUntilNextFiveMin()), 1000);
    return () => clearInterval(id);
  }, []);
  return secs;
}

function secondsUntilNextFiveMin(): number {
  const now = new Date();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const minutesIntoBucket = minute % 5;
  // Time elapsed since the last 5-minute mark, in seconds.
  const elapsed = minutesIntoBucket * 60 + second;
  return 5 * 60 - elapsed;
}

function formatMMSS(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(1, "0")}:${String(s).padStart(2, "0")}`;
}
