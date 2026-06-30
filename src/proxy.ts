import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
];

const STATIC_ROUTES = [
  "/_next",
  "/favicon.ico",
  "/images",
];

const EXCLUDED_API_ROUTES = [
  "/api/auth",
  "/api/v1/erp/sync", // HMAC protected
];

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    console.log("[TRACE proxy] Incoming Request:", {
      path,
      hasToken: !!token,
      role: token?.role,
      host: req.headers.get("host"),
      forwardedProto: req.headers.get("x-forwarded-proto"),
      cookies: req.headers.get("cookie") ? "present" : "missing"
    });

    // Check if it is a static or excluded route
    if (
      STATIC_ROUTES.some(r => path.startsWith(r)) ||
      EXCLUDED_API_ROUTES.some(r => path.startsWith(r)) ||
      path.match(/\.(.*)$/) // Exclude files with extensions like .png, .js, .svg
    ) {
      console.log("[TRACE proxy] Bypassing static/excluded route:", path);
      return NextResponse.next();
    }

    const isPublicRoute = PUBLIC_ROUTES.some(r => path.startsWith(r));

    // If NO session and accessing a protected route -> Redirect to /login
    if (!token && !isPublicRoute) {
      console.log("[TRACE proxy] No session & protected route. Redirecting to /login");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // If session exists and accessing a public route (like /login) -> Redirect to their dashboard
    if (token && (isPublicRoute || path === "/login")) {
      let redirectPath = "/";
      
      switch(token.role) {
        case "PLATFORM_ADMIN":
          redirectPath = "/";
          break;
        case "COMPANY_ADMIN":
          redirectPath = "/";
          break;
        case "QC":
          redirectPath = "/test-reports";
          break;
      }
      
      console.log("[TRACE proxy] Session exists & public route. Redirecting to:", redirectPath);
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }

    // If NO session and on `/` -> Redirect to /login
    if (!token && path === "/") {
      console.log("[TRACE proxy] No session & root path. Redirecting to /login");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    console.log("[TRACE proxy] Allowing request to proceed:", path);
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // We handle all authorization inside the middleware function above
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
