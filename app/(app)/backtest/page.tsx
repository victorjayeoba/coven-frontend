import { PageHeader } from "@/components/layout/PageHeader";

export default function BacktestPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Backtest"
        subtitle="Historical proof — what Coven would have traded last week"
      />
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-text-muted">
        Headline metrics + per-trade breakdown with wins and losses
      </div>
    </div>
  );
}
