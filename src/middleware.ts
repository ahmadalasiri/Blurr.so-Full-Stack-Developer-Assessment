import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

// Define routes that require authentication
const protectedRoutes = ["/dashboard", "/dashboard/:path*", "/profile", "/settings"];

// Define routes that should redirect authenticated users
const authRoutes = ["/login", "/register"];

// Define admin-only routes
const adminRoutes = ["/dashboard/admin", "/dashboard/admin/:path*"];

// Define manager-only routes
const managerRoutes = ["/dashboard/reports"];

export default async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route.replace(":path*", "")));

  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.includes(pathname);

  // Check if the current route is admin-only
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route.replace(":path*", "")));

  // Check if the current route is manager-only
  const isManagerRoute = managerRoutes.some((route) => pathname.startsWith(route.replace(":path*", "")));

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !session?.user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users from auth routes
  if (isAuthRoute && session?.user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Check admin access
  if (isAdminRoute && session?.user) {
    if (session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Check manager access
  if (isManagerRoute && session?.user) {
    if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
