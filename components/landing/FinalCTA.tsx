import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-t border-border/60 bg-base">
      {/* Soft ambient glow — mirrors the hero */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[300px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative mx-auto max-w-2xl px-6 py-16 text-center md:py-20">
        <h2 className="text-3xl font-semibold leading-[1.05] tracking-tight md:text-4xl">
          Stop being the{" "}
          <span className="text-primary">exit liquidity</span>.
        </h2>

        <p className="mx-auto mt-3 max-w-md text-small text-text-secondary">
          Smart money is already on-chain. See what they're doing, the second
          they do it.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-small font-semibold text-[#0b0e14] transition-colors hover:bg-primary-hover"
          >
            Get started — free
            <ArrowRight size={12} weight="bold" />
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface/60 px-5 py-2.5 text-small font-medium text-text-primary backdrop-blur transition-colors hover:border-border-strong hover:bg-elevated"
          >
            I already have an account
          </Link>
        </div>

        <p className="mt-3 text-[11px] text-text-muted">
          Paper-trade first · no wallet connection required.
        </p>
      </div>
    </section>
  );
}
