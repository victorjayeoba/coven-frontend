"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMe } from "@/lib/hooks/useMe";

/**
 * Belt-and-suspenders auth gate. Middleware is the primary gate (reads the
 * first-party session cookie set by the proxy). This component only catches
 * the edge case where the cookie expired mid-session: the next /api/auth/me
 * returns null and we punt to /sign-in without a full refresh.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: me, isFetched } = useMe();

  useEffect(() => {
    if (!isFetched) return;
    if (!me) {
      const url = `/sign-in${pathname ? `?next=${encodeURIComponent(pathname)}` : ""}`;
      router.replace(url);
    }
  }, [isFetched, me, pathname, router]);

  // Render children immediately — don't block on the me check. Middleware
  // already validated the cookie server-side before this page rendered.
  // The useEffect above only kicks in if the cookie is somehow stale.
  return <>{children}</>;
}
