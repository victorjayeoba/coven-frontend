import { PageHeader } from "@/components/layout/PageHeader";

export default function GraphPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Wallet Graph"
        subtitle="Smart money cabals and their connections across chains"
      />
      <div className="h-[600px] rounded-lg border border-dashed border-border text-center text-text-muted grid place-items-center">
        Force-directed wallet graph visualization
      </div>
    </div>
  );
}
