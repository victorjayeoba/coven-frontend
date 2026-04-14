import { PageHeader } from "@/components/layout/PageHeader";

export default function ClusterDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <PageHeader title={`Cabal #${params.id}`} subtitle="Member wallets, shared history, and recent signals" />
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-text-muted">
        Cluster members table + shared tokens + firing history
      </div>
    </div>
  );
}
