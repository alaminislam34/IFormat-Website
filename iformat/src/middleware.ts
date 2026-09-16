import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for authentication tokens in cookies (access token or 7-day refresh token)
  const sessionToken =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("iformat_access_token")?.value ||
    request.cookies.get("refreshToken")?.value ||
    request.cookies.get("iformat_refresh_token")?.value;

  const userRole = (request.cookies.get("userRole")?.value || "").toLowerCase();

  // Protected route definitions
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isCompanyDetailsRoute = pathname.startsWith("/company-details");
  const isJobAssistantRoute = pathname.startsWith("/job-assistant");
  const isApplicantsRoute = pathname.includes("/applicants");
  const isAdminRoute = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");

  // 1. Authentication Check for strictly protected routes
  if (!sessionToken && (isDashboardRoute || isCompanyDetailsRoute)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!sessionToken && isAdminRoute) {
    const adminLoginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(adminLoginUrl);
  }

  // 2. Role-Based Access Control (RBAC) & Professional Redirections
  if (sessionToken) {
    // Employers must not access candidate-only tools (Resume & Cover Letter builder)
    if (userRole === "employer" && isJobAssistantRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Candidates must not access company profile onboarding or applicant review databases
    if (userRole === "candidate" && (isCompanyDetailsRoute || isApplicantsRoute)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Non-admins must not access admin management console
    if (isAdminRoute && userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/company-details/:path*",
    "/job-assistant/:path*",
    "/admin/:path*",
  ],
};
