"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  Lightning,
  PaperPlaneTilt,
  Robot,
  ShareNetwork,
  Stack,
  Wallet,
  Warning,
} from "@phosphor-icons/react";
import { PageHeader } from "@/components/layout/PageHeader";
import { endpoints } from "@/lib/api/endpoints";
import { cn } from "@/lib/cn";

type Prefs = {
  mode: "paper" | "live";
  conviction_threshold: number;
  max_position_usd: number;
  chains: string[];
  auto_exit: boolean;
};

const DEFAULT_PREFS: Prefs = {
  mode: "paper",
  conviction_threshold: 70,
  max_position_usd: 200,
  chains: ["solana", "bsc"],
  auto_exit: true,
};

export default function SettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: endpoints.getSettings,
  });

  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (data?.preferences) {
      setPrefs({ ...DEFAULT_PREFS, ...data.preferences });
    }
  }, [data]);

  const mut = useMutation({
    mutationFn: (payload: Partial<Prefs>) => endpoints.updateSettings(payload),
    onSuccess: (res) => {
      if (res?.preferences) setPrefs({ ...DEFAULT_PREFS, ...res.preferences });
      setSavedAt(Date.now());
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const update = <K extends keyof Prefs>(k: K, v: Prefs[K]) => {
    const next = { ...prefs, [k]: v };
    setPrefs(next);
    mut.mutate({ [k]: v } as Partial<Prefs>);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Trading preferences · auto-saves." />

      {isLoading ? (
        <div className="rounded-lg border border-border bg-surface p-12 text-center text-small text-text-muted">
          Loading…
        </div>
      ) : (
        <div className="space-y-4">
          {/* Conviction threshold — most important card */}
          <Card
            icon={<Lightning size={16} weight="fill" />}
            title="Conviction threshold"
            body="Telegram alerts only fire for signals scoring at or above this number. Rank-stack signals start at 55 (2 topics), 72 (3 topics), 85+ (4+ topics)."
            accent
          >
            <div className="flex items-baseline gap-3">
              <input
                type="range"
                min={0}
                max={95}
                step={1}
                value={prefs.conviction_threshold}
                onChange={(e) =>
                  update("conviction_threshold", Number(e.target.value))
                }
                className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-elevated accent-primary"
              />
              <span className="num w-12 text-right text-h2 font-semibold text-primary">
                {prefs.conviction_threshold}
              </span>
            </div>
            <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-text-muted">
              <span>0 · everything</span>
              <span>50 · balanced</span>
              <span>95 · elite only</span>
            </div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-border bg-base/40 px-2.5 py-1.5 text-[11px]">
              <ConvictionStatus value={prefs.conviction_threshold} />
            </div>
          </Card>

          {/* Max position size */}
          <Card
            icon={<Wallet size={16} weight="fill" />}
            title="Max position size"
            body="Hard cap on any single bot trade in USD."
          >
            <div className="flex items-center gap-2">
              <span className="text-text-muted">$</span>
              <input
                type="number"
                min={1}
                max={100000}
                step={10}
                value={prefs.max_position_usd}
                onChange={(e) =>
                  update("max_position_usd", Number(e.target.value))
                }
                className="num w-32 rounded-md border border-border bg-base px-3 py-2 text-body font-semibold text-text-primary outline-none focus:border-primary"
              />
              {[100, 500, 1000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => update("max_position_usd", v)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-small font-medium transition-colors",
                    prefs.max_position_usd === v
                      ? "border-primary bg-primary-faint text-primary"
                      : "border-border bg-surface text-text-secondary hover:border-border-strong",
                  )}
                >
                  ${v}
                </button>
              ))}
            </div>
          </Card>

          {/* Chains */}
          <Card
            icon={<Stack size={16} weight="fill" />}
            title="Active chains"
            body="Limits which chains your bots and Telegram alerts cover."
          >
            <div className="flex flex-wrap gap-2">
              {[
                { id: "solana", name: "Solana", color: "#14f195" },
                { id: "bsc", name: "BNB Chain", color: "#f0b90b" },
              ].map((c) => {
                const on = prefs.chains.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() =>
                      update(
                        "chains",
                        on
                          ? prefs.chains.filter((x) => x !== c.id)
                          : [...prefs.chains, c.id],
                      )
                    }
                    className={cn(
                      "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-small font-medium transition-colors",
                      on
                        ? "border-primary/50 bg-primary-faint text-text-primary"
                        : "border-border bg-surface text-text-secondary hover:border-border-strong",
                    )}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: c.color }}
                    />
                    {c.name}
                    {on && <CheckCircle size={12} weight="fill" className="text-primary" />}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Auto-exit toggle */}
          <Card
            icon={<Robot size={16} weight="fill" />}
            title="Auto-exit"
            body="Bots close positions automatically when TP / SL / trailing stop fires."
          >
            <Toggle
              on={prefs.auto_exit}
              onChange={(v) => update("auto_exit", v)}
              label={prefs.auto_exit ? "Enabled" : "Disabled"}
            />
          </Card>

          {/* Mode (paper/live) */}
          <Card
            icon={<ShareNetwork size={16} weight="fill" />}
            title="Trading mode"
            body="Paper uses a simulated wallet. Live trades real funds (when wired)."
          >
            <div className="inline-flex rounded-md border border-border bg-base p-0.5">
              {(["paper", "live"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => update("mode", m)}
                  className={cn(
                    "rounded px-3 py-1.5 text-small font-medium uppercase tracking-wider transition-colors",
                    prefs.mode === m
                      ? "bg-elevated text-text-primary"
                      : "text-text-muted hover:text-text-secondary",
                  )}
                >
                  {m}
                </button>
              ))}
              {prefs.mode === "live" && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-sm bg-warning/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning">
                  <Warning size={10} weight="fill" />
                  Real funds
                </span>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Save toast */}
      <SaveToast at={savedAt} pending={mut.isPending} error={mut.isError} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Card({
  icon,
  title,
  body,
  accent,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid gap-5 rounded-lg border bg-surface p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:gap-8",
        accent ? "border-primary/30" : "border-border",
      )}
    >
      <div>
        <div className="inline-flex items-center gap-2">
          <span
            className={cn(
              "grid h-7 w-7 place-items-center rounded-md",
              accent ? "bg-primary-faint text-primary" : "bg-elevated text-text-secondary",
            )}
          >
            {icon}
          </span>
          <h3 className="text-body font-semibold text-text-primary">{title}</h3>
        </div>
        <p className="mt-2 max-w-xs text-small text-text-secondary">{body}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="inline-flex items-center gap-2.5"
    >
      <span
        className={cn(
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
          on ? "bg-primary" : "bg-elevated",
        )}
      >
        <span
          className={cn(
            "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform",
            on ? "translate-x-5" : "translate-x-1",
          )}
        />
      </span>
      <span className="text-small font-medium text-text-secondary">{label}</span>
    </button>
  );
}

function ConvictionStatus({ value }: { value: number }) {
  if (value <= 50)
    return (
      <span className="text-text-secondary">
        <span className="font-semibold text-primary">Loose</span> — every rank-stack
        signal pings you. Expect ~10/hour.
      </span>
    );
  if (value <= 70)
    return (
      <span className="text-text-secondary">
        <span className="font-semibold text-text-primary">Balanced</span> — only
        3+ topic stacks and strong cluster moves alert.
      </span>
    );
  if (value <= 85)
    return (
      <span className="text-text-secondary">
        <span className="font-semibold text-warning">Tight</span> — only the top
        ~10% of signals reach you.
      </span>
    );
  return (
    <span className="text-text-secondary">
      <span className="font-semibold text-loss">Elite-only</span> — TG will be very
      quiet. Maybe 1 signal/day.
    </span>
  );
}

function SaveToast({
  at,
  pending,
  error,
}: {
  at: number | null;
  pending: boolean;
  error: boolean;
}) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!at) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 1800);
    return () => clearTimeout(t);
  }, [at]);
  if (pending) {
    return (
      <div className="fixed bottom-6 right-6 inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-small text-text-secondary shadow-lg">
        Saving…
      </div>
    );
  }
  if (error) {
    return (
      <div className="fixed bottom-6 right-6 inline-flex items-center gap-2 rounded-md border border-loss/40 bg-loss/10 px-3 py-2 text-small text-loss shadow-lg">
        <Warning size={14} weight="fill" />
        Save failed.
      </div>
    );
  }
  if (!show) return null;
  return (
    <div className="fixed bottom-6 right-6 inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-small text-primary shadow-lg">
      <CheckCircle size={14} weight="fill" />
      Saved
    </div>
  );
}
