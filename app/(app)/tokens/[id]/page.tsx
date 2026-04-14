import { PageHeader } from "@/components/layout/PageHeader";

export default function TokenDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <PageHeader title={`Token ${params.id}`} subtitle="Price chart, risk report, and signals on this token" />
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-text-muted">
        Token chart + risk breakdown + related signals
      </div>
    </div>
  );
}
