import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-base">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <Link
              href="/"
              className="text-h3 font-semibold tracking-tight text-text-primary"
            >
              Coven
            </Link>
            <p className="mt-1 text-[11px] text-text-muted">
              On-chain alpha, detected and acted on in real time.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-small text-text-secondary">
            <Link href="/dashboard" className="hover:text-text-primary">
              Dashboard
            </Link>
            <Link href="/signals" className="hover:text-text-primary">
              Signals
            </Link>
            <Link href="/bots" className="hover:text-text-primary">
              Bots
            </Link>
            <Link href="/sign-in" className="hover:text-text-primary">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-[12px] font-semibold text-[#0b0e14] hover:bg-primary-hover"
            >
              Get started
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-border/60 pt-5 text-[11px] text-text-muted md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} Coven. Paper-trade first.</span>
          <span>Built for traders who watch wallets.</span>
        </div>
      </div>
    </footer>
  );
}
