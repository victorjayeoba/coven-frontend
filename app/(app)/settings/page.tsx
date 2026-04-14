import { PageHeader } from "@/components/layout/PageHeader";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Trading preferences and account"
      />
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-text-muted">
        Conviction threshold · Max position · Chains · Auto-exit toggle
      </div>
    </div>
  );
}
