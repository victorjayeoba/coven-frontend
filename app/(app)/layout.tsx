// All authenticated pages depend on cookies + per-user data — they can never
// be safely prerendered. Force dynamic so Next stops trying.
export const dynamic = "force-dynamic";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { TokenDetailDrawer } from "@/components/drawer/TokenDetailDrawer";
import { StreamProvider } from "@/components/layout/StreamProvider";
import { PaletteRoot } from "@/components/search/PaletteRoot";
import { AuthGuard } from "@/components/layout/AuthGuard";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-base">
        <StreamProvider />
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="min-w-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[1600px] p-6">{children}</div>
          </main>
        </div>
        <TokenDetailDrawer />
        <PaletteRoot />
      </div>
    </AuthGuard>
  );
}
