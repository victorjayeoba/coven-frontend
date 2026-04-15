import Link from "next/link";
import {
  ArrowRight,
  ChartLineUp,
  Lightning,
  Robot,
  ShareNetwork,
} from "@phosphor-icons/react/dist/ssr";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-base text-text-primary">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-base/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-base">
              <Lightning size={14} weight="fill" />
            </span>
            <span className="font-display text-h3 font-semibold">Coven</span>
          </Link>

          <nav className="hidden items-center gap-6 text-small text-text-secondary md:flex">
            <a href="#features" className="hover:text-text-primary">Features</a>
            <a href="#how" className="hover:text-text-primary">How it works</a>
            <Link href="/dashboard" className="hover:text-text-primary">Dashboard</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="inline-flex h-8 items-center rounded-md border border-border bg-surface px-3 text-small font-medium text-text-primary transition-colors hover:border-border-strong hover:bg-elevated"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-small font-semibold text-base transition-colors hover:bg-primary-hover"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(60,196,123,0.12),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-16 text-center md:pt-28 md:pb-24">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary-faint px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Live signals from on-chain smart money
          </span>

          <h1 className="font-display mx-auto mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            See the <span className="italic text-primary">circle</span> move
            <br />before the spell is cast.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-body text-text-secondary md:text-lg">
            Coven detects when smart-money clusters and high-alpha wallets pile
            into a token in real time. Get notified the moment a cabal moves —
            then copy or auto-execute the trade.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-small font-semibold text-base transition-colors hover:bg-primary-hover"
            >
              Get started — free
              <ArrowRight size={14} weight="bold" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-5 py-2.5 text-small font-medium text-text-primary transition-colors hover:border-border-strong hover:bg-elevated"
            >
              Explore live dashboard
            </Link>
          </div>

          <p className="mt-3 text-micro text-text-muted">
            No wallet required to look around. Sign up to copy-trade or run bots.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border bg-surface/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-6 py-8 md:grid-cols-4">
          <Stat label="Wallets tracked" value="100+" />
          <Stat label="Live cabals" value="3" />
          <Stat label="Signals fired (7d)" value="333" />
          <Stat label="Chains" value="SOL · BSC" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Built for traders who watch wallets.
          </h2>
          <p className="mt-3 text-text-secondary">
            Stop chasing tweets. Coven watches the chain itself — every swap,
            every cluster, every breakout.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <Feature
            icon={<ShareNetwork size={20} weight="duotone" />}
            title="Behavioral clusters"
            body="We graph wallets by who-trades-with-whom. When a cluster (cabal) moves into a token together, you get a signal — not a guess."
          />
          <Feature
            icon={<Lightning size={20} weight="duotone" />}
            title="Multi-source signals"
            body="Cluster pile-ins, alpha-wallet solo entries, and our new rank-stack algo (tokens climbing multiple AVE leaderboards at once)."
          />
          <Feature
            icon={<Robot size={20} weight="duotone" />}
            title="Auto-execute bots"
            body="Hook a copy bot to any wallet, or let a signal bot fire on conviction ≥ your threshold. Paper or live, take-profit and trailing stops included."
          />
          <Feature
            icon={<ChartLineUp size={20} weight="duotone" />}
            title="Live movers feed"
            body="Dexscreener-style table of what's pumping right now — Solana + BSC mixed, sorted by composite momentum, streamed live."
          />
          <Feature
            icon={<Lightning size={20} weight="duotone" />}
            title="Telegram alerts"
            body="Every signal above your conviction threshold lands in your DMs with one-tap Buy and View buttons. Mute when you need to sleep."
          />
          <Feature
            icon={<ShareNetwork size={20} weight="duotone" />}
            title="Phantom-style swaps"
            body="Built-in swap with native logos, percentage buttons, and bidirectional flips. SOL↔token or token↔SOL — Pump.fun, Raydium, PancakeSwap, all of it."
          />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-border bg-surface/30">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold md:text-4xl">
              Three steps.
            </h2>
          </div>
          <ol className="mt-12 grid gap-4 md:grid-cols-3">
            <Step
              n={1}
              title="We watch the chain"
              body="Helius + AVE WSS feed every swap from tracked wallets and trending tokens into our event bus, in real time."
            />
            <Step
              n={2}
              title="Cabals + ranks fire"
              body="When 2+ cluster wallets or a single alpha wallet hits a token — or a token climbs onto multiple leaderboards — we score and publish a signal."
            />
            <Step
              n={3}
              title="You act, or your bot does"
              body="Get a Telegram ping with a Buy button, or let your signal/copy bot auto-execute paper or live trades with TP/SL/trailing."
            />
          </ol>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="font-display text-3xl font-semibold md:text-5xl">
          Stop being the exit liquidity.
        </h2>
        <p className="mt-4 text-body text-text-secondary">
          The smart money is already on-chain. Coven shows you what they're
          doing — instantly.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-small font-semibold text-base transition-colors hover:bg-primary-hover"
          >
            Create your account
            <ArrowRight size={14} weight="bold" />
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-5 py-2.5 text-small font-medium text-text-primary transition-colors hover:border-border-strong hover:bg-elevated"
          >
            I already have one
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-micro text-text-muted">
          <span>© {new Date().getFullYear()} Coven. Paper-trade first.</span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-text-primary">Dashboard</Link>
            <Link href="/sign-in" className="hover:text-text-primary">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="num text-h2 font-semibold text-text-primary">{value}</div>
      <div className="text-micro uppercase tracking-wider text-text-muted">{label}</div>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface/60 p-5 transition-colors hover:border-border-strong hover:bg-surface">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-faint text-primary">
        {icon}
      </div>
      <h3 className="mt-3.5 text-body font-semibold text-text-primary">{title}</h3>
      <p className="mt-1.5 text-small text-text-secondary">{body}</p>
    </div>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: number;
  title: string;
  body: string;
}) {
  return (
    <li className="rounded-xl border border-border bg-base/40 p-5">
      <div className="num grid h-7 w-7 place-items-center rounded-full bg-primary-faint text-small font-semibold text-primary">
        {n}
      </div>
      <h3 className="mt-3 text-body font-semibold text-text-primary">{title}</h3>
      <p className="mt-1.5 text-small text-text-secondary">{body}</p>
    </li>
  );
}
