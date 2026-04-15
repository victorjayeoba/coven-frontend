import { NextRequest, NextResponse } from "next/server";

// Pages the user should NOT see when already signed in — redirect them to
// the dashboard so they don't re-auth. Everything else is public.
const AUTH_ROUTES = ["/sign-in", "/sign-up"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("coven_session")?.value;

  if (token && AUTH_ROUTES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // All other pages (landing /, /dashboard, /signals, /tokens, etc.) are
  // publicly viewable. Auth-gated actions are enforced by the backend.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
