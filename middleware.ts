import { NextRequest, NextResponse } from "next/server";

// Pages anyone can hit without a session.
const PUBLIC_PATHS = ["/", "/sign-in", "/sign-up"];

// Auth pages — bounce already-signed-in users back to the dashboard.
const AUTH_ROUTES = ["/sign-in", "/sign-up"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("coven_session")?.value;

  if (token && AUTH_ROUTES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Landing + auth screens are always reachable.
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || (p !== "/" && pathname.startsWith(p)),
  );
  if (isPublic) return NextResponse.next();

  // Everything else (dashboard + internal routes) requires a session — the
  // backend endpoints are auth-only, so anonymous users would just see a
  // half-broken UI. Send them to sign-in with a return URL.
  if (!token) {
    const url = new URL("/sign-in", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
