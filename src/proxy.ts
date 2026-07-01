import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

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
  async function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Detailed logs for auditing
    const debugAuth = process.env.DEBUG_AUTH === "true" || process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production";
    if (debugAuth) {
      console.log("[DEBUG AUTH MIDDLEWARE] --- START ---");
      console.log("[DEBUG AUTH MIDDLEWARE] path:", path);
      console.log("[DEBUG AUTH MIDDLEWARE] req.url:", req.url);
      console.log("[DEBUG AUTH MIDDLEWARE] req.nextUrl.protocol:", req.nextUrl.protocol);
      console.log("[DEBUG AUTH MIDDLEWARE] x-forwarded-proto:", req.headers.get("x-forwarded-proto"));
      console.log("[DEBUG AUTH MIDDLEWARE] NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
      console.log("[DEBUG AUTH MIDDLEWARE] VERCEL_URL:", process.env.VERCEL_URL);
      console.log("[DEBUG AUTH MIDDLEWARE] NEXTAUTH_SECRET defined:", !!process.env.NEXTAUTH_SECRET);
      
      const cookiesList = req.cookies.getAll().map(c => c.name);
      console.log("[DEBUG AUTH MIDDLEWARE] Cookies present:", cookiesList);
      console.log("[DEBUG AUTH MIDDLEWARE] req.nextauth.token:", token);
      
      // Attempt manual decodes to isolate the issue
      try {
        const tokenSecure = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie: true });
        console.log("[DEBUG AUTH MIDDLEWARE] manual getToken(secureCookie: true):", tokenSecure);
      } catch (err: any) {
        console.error("[DEBUG AUTH MIDDLEWARE] manual getToken(secureCookie: true) error:", err.message);
      }
      
      try {
        const tokenUnsecure = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie: false });
        console.log("[DEBUG AUTH MIDDLEWARE] manual getToken(secureCookie: false):", tokenUnsecure);
      } catch (err: any) {
        console.error("[DEBUG AUTH MIDDLEWARE] manual getToken(secureCookie: false) error:", err.message);
      }
      console.log("[DEBUG AUTH MIDDLEWARE] --- END ---");
    }

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
      if (debugAuth) {
        console.log("[DEBUG AUTH MIDDLEWARE] No token found, redirecting protected route", path, "to /login");
      }
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
    secret: process.env.NEXTAUTH_SECRET,
    cookies: {
      sessionToken: {
        name: process.env.VERCEL === "1" || process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      },
    },
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
