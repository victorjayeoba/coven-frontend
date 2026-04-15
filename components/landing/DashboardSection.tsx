import { ArrowRight, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { DashboardMock } from "@/components/landing/mocks/DashboardMock";

const POINTS = [
  "Live movers across Solana + BSC, ranked by composite momentum",
  "Open positions, P&L, and bot activity in one feed",
  "Drill into any token for the full chart, holders, and signal history",
  "Stream-fed prices — no refresh, no stale numbers",
];

export function DashboardSection() {
  return (
    <section className="relative border-t border-border/60 bg-base">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="grid items-center gap-12 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-16">
          {/* Left: copy */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
              <span className="text-primary">·</span> The dashboard
            </span>
            <h2 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              The whole chain,
              <br />
              <span className="text-text-secondary">in one screen.</span>
            </h2>
            <p className="mt-5 max-w-md text-body text-text-secondary">
              Every alpha wallet, every cluster, every breakout — sorted, scored,
              and streaming. Built for traders who don&apos;t want to keep ten tabs open.
            </p>

            <ul className="mt-6 space-y-2.5">
              {POINTS.map((p) => (
                <li key={p} className="flex items-start gap-2 text-small text-text-secondary">
                  <CheckCircle
                    size={16}
                    weight="fill"
                    className="mt-0.5 shrink-0 text-primary"
                  />
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            <a
              href="/dashboard"
              className="mt-7 inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2.5 text-small font-medium text-text-primary transition-colors hover:border-border-strong hover:bg-elevated"
            >
              Open the dashboard
              <ArrowRight size={12} weight="bold" />
            </a>
          </div>

          {/* Right: full-bleed dashboard preview */}
          <div className="relative">
            <DashboardMock />
          </div>
        </div>
      </div>
    </section>
  );
}
