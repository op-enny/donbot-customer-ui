import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware to detect and set the vertical (eat/market) based on:
 * 1. Subdomain (production): eat.sipariso.com, market.sipariso.com
 * 2. Query parameter (development): ?vertical=market
 * 3. Cookie (persisted preference)
 *
 * The vertical is set as a cookie so client components can detect it.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // Skip for static files, API routes, and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
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
    // Development mode: Check query parameter
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

  // Set cookie for client-side detection
  const response = NextResponse.next();

  // Only set cookie if value changed
  const existingVertical = request.cookies.get("vertical")?.value;
  if (existingVertical !== vertical) {
    response.cookies.set("vertical", vertical, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

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
