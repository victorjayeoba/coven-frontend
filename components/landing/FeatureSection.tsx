import {
  ArrowRight,
  Lightning,
  Robot,
  PaperPlaneTilt,
} from "@phosphor-icons/react/dist/ssr";
import { SignalCardMock } from "@/components/landing/mocks/SignalCardMock";
import { CopyBotMock } from "@/components/landing/mocks/CopyBotMock";
import { TelegramMock } from "@/components/landing/mocks/TelegramMock";

export function FeatureSection() {
  return (
    <section className="relative border-t border-border/60 bg-base">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            How it works
          </span>
          <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Three layers,
            <br />
            <span className="text-text-secondary">one feed.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-body text-text-secondary">
            Detect what alpha is doing. Mirror it. Or let a bot pull the trigger
            for you. Pick your involvement level.
          </p>
        </div>

        {/* Feature 1 — Signals */}
        <FeatureRow
          eyebrow="Signals"
          icon={<Lightning size={14} weight="fill" />}
          title="Every cluster move, the second it happens."
          body="We graph wallets by who-trades-with-whom. When two or more cluster wallets pile into the same token within minutes, you get a high-conviction signal. Alpha-wallet solos and rank-stack breakouts feed the same stream."
          visual={<SignalCardMock />}
        />

        {/* Feature 2 — Copy bots */}
        <FeatureRow
          eyebrow="Copy bots"
          icon={<Robot size={14} weight="fill" />}
          title="Mirror any wallet, automatically."
          body="Point a copy bot at any address. Every swap they make, you make — same token, same chain, with your size rules. Stop loss, take profit and trailing exits built in."
          visual={<CopyBotMock />}
          reverse
        />

        {/* Feature 3 — Telegram */}
        <FeatureRow
          eyebrow="Telegram alerts"
          icon={<PaperPlaneTilt size={14} weight="fill" />}
          title="Signals land in your DM with one tap to buy."
          body="Set your conviction threshold once. Every signal above it pings your phone with the token, the cluster, and a Buy button wired to your paper or live wallet. Mute when you sleep."
          visual={<TelegramMock />}
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

function FeatureRow({
  eyebrow,
  icon,
  title,
  body,
  visual,
  reverse,
}: {
  eyebrow: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  visual: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <div
      className={`mt-20 grid items-center gap-12 md:mt-32 md:grid-cols-2 md:gap-16 ${
        reverse ? "md:[&>*:first-child]:order-2" : ""
      }`}
    >
      <div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
          <span className="text-primary">{icon}</span>
          {eyebrow}
        </span>
        <h3 className="mt-4 text-3xl font-semibold leading-[1.15] tracking-tight md:text-4xl">
          {title}
        </h3>
        <p className="mt-4 max-w-md text-body text-text-secondary">{body}</p>
        <div className="mt-5 inline-flex items-center gap-1.5 text-small font-medium text-primary">
          Learn more <ArrowRight size={12} weight="bold" />
        </div>
      </div>
      <div className="relative">{visual}</div>
    </div>
  );
}
