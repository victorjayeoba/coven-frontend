"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMe } from "@/lib/hooks/useMe";

/**
 * Client-side auth gate for the (app) layout. The Next middleware can't
 * read the backend's cross-domain cookie, so we check the session here:
 * GET /api/auth/me — if it returns null we punt to /sign-in?next=<here>.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: me, isLoading, isFetched } = useMe();

  useEffect(() => {
    if (!isFetched) return;
    if (!me) {
      const url = new URL("/sign-in", window.location.origin);
      if (pathname && pathname !== "/sign-in") url.searchParams.set("next", pathname);
      router.replace(url.pathname + url.search);
    }
  }, [isFetched, me, pathname, router]);

  if (isLoading || (isFetched && !me)) {
    // Avoid flashing the protected UI while we check / redirect.
    return (
      <div className="grid h-screen place-items-center bg-base text-small text-text-muted">
        Checking session…
      </div>
    );
  }

  return <>{children}</>;
}
