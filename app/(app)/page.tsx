import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { SignalsTable } from "@/components/dashboard/SignalsTable";
import { CabalsList } from "@/components/dashboard/CabalsList";
import { PositionsList } from "@/components/dashboard/PositionsList";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-h1 font-semibold text-text-primary">Dashboard</h1>
        <p className="text-small text-text-secondary">
          Smart money clusters, real-time.
        </p>
      </div>

      <HeroBanner />

      {/* Primary: full-width signals table */}
      <SignalsTable />

      {/* Secondary rails below */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PositionsList />
        <CabalsList />
      </div>
    </div>
  );
}
