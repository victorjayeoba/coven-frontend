"use client";

import { useEffect, useState } from "react";
import {
  PaperPlaneTilt,
  Copy,
  Check,
  ArrowSquareOut,
  Plugs,
  Lightning,
  Robot,
  BellSlash,
  Play,
} from "@phosphor-icons/react";
import {
  useStartTelegramLink,
  useTelegramConfig,
  useTelegramStatus,
  useTelegramTest,
  useUnlinkTelegram,
  useUpdateTelegramPrefs,
} from "@/lib/hooks/useTelegram";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";

export function TelegramConnect() {
  const { data: config } = useTelegramConfig();
  const [linkOpen, setLinkOpen] = useState(false);
  const { data: status, isLoading } = useTelegramStatus({
    pollMs: linkOpen ? 2000 : undefined,
  });

  const startLink = useStartTelegramLink();
  const unlink = useUnlinkTelegram();
  const updatePrefs = useUpdateTelegramPrefs();
  const sendTest = useTelegramTest();

  const [linkData, setLinkData] = useState<{
    code: string;
    deep_link: string | null;
    expires_at: string;
    bot_username: string | null;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [lastSent, setLastSent] =
    useState<"signal" | "trade_open" | "trade_close" | "all" | null>(null);

  useEffect(() => {
    if (linkOpen && status?.linked) {
      setLinkOpen(false);
      setLinkData(null);
    }
  }, [linkOpen, status?.linked]);

  const beginLink = async () => {
    setLinkOpen(true);
    try {
      const data = await startLink.mutateAsync();
      setLinkData(data);
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Couldn't create link code.");
      setLinkOpen(false);
    }
  };

  const copyCode = async () => {
    if (!linkData) return;
    try {
      await navigator.clipboard.writeText(`/start ${linkData.code}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const fireTest = async (
    kind: "signal" | "trade_open" | "trade_close" | "all",
  ) => {
    try {
      await sendTest.mutateAsync(kind);
      setLastSent(kind);
      setTimeout(() => setLastSent(null), 1800);
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Test send failed.");
    }
  };

  // — bot not configured on server
  if (config && !config.configured) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-small text-text-secondary">
        <Plugs size={14} className="mt-0.5 shrink-0 text-warning" />
        <div>
          Set <code className="rounded bg-elevated px-1">TELEGRAM_BOT_TOKEN</code>{" "}
          in <code className="rounded bg-elevated px-1">backend/.env</code> and
          restart. Then come back here.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="h-24 rounded-lg border border-border bg-surface/60" />;
  }

  // — CONNECTED
  if (status?.linked && status.link) {
    const link = status.link;
    const handle = link.username
      ? `@${link.username}`
      : link.first_name || `chat ${link.chat_id}`;

    return (
      <div className="space-y-4">
        {/* Status strip */}
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-body font-semibold text-text-primary">
                {handle}
              </span>
              {link.linked_at && (
                <span className="text-micro text-text-muted">
                  linked {formatRelativeTime(link.linked_at)}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirm("Disconnect?")) unlink.mutate();
            }}
            disabled={unlink.isPending}
            className="text-micro font-medium text-text-muted transition-colors hover:text-loss disabled:opacity-50"
          >
            {unlink.isPending ? "…" : "Disconnect"}
          </button>
        </div>

        {/* Preference rows — each with an inline preview trigger */}
        <div className="divide-y divide-border rounded-lg border border-border bg-surface">
          <PrefRow
            icon={<Lightning size={14} weight="fill" className="text-warning" />}
            label="Cluster signals"
            on={link.prefs.signals}
            onToggle={(v) => updatePrefs.mutate({ signals: v })}
            testKind="signal"
            testLoading={
              sendTest.isPending && sendTest.variables === "signal"
            }
            testJustSent={lastSent === "signal"}
            onTest={fireTest}
          />
          <PrefRow
            icon={<Robot size={14} weight="fill" className="text-info" />}
            label="Bot trade activity"
            on={link.prefs.trades}
            onToggle={(v) => updatePrefs.mutate({ trades: v })}
            testKind="trade_open"
            testLoading={
              sendTest.isPending &&
              (sendTest.variables === "trade_open" ||
                sendTest.variables === "trade_close")
            }
            testJustSent={
              lastSent === "trade_open" || lastSent === "trade_close"
            }
            onTest={(k) => {
              // alternate open/close for variety
              const next =
                lastSent === "trade_open" ? "trade_close" : "trade_open";
              fireTest(next);
            }}
          />
        </div>

        {link.prefs.mute_until && (
          <div className="inline-flex items-center gap-2 rounded-md bg-elevated px-2.5 py-1 text-micro text-text-muted">
            <BellSlash size={11} />
            Muted until {new Date(link.prefs.mute_until).toLocaleString()}
            <button
              type="button"
              onClick={() => updatePrefs.mutate({ mute_until: null })}
              className="font-medium text-primary hover:text-primary-hover"
            >
              Unmute
            </button>
          </div>
        )}

        {/* Send all — small inline link, not a full-size button */}
        <div className="text-right">
          <button
            type="button"
            onClick={() => fireTest("all")}
            disabled={sendTest.isPending && sendTest.variables === "all"}
            className="inline-flex items-center gap-1 text-micro font-medium text-text-muted transition-colors hover:text-primary disabled:opacity-50"
          >
            {sendTest.isPending && sendTest.variables === "all"
              ? "Sending…"
              : lastSent === "all"
                ? "Sent all three ✓"
                : "Preview all three templates →"}
          </button>
        </div>
      </div>
    );
  }

  // — UNLINKED
  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-lg border border-border bg-surface">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#229ed9]/12 blur-3xl" />
        <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#229ed9]/15 text-[#229ed9]">
              <PaperPlaneTilt size={18} weight="fill" />
            </span>
            <div>
              <div className="text-body-lg font-semibold text-text-primary">
                Hook up Telegram
              </div>
              <p className="mt-0.5 max-w-md text-small text-text-secondary">
                Live cabal signals, bot trade pings, and tap-to-buy — without
                opening the dashboard.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={beginLink}
            disabled={startLink.isPending || linkOpen}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-[#229ed9] px-4 text-small font-semibold text-white shadow-[0_6px_20px_rgba(34,158,217,0.3)] transition-all hover:-translate-y-0.5 hover:bg-[#1c8cc0] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PaperPlaneTilt size={13} weight="fill" />
            {startLink.isPending ? "Preparing…" : "Connect"}
          </button>
        </div>
      </div>

      {/* Link code step */}
      {linkOpen && linkData && (
        <div className="rounded-lg border border-border bg-surface">
          <div className="space-y-3 p-4">
            {linkData.deep_link && (
              <a
                href={linkData.deep_link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#229ed9] px-4 text-small font-semibold text-white transition-colors hover:bg-[#1c8cc0] sm:w-auto"
              >
                <PaperPlaneTilt size={13} weight="fill" />
                Open @{linkData.bot_username} in Telegram
                <ArrowSquareOut size={11} />
              </a>
            )}

            <div className="flex items-center gap-2 rounded-md bg-base px-3 py-2">
              <code className="num flex-1 select-all text-small text-text-primary">
                /start {linkData.code}
              </code>
              <button
                type="button"
                onClick={copyCode}
                className="text-micro font-medium text-text-muted transition-colors hover:text-primary"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="flex items-center justify-between text-micro text-text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                Waiting…
              </span>
              <button
                type="button"
                onClick={() => {
                  setLinkOpen(false);
                  setLinkData(null);
                }}
                className="hover:text-text-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PrefRow({
  icon,
  label,
  on,
  onToggle,
  testKind,
  testLoading,
  testJustSent,
  onTest,
}: {
  icon: React.ReactNode;
  label: string;
  on: boolean;
  onToggle: (v: boolean) => void;
  testKind: "signal" | "trade_open" | "trade_close";
  testLoading: boolean;
  testJustSent: boolean;
  onTest: (k: "signal" | "trade_open" | "trade_close") => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-elevated">
        {icon}
      </span>
      <span className="flex-1 text-small font-semibold text-text-primary">
        {label}
      </span>

      {/* Tiny inline "try it" — only when this pref is on */}
      {on && (
        <button
          type="button"
          onClick={() => onTest(testKind)}
          disabled={testLoading}
          className={cn(
            "inline-flex items-center gap-1 text-micro font-medium transition-colors",
            testJustSent
              ? "text-primary"
              : "text-text-muted hover:text-text-primary",
            "disabled:opacity-50",
          )}
          title="Send a preview to your chat"
        >
          {testJustSent ? (
            <>
              <Check size={10} weight="bold" /> sent
            </>
          ) : testLoading ? (
            "…"
          ) : (
            <>
              <Play size={9} weight="fill" /> test
            </>
          )}
        </button>
      )}

      {/* Toggle */}
      <button
        type="button"
        onClick={() => onToggle(!on)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors",
          on ? "bg-primary" : "bg-elevated",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
            on ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}
