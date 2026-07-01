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
  "/api/v1", // REST API endpoints authenticated via custom tokens
];

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Check if it is a static or excluded route
    if (
      STATIC_ROUTES.some(r => path.startsWith(r)) ||
      EXCLUDED_API_ROUTES.some(r => path.startsWith(r)) ||
      path.match(/\.(.*)$/) // Exclude files with extensions like .png, .js, .svg
    ) {
      return NextResponse.next();
    }

    const isPublicRoute = PUBLIC_ROUTES.some(r => path.startsWith(r));

    // If NO session and accessing a protected route -> Redirect to /login
    if (!token && !isPublicRoute) {
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
      
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }

    // If NO session and on `/` -> Redirect to /login
    if (!token && path === "/") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

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
