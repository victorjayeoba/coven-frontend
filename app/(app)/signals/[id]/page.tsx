import { PageHeader } from "@/components/layout/PageHeader";

export default function SignalDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <PageHeader title={`Signal ${params.id.slice(0, 8)}`} subtitle="Cluster entry, risk, and conviction breakdown" />
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-text-muted">
        Signal detail — wallets involved, risk report, conviction breakdown, P&L
      </div>
    </div>
  );
}
