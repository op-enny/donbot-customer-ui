import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware to detect vertical (eat/market) and rewrite URLs to route groups:
 * 1. Subdomain (production): eat.sipariso.com, market.sipariso.com
 * 2. Query parameter (development): ?vertical=market
 * 3. Cookie (persisted preference)
 *
 * Routes are rewritten to:
 * - /eat/* for restaurant ordering
 * - /market/* for grocery shopping
 * - /shared/* for profile, favorites, etc.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  console.log(`[Middleware] pathname: ${pathname}, host: ${host}`);

  // Skip for static files, API routes, and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Already in correct route - don't rewrite
  if (
    pathname.startsWith("/eat") ||
    pathname.startsWith("/market") ||
    pathname.startsWith("/shared")
  ) {
    return NextResponse.next();
  }

  // Determine vertical from subdomain
  let vertical: "eat" | "market" = "eat"; // Default to eat

  if (host.startsWith("market.")) {
    vertical = "market";
  } else if (host.startsWith("eat.") || host.startsWith("yemek.")) {
    vertical = "eat";
  } else {
    // Development mode: Check query parameter (highest priority)
    const verticalParam = request.nextUrl.searchParams.get("vertical");
    if (verticalParam === "market") {
      vertical = "market";
    } else if (verticalParam === "eat") {
      vertical = "eat";
    } else {
      // Check existing cookie
      const cookieVertical = request.cookies.get("vertical")?.value;
      if (cookieVertical === "market") {
        vertical = "market";
      }
    }
  }

  // Shared routes - rewrite to /shared/...
  const sharedRoutes = ["/profile", "/favorites"];
  if (sharedRoutes.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = `/shared${pathname}`;
    const response = NextResponse.rewrite(url);
    response.headers.set("x-vertical", vertical);
    // Set cookie for client-side detection
    response.cookies.set("vertical", vertical, {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  }

  // Rewrite to vertical route group
  const url = request.nextUrl.clone();
  if (pathname === "/") {
    url.pathname = `/${vertical}`;
  } else {
    url.pathname = `/${vertical}${pathname}`;
  }

  console.log(`[Middleware] Rewriting ${pathname} to ${url.pathname}`);

  const response = NextResponse.rewrite(url);

  // Set cookie for client-side detection
  response.cookies.set("vertical", vertical, {
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g., robots.txt, images)
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};
