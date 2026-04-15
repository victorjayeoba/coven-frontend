import Link from "next/link";
import {
  ArrowRight,
  Eye,
  Lightning,
  Robot,
} from "@phosphor-icons/react/dist/ssr";
import { HeroBackground } from "@/components/landing/HeroBackground";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { DashboardSection } from "@/components/landing/DashboardSection";
import { ProofStrip } from "@/components/landing/ProofStrip";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { LandingHeader } from "@/components/landing/LandingHeader";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-base text-text-primary">
      {/* Top nav — auth-aware */}
      <LandingHeader />

      {/* Hero */}
      <section className="relative h-screen min-h-[680px] w-full overflow-hidden">
        {/* GPU background — animated grid */}
        <HeroBackground />

        {/* Local darkening directly behind the headline only — keeps the grid
            visible everywhere else, just buys contrast for the text. */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_35%_at_50%_45%,rgba(11,14,20,0.85),transparent_70%)]" />

        {/* Helius-style ambient glow — soft green wash on the bottom-right edge */}
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[600px] w-[800px] rounded-full bg-primary/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-40 h-[500px] w-[700px] rounded-full bg-primary/10 blur-[140px]" />

        {/* Top + bottom edge fades into the page */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-base to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-base to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex h-full items-center justify-center px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-text-secondary backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              <span>Live on-chain signals</span>
              <span className="text-text-muted">·</span>
              <span>Solana + BSC</span>
            </span>

            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              Signals that
              <br />
              <span className="text-primary">trade themselves</span>.
            </h1>

            <p className="mx-auto mt-6 max-w-md text-body text-text-secondary">
              On-chain alpha, detected and acted on in real time.
            </p>

            {/* Premium feature row — Metamask / Solana style */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
              <FeaturePill icon={<Eye size={13} weight="fill" />} label="Track" />
              <Divider />
              <FeaturePill icon={<Lightning size={13} weight="fill" />} label="Copy" />
              <Divider />
              <FeaturePill icon={<Robot size={13} weight="fill" />} label="Auto-trade" />
            </div>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-small font-semibold text-base shadow-[0_0_40px_rgba(60,196,123,0.4)] transition-all hover:bg-primary-hover hover:shadow-[0_0_60px_rgba(60,196,123,0.5)]"
              >
                Get started — free
                <ArrowRight size={14} weight="bold" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-surface/60 px-6 py-3 text-small font-medium text-text-primary backdrop-blur transition-colors hover:border-border-strong hover:bg-elevated"
              >
                Explore live dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom edge — scroll hint */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-text-muted">
          scroll
        </div>
      </section>

      {/* Product feature blocks */}
      <FeatureSection />

      {/* Full dashboard preview */}
      <DashboardSection />

      {/* Proof — stats strip */}
      <ProofStrip />

      {/* Final CTA — bookend */}
      <FinalCTA />

      {/* Footer */}
      <Footer />
    </div>
  );
}

function FeaturePill({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface/50 px-3 py-1 text-small font-medium text-text-primary backdrop-blur">
      <span className="text-primary">{icon}</span>
      {label}
    </span>
  );
}

function Divider() {
  return <span className="h-px w-4 bg-border/60" />;
}
