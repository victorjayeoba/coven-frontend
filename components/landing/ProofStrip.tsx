import {
  Lightning,
  ShareNetwork,
  Stack,
  Wallet,
} from "@phosphor-icons/react/dist/ssr";
import { BacktestClusterMock } from "@/components/landing/mocks/BacktestClusterMock";

const STATS = [
  { icon: Wallet, value: "100+", label: "Smart wallets tracked" },
  { icon: ShareNetwork, value: "3", label: "Active cabals" },
  { icon: Lightning, value: "333", label: "Signals fired · 7 days" },
  { icon: Stack, value: "SOL · BSC", label: "Chains live" },
];

export function ProofStrip() {
  return (
    <section className="border-y border-border/60 bg-surface/30">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid items-center gap-12 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-16">
          {/* Left — animated backtest ↔ cluster preview */}
          <div className="relative">
            <BacktestClusterMock />
          </div>

          {/* Right — copy + stats */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
              <span className="text-primary">·</span> Proof
            </span>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
              Receipts, not vibes.
            </h2>
            <p className="mt-4 max-w-md text-body text-text-secondary">
              Every signal we publish gets backtested against the next 7 days of
              price action. Cabals are scored on collective P&L. The numbers
              update live.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary-faint text-primary">
                    <Icon size={16} weight="fill" />
                  </span>
                  <div>
                    <div className="num text-h2 font-semibold leading-none text-text-primary">
                      {value}
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-wider text-text-muted">
                      {label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
