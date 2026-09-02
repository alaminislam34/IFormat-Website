"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";

// Routes where the public consumer navbar should not appear
const EXCLUDED_PREFIXES = ["/admin", "/dashboard"];
const EXCLUDED_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
  "/account-type",
  "/company-details",
];

export function GlobalNavbar() {
  const pathname = usePathname();

  // Hide on admin routes
  if (EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  // Hide on dedicated auth routes
  if (EXCLUDED_ROUTES.includes(pathname)) {
    return null;
  }

  return <Navbar />;
}
