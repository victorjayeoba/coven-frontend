"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react";
import { useTelegramStatus } from "@/lib/hooks/useTelegram";
import { endpoints } from "@/lib/api/endpoints";

/**
 * Empty-state for the signals table — combines the Telegram CTA with a live
 * countdown to the next scan, so users see exactly when they'll get pinged.
 */
export function SignalsEmptyTelegram() {
  const { data: tg } = useTelegramStatus();
  const linked = !!tg?.linked;
  const secs = useNextScanCountdown();

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <TelegramLogo />

      <h3 className="mt-4 text-h3 font-semibold text-text-primary">
        {linked
          ? "You'll get the next signal on Telegram."
          : "Get the next signal on Telegram."}
      </h3>
      <p className="mt-2 max-w-sm text-small text-text-secondary">
        {linked
          ? "Telegram alerts are on. The next scan fires in:"
          : "Hook up our bot once and every signal above your conviction threshold lands in your DM with a one-tap buy."}
      </p>

      {/* Countdown card */}
      <div className="mt-5 inline-flex items-center gap-3 rounded-xl border border-border bg-base/40 px-4 py-2.5">
        <span className="text-[10px] uppercase tracking-wider text-text-muted">
          Next scan in
        </span>
        <span className="num inline-flex items-center gap-1.5 text-h3 font-semibold text-primary leading-none">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          {secs == null ? "—:—" : formatMMSS(secs)}
        </span>
      </div>

      {/* Action */}
      {linked ? (
        <div className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary-faint px-3 py-1.5 text-small font-medium text-primary">
          <CheckCircle size={14} weight="fill" />
          Telegram connected · alerts on
        </div>
      ) : (
        <Link
          href="/notifications"
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-small font-semibold text-[#0b0e14] transition-colors hover:bg-primary-hover"
        >
          Connect Telegram
          <ArrowRight size={12} weight="bold" />
        </Link>
      )}

      {!linked && (
        <p className="mt-2 text-[11px] text-text-muted">
          Without Telegram you'll only see signals here while the page is open.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function useNextScanCountdown(): number | null {
  const { data } = useQuery<{
    next_scan_at: string | null;
    interval_seconds?: number;
  }>({
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
  let diff = targetMs - now;
  while (diff < 0 && interval > 0) diff += interval;
  return Math.max(0, Math.floor(diff / 1000));
}

function formatMMSS(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/* Official Telegram glyph (white paper plane on the brand circle). */
function TelegramLogo() {
  return (
    <svg
      width="52"
      height="52"
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Telegram"
    >
      <defs>
        <linearGradient id="tg-grad" x1=".667" x2=".417" y1=".167" y2=".75">
          <stop offset="0" stopColor="#37aee2" />
          <stop offset="1" stopColor="#1e96c8" />
        </linearGradient>
      </defs>
      <circle cx="120" cy="120" r="120" fill="url(#tg-grad)" />
      <path
        fill="#c8daea"
        d="M98 175c-3.9 0-3.2-1.5-4.6-5.2L82 132.7l85-50.4"
      />
      <path
        fill="#a9c9dd"
        d="M98 175c3 0 4.3-1.4 6-3l16-15.6-20-12"
      />
      <path
        fill="#fff"
        d="M100 144.4l48.3 35.7c5.5 3 9.5 1.5 10.9-5.1l19.7-92.8c2-8.1-3.1-11.8-8.4-9.4L55 119.3c-7.9 3.2-7.8 7.6-1.4 9.5l29.5 9.2 68.3-43.1c3.2-2 6.2-.9 3.8 1.2"
      />
    </svg>
  );
}
