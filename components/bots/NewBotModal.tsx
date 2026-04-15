"use client";

import { useEffect, useState } from "react";
import {
  X,
  Copy,
  Lightning,
  CaretDown,
  CaretRight,
  Sparkle,
  Check,
  ArrowRight,
  Robot,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import {
  Bot,
  BotType,
  Chain,
  DEFAULTS,
  SizeMode,
} from "@/lib/stores/useBotsStore";
import { useCreateBot } from "@/lib/hooks/useBots";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (bot: Bot) => void;
};

const CHAINS: { id: Chain; name: string; color: string }[] = [
  { id: "solana", name: "Solana", color: "#14f195" },
  { id: "bsc", name: "BNB Smart Chain", color: "#f0b90b" },
];

export function NewBotModal({ open, onClose, onCreated }: Props) {
  const createBot = useCreateBot();

  const [type, setType] = useState<BotType>("copy");
  const [step, setStep] = useState<"type" | "config">("type");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [name, setName] = useState("");
  const [chain, setChain] = useState<Chain>("solana");

  // Entry
  const [sizeUsd, setSizeUsd] = useState(DEFAULTS.sizeUsd);
  const [sizeMode, setSizeMode] = useState<SizeMode>(DEFAULTS.sizeMode);
  const [multiplier, setMultiplier] = useState(DEFAULTS.multiplier);
  const [percentOfTarget, setPercentOfTarget] = useState(
    DEFAULTS.percentOfTarget,
  );

  // Copy
  const [targetWallet, setTargetWallet] = useState("");
  const [targetLabel, setTargetLabel] = useState("");
  const [copyExits, setCopyExits] = useState(DEFAULTS.copyExits);

  // Signal
  const [minConviction, setMinConviction] = useState(DEFAULTS.minConviction);
  const [clusterFilter, setClusterFilter] = useState("");

  // Exit
  const [takeProfitPct, setTakeProfitPct] = useState(DEFAULTS.takeProfitPct);
  const [stopLossPct, setStopLossPct] = useState(DEFAULTS.stopLossPct);
  const [trailingStopPct, setTrailingStopPct] = useState(
    DEFAULTS.trailingStopPct,
  );

  // Advanced
  const [maxSlippagePct, setMaxSlippagePct] = useState(DEFAULTS.maxSlippagePct);
  const [maxConcurrent, setMaxConcurrent] = useState(DEFAULTS.maxConcurrent);
  const [dailyLossLimitUsd, setDailyLossLimitUsd] = useState(
    DEFAULTS.dailyLossLimitUsd,
  );
  const [minLiquidityUsd, setMinLiquidityUsd] = useState(
    DEFAULTS.minLiquidityUsd,
  );
  const [cooldownMin, setCooldownMin] = useState(DEFAULTS.cooldownMin);
  const [antiRug, setAntiRug] = useState(DEFAULTS.antiRug);

  useEffect(() => {
    if (!open) {
      setStep("type");
      setType("copy");
      setShowAdvanced(false);
      setName("");
      setChain("solana");
      setSizeUsd(DEFAULTS.sizeUsd);
      setSizeMode(DEFAULTS.sizeMode);
      setMultiplier(DEFAULTS.multiplier);
      setPercentOfTarget(DEFAULTS.percentOfTarget);
      setTargetWallet("");
      setTargetLabel("");
      setCopyExits(DEFAULTS.copyExits);
      setMinConviction(DEFAULTS.minConviction);
      setClusterFilter("");
      setTakeProfitPct(DEFAULTS.takeProfitPct);
      setStopLossPct(DEFAULTS.stopLossPct);
      setTrailingStopPct(DEFAULTS.trailingStopPct);
      setMaxSlippagePct(DEFAULTS.maxSlippagePct);
      setMaxConcurrent(DEFAULTS.maxConcurrent);
      setDailyLossLimitUsd(DEFAULTS.dailyLossLimitUsd);
      setMinLiquidityUsd(DEFAULTS.minLiquidityUsd);
      setCooldownMin(DEFAULTS.cooldownMin);
      setAntiRug(DEFAULTS.antiRug);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const canSubmit =
    name.trim().length > 0 &&
    sizeUsd > 0 &&
    (type === "signal" || targetWallet.trim().length > 0);

  const handleCreate = async () => {
    if (!canSubmit || createBot.isPending) return;
    try {
      const bot = await createBot.mutateAsync({
        name: name.trim(),
        type,
        chain,
        sizeUsd,
        sizeMode,
        multiplier,
        percentOfTarget,
        targetWallet: targetWallet.trim(),
        targetLabel: targetLabel.trim(),
        copyExits,
        minConviction,
        clusterFilter: clusterFilter.trim(),
        takeProfitPct,
        stopLossPct,
        trailingStopPct,
        maxSlippagePct,
        maxConcurrent,
        dailyLossLimitUsd,
        minLiquidityUsd,
        cooldownMin,
        antiRug,
      } as any);
      onCreated?.(bot as Bot);
      onClose();
    } catch (err: any) {
      alert(
        `Failed to create bot: ${err?.response?.data?.detail || err?.message || "Unknown error"}`,
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative my-8 w-full max-w-xl overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative glow on type step */}
        {step === "type" && (
          <>
            <div className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-0 h-56 w-56 rounded-full bg-info/10 blur-3xl" />
          </>
        )}

        {/* Header */}
        <div className="relative flex items-start justify-between border-b border-border px-6 pb-4 pt-5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg border border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5">
              <Robot size={18} weight="fill" className="text-primary" />
            </div>
            <div>
              <h2 className="font-display text-[22px] leading-tight text-text-primary">
                {step === "type" ? "New Bot" : "Configure Bot"}
              </h2>
              <p className="mt-0.5 text-small text-text-secondary">
                {step === "type"
                  ? "Pick a strategy — you can change parameters later."
                  : "Keep defaults or tweak the basics — advanced is optional."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-text-muted transition-colors hover:bg-elevated hover:text-text-primary"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step dots */}
        <div className="relative flex items-center gap-2 px-6 pt-4">
          <StepDot active={step === "type"} done={step === "config"} label="Strategy" />
          <div className="h-px flex-1 bg-border" />
          <StepDot active={step === "config"} label="Configure" />
        </div>

        {step === "type" ? (
          <div className="relative grid grid-cols-1 gap-3 px-6 pb-6 pt-5 sm:grid-cols-2">
            <TypePick
              active={type === "copy"}
              onClick={() => setType("copy")}
              icon={<Copy size={20} weight="fill" />}
              title="Copy Trade"
              desc="Mirror trades from a wallet you pick."
              accent="info"
              features={["1:1 entries", "Optional exits", "Size multipliers"]}
            />
            <TypePick
              active={type === "signal"}
              onClick={() => setType("signal")}
              icon={<Lightning size={20} weight="fill" />}
              title="Signal Trigger"
              desc="Auto-enter on high-conviction signals."
              accent="warning"
              features={["Conviction threshold", "Cluster filter", "Anti-rug gates"]}
            />
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={() => setStep("config")}
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-body font-semibold text-base shadow-[0_8px_24px_rgba(60,196,123,0.3)] transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
              >
                Continue
                <ArrowRight
                  size={14}
                  weight="bold"
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </div>
          </div>
        ) : (
          <div className="px-5 pb-5 pt-3">
            {/* Name + Chain */}
            <Field label="Bot name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  type === "copy" ? "e.g. Cielo Whale Copy" : "e.g. Signal Sniper"
                }
                className={inputCls}
              />
            </Field>

            <Field label="Network">
              <div className="grid grid-cols-2 gap-2">
                {CHAINS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setChain(c.id)}
                    className={cn(
                      "flex h-10 items-center justify-center gap-2 rounded-md border text-small font-medium transition-colors",
                      chain === c.id
                        ? "border-primary/50 bg-primary-faint text-text-primary"
                        : "border-border bg-input text-text-secondary hover:text-text-primary",
                    )}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: c.color }}
                    />
                    {c.name}
                  </button>
                ))}
              </div>
            </Field>

            {/* Type-specific trigger */}
            {type === "copy" ? (
              <>
                <Field label="Target wallet address">
                  <input
                    value={targetWallet}
                    onChange={(e) => setTargetWallet(e.target.value)}
                    placeholder="Solana / BSC address"
                    className={cn(inputCls, "num")}
                  />
                </Field>
                <Field label="Label (optional)">
                  <input
                    value={targetLabel}
                    onChange={(e) => setTargetLabel(e.target.value)}
                    placeholder="e.g. Ansem"
                    className={inputCls}
                  />
                </Field>
              </>
            ) : (
              <Field
                label="Minimum conviction"
                hint={`${minConviction} and above will trigger entries`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={minConviction}
                    onChange={(e) => setMinConviction(Number(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="num w-12 text-right text-body font-semibold text-text-primary">
                    {minConviction}
                  </span>
                </div>
              </Field>
            )}

            {/* Entry sizing */}
            {type === "copy" && (
              <Field label="Sizing mode">
                <div className="grid grid-cols-3 gap-1 rounded-md border border-border bg-input p-1">
                  {(
                    [
                      { id: "fixed", label: "Fixed USD" },
                      { id: "multiplier", label: "Multiplier" },
                      { id: "percent", label: "% of target" },
                    ] as { id: SizeMode; label: string }[]
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSizeMode(m.id)}
                      className={cn(
                        "h-7 rounded text-small font-medium transition-colors",
                        sizeMode === m.id
                          ? "bg-primary text-base"
                          : "text-text-secondary hover:text-text-primary",
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </Field>
            )}

            {(type === "signal" || sizeMode === "fixed") && (
              <Field label="Buy size (USD)">
                <NumInput value={sizeUsd} onChange={setSizeUsd} prefix="$" />
              </Field>
            )}
            {type === "copy" && sizeMode === "multiplier" && (
              <Field
                label="Multiplier"
                hint="1× matches their size; 0.5× = half; 2× = double"
              >
                <NumInput value={multiplier} onChange={setMultiplier} suffix="×" step={0.1} />
              </Field>
            )}
            {type === "copy" && sizeMode === "percent" && (
              <Field label="% of target size">
                <NumInput
                  value={percentOfTarget}
                  onChange={setPercentOfTarget}
                  suffix="%"
                />
              </Field>
            )}

            {/* Exits */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Field label="Take profit">
                <NumInput
                  value={takeProfitPct}
                  onChange={setTakeProfitPct}
                  suffix="%"
                />
              </Field>
              <Field label="Stop loss">
                <NumInput
                  value={stopLossPct}
                  onChange={setStopLossPct}
                  suffix="%"
                />
              </Field>
            </div>

            {type === "copy" && (
              <Toggle
                label="Copy target's sells"
                hint="Exit when the copied wallet exits"
                value={copyExits}
                onChange={setCopyExits}
              />
            )}

            {/* Additional config */}
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="mt-4 flex w-full items-center justify-between rounded-md border border-border bg-input px-3 py-2 text-small text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
            >
              <span className="inline-flex items-center gap-1.5">
                <Sparkle size={12} />
                Additional Config
                <span className="text-micro text-text-muted">
                  — safe defaults applied
                </span>
              </span>
              {showAdvanced ? (
                <CaretDown size={12} />
              ) : (
                <CaretRight size={12} />
              )}
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3 rounded-md border border-border bg-input/40 p-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Max slippage" dense>
                    <NumInput
                      value={maxSlippagePct}
                      onChange={setMaxSlippagePct}
                      suffix="%"
                    />
                  </Field>
                  <Field label="Trailing stop (0 = off)" dense>
                    <NumInput
                      value={trailingStopPct}
                      onChange={setTrailingStopPct}
                      suffix="%"
                    />
                  </Field>
                  <Field label="Max concurrent positions" dense>
                    <NumInput
                      value={maxConcurrent}
                      onChange={setMaxConcurrent}
                    />
                  </Field>
                  <Field label="Daily loss limit" dense>
                    <NumInput
                      value={dailyLossLimitUsd}
                      onChange={setDailyLossLimitUsd}
                      prefix="$"
                    />
                  </Field>
                  <Field label="Min liquidity" dense>
                    <NumInput
                      value={minLiquidityUsd}
                      onChange={setMinLiquidityUsd}
                      prefix="$"
                    />
                  </Field>
                  <Field label="Cooldown per token" dense>
                    <NumInput
                      value={cooldownMin}
                      onChange={setCooldownMin}
                      suffix="min"
                    />
                  </Field>
                </div>

                {type === "signal" && (
                  <Field label="Cluster filter (optional)" dense>
                    <input
                      value={clusterFilter}
                      onChange={(e) => setClusterFilter(e.target.value)}
                      placeholder="Cluster id / name — blank = any"
                      className={inputCls}
                    />
                  </Field>
                )}

                <Toggle
                  label="Anti-rug gates"
                  hint="Require LP lock and top-holder checks before buying"
                  value={antiRug}
                  onChange={setAntiRug}
                />
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep("type")}
                className="h-10 rounded-md border border-border bg-surface px-4 text-small font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!canSubmit || createBot.isPending}
                onClick={handleCreate}
                className="h-10 flex-1 rounded-md bg-primary text-body font-semibold text-base transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                {createBot.isPending ? "Creating…" : "Create Bot"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------- helpers -------------------- */

const inputCls =
  "h-9 w-full rounded-md border border-border bg-input px-3 text-body text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25";

function Field({
  label,
  hint,
  children,
  dense,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  dense?: boolean;
}) {
  return (
    <div className={dense ? "" : "mt-3 first:mt-0"}>
      <label className="text-small font-medium text-text-secondary">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-micro text-text-muted">{hint}</p>}
    </div>
  );
}

function NumInput({
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
}: {
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-body text-text-muted">
          {prefix}
        </span>
      )}
      <input
        type="number"
        inputMode="decimal"
        step={step}
        min={0}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          inputCls,
          "num",
          prefix && "pl-7",
          suffix && "pr-10",
        )}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-small text-text-muted">
          {suffix}
        </span>
      )}
    </div>
  );
}

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="mt-3 flex w-full items-center justify-between rounded-md border border-border bg-input px-3 py-2 text-left"
    >
      <div>
        <div className="text-small font-medium text-text-primary">{label}</div>
        {hint && <div className="text-micro text-text-muted">{hint}</div>}
      </div>
      <span
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors",
          value ? "bg-primary" : "bg-elevated",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
            value ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}

function TypePick({
  active,
  onClick,
  icon,
  title,
  desc,
  accent,
  features,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
  accent: "info" | "warning";
  features?: string[];
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-start gap-3 overflow-hidden rounded-lg border p-4 text-left transition-all",
        active
          ? "border-primary/60 bg-gradient-to-br from-primary-faint to-primary-faint/30 shadow-[0_0_0_1px_rgba(60,196,123,0.25),0_8px_24px_rgba(60,196,123,0.15)]"
          : "border-border bg-input hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]",
      )}
    >
      {/* Active check */}
      {active && (
        <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-primary text-base">
          <Check size={12} weight="bold" />
        </span>
      )}

      <span
        className={cn(
          "grid h-10 w-10 place-items-center rounded-lg transition-transform group-hover:scale-105",
          accent === "info"
            ? "bg-gradient-to-br from-info/20 to-info/5 text-info"
            : "bg-gradient-to-br from-warning/20 to-warning/5 text-warning",
        )}
      >
        {icon}
      </span>
      <div>
        <div className="text-body font-semibold text-text-primary">{title}</div>
        <div className="mt-0.5 text-small text-text-secondary">{desc}</div>
      </div>
      {features && features.length > 0 && (
        <ul className="mt-1 space-y-1">
          {features.map((f) => (
            <li
              key={f}
              className="flex items-center gap-1.5 text-micro text-text-muted"
            >
              <span
                className={cn(
                  "h-1 w-1 rounded-full",
                  active ? "bg-primary" : "bg-text-muted",
                )}
              />
              {f}
            </li>
          ))}
        </ul>
      )}
    </button>
  );
}

function StepDot({
  active,
  done,
  label,
}: {
  active: boolean;
  done?: boolean;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold transition-colors",
          active
            ? "bg-primary text-base"
            : done
              ? "bg-primary/20 text-primary"
              : "bg-elevated text-text-muted",
        )}
      >
        {done ? <Check size={10} weight="bold" /> : null}
      </span>
      <span
        className={cn(
          "text-[10px] font-semibold uppercase tracking-wider",
          active
            ? "text-text-primary"
            : done
              ? "text-primary"
              : "text-text-muted",
        )}
      >
        {label}
      </span>
    </div>
  );
}
