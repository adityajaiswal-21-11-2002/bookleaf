import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware - protects /author and /admin routes (except login)
 * Redirects unauthenticated users to appropriate login page
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  const isAuthorRoute = pathname.startsWith("/author");
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname.includes("/login");
  const isRegisterPage = pathname.includes("/register");

  if (isAuthorRoute && !isLoginPage && !isRegisterPage && !token) {
    return NextResponse.redirect(new URL("/author/login", request.url));
  }

  if (isAdminRoute && !isLoginPage && !token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/author/:path*", "/admin/:path*"],
};
