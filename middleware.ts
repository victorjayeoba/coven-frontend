import { NextResponse } from "next/server";

// Auth gating runs client-side via the AuthGuard component (see
// app/(app)/layout.tsx). Cookies are set on the backend domain — Next
// middleware running on the frontend host literally can't see them.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
