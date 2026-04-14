import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { TokenDetailDrawer } from "@/components/drawer/TokenDetailDrawer";
import { StreamProvider } from "@/components/layout/StreamProvider";
import { PaletteRoot } from "@/components/search/PaletteRoot";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}
