"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  SquaresFour,
  Lightning,
  ShareNetwork,
  ClockCounterClockwise,
  Coins,
  SlidersHorizontal,
  MagnifyingGlass,
  CaretLeft,
  Sparkle,
  Question,
  SignOut,
  List,
} from "@phosphor-icons/react";
import { useUIStore } from "@/lib/stores/useUIStore";
import { logout } from "@/lib/api/auth";
import { cn } from "@/lib/cn";

const MAIN = [
  { href: "/", label: "Dashboard", icon: SquaresFour },
  { href: "/signals", label: "Signals", icon: Lightning },
  { href: "/graph", label: "Wallet Graph", icon: ShareNetwork },
  { href: "/backtest", label: "Backtest", icon: ClockCounterClockwise },
];

const SECONDARY = [
  { href: "/portfolio", label: "Portfolio", icon: Coins },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const collapsed = sidebarCollapsed;

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => router.push("/sign-in"),
  });

  const renderItem = (
    item: { href: string; label: string; icon: any },
    size: "md" | "sm" = "md",
  ) => {
    const active =
      item.href === "/"
        ? pathname === "/"
        : pathname.startsWith(item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "group flex items-center gap-3 rounded-md px-2 transition-colors",
          size === "md" ? "h-9 text-body" : "h-8 text-small",
          active
            ? "bg-primary-faint text-primary"
            : "text-text-secondary hover:bg-elevated hover:text-text-primary",
          collapsed && "justify-center px-0",
        )}
        title={collapsed ? item.label : undefined}
      >
        <Icon size={18} weight={active ? "fill" : "regular"} />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "flex h-screen shrink-0 flex-col border-r border-border bg-sidebar transition-[width]",
        collapsed ? "w-14" : "w-56",
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-border",
          collapsed ? "justify-center px-0" : "px-4",
        )}
      >
        {collapsed ? (
          <span className="font-display text-[22px] italic leading-none text-text-primary">
            c
          </span>
        ) : (
          <div className="inline-flex items-baseline gap-1.5">
            <span className="font-display text-[24px] italic leading-none text-text-primary">
              coven
            </span>
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
          </div>
        )}
      </div>

      {/* Search bar */}
      <div className={cn("px-3 pt-3", collapsed && "px-2")}>
        {collapsed ? (
          <button
            type="button"
            className="grid h-9 w-full place-items-center rounded-md border border-border bg-surface text-text-secondary hover:bg-elevated hover:text-text-primary"
            title="Search"
          >
            <MagnifyingGlass size={16} />
          </button>
        ) : (
          <button
            type="button"
            className="flex h-9 w-full items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-small text-text-muted transition-colors hover:border-border-strong hover:bg-elevated hover:text-text-secondary"
          >
            <MagnifyingGlass size={14} />
            <span className="flex-1 text-left">Search</span>
            <kbd className="inline-flex items-center rounded border border-border bg-elevated px-1.5 py-0.5 text-[10px] font-medium leading-none">
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      {/* Main nav */}
      <nav className="mt-4 space-y-0.5 px-2">
        {MAIN.map((item) => renderItem(item))}
      </nav>

      {/* Divider */}
      <div className="my-3 mx-3 border-t border-border" />

      {/* Secondary */}
      <nav className="space-y-0.5 px-2">
        {SECONDARY.map((item) => renderItem(item))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="border-t border-border p-2">
        {renderItem({ href: "/settings", label: "Settings", icon: SlidersHorizontal }, "sm")}
        {!collapsed && (
          <button
            type="button"
            className="flex h-8 w-full items-center gap-3 rounded-md px-2 text-small text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary"
          >
            <Sparkle size={16} />
            <span>What's New</span>
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
          </button>
        )}
        {!collapsed && (
          <button
            type="button"
            className="flex h-8 w-full items-center gap-3 rounded-md px-2 text-small text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary"
          >
            <Question size={16} />
            <span>Help</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => logoutMutation.mutate()}
          className={cn(
            "flex h-8 w-full items-center gap-3 rounded-md px-2 text-small text-text-secondary transition-colors hover:bg-elevated hover:text-loss",
            collapsed && "justify-center px-0",
          )}
          title={collapsed ? "Sign out" : undefined}
        >
          <SignOut size={16} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={toggleSidebar}
        className={cn(
          "flex h-9 items-center gap-2 border-t border-border text-small text-text-muted transition-colors hover:bg-elevated hover:text-text-secondary",
          collapsed ? "justify-center px-0" : "px-4",
        )}
        title={collapsed ? "Expand menu" : "Collapse menu"}
      >
        {collapsed ? <List size={16} /> : <CaretLeft size={14} />}
        {!collapsed && <span>Collapse menu</span>}
      </button>
    </aside>
  );
}
