import { PageHeader } from "@/components/layout/PageHeader";

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Portfolio"
        subtitle="Active positions and closed trade history"
      />
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-text-muted">
        P&L summary + equity curve + positions table
      </div>
    </div>
  );
}
