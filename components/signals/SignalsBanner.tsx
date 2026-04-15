"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lightning } from "@phosphor-icons/react";
import { endpoints } from "@/lib/api/endpoints";

/** Slim "next signal scan in M:SS" pill — synced to the backend rank-poller. */
export function SignalsBanner() {
  const secs = useNextScanCountdown();
  return (
    <div className="inline-flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-2">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary-faint text-primary">
        <Lightning size={13} weight="fill" />
      </span>
      <div className="leading-tight">
        <div className="text-[12px] font-semibold text-text-primary">
          Next signal scan
        </div>
        <div className="text-[10px] text-text-muted">
          Rank-stack signals fire on a rolling 5-min cycle
        </div>
      </div>
      <div className="ml-1 inline-flex items-center gap-1.5 rounded-md border border-border bg-base/40 px-2 py-1 num text-small font-semibold text-primary">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
        <span>{secs == null ? "—:—" : formatMMSS(secs)}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Returns seconds until the next backend rank-poll fire, ticking once per
 * second. Refetches the absolute target from /api/system/next-scan-at every
 * 30s so we drift-correct against the server clock.
 */
function useNextScanCountdown(): number | null {
  const { data } = useQuery<{ next_scan_at: string | null; interval_seconds?: number }>({
    queryKey: ["system", "next-scan-at"],
    queryFn: endpoints.nextScanAt,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  const targetMs = data?.next_scan_at ? new Date(data.next_scan_at).getTime() : null;
  const interval = (data?.interval_seconds ?? 300) * 1000;

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (targetMs == null) return null;

  // If we're past the target, the next fire is one interval later — keep the
  // countdown rolling forward instead of going negative.
  let diff = targetMs - now;
  while (diff < 0 && interval > 0) diff += interval;
  return Math.max(0, Math.floor(diff / 1000));
}

function formatMMSS(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
