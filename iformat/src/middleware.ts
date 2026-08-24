import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for authentication tokens in cookies
  const accessToken =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("iformat_access_token")?.value;

  // Protected paths that require authentication
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isCompanyDetailsRoute = pathname.startsWith("/company-details");
  const isAdminRoute = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");

  if (!accessToken && (isDashboardRoute || isCompanyDetailsRoute)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!accessToken && isAdminRoute) {
    const adminLoginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(adminLoginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/company-details/:path*",
    "/admin/:path*",
  ],
};
