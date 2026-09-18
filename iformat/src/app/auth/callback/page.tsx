"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore, syncAuthCookies } from "@/stores/use-auth-store";
import { apiClient } from "@/lib/api/api-client";
import { LoadingScreen } from "@/features/auth/components/loading-screen";
import { toast } from "sonner";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const completeAuth = async () => {
      try {
        const token = searchParams.get("token");
        const refreshToken = searchParams.get("refreshToken");
        const redirectPath = searchParams.get("redirect") || "/dashboard";

        if (!token) {
          if (isMounted) setError("No authentication token received from Google.");
          toast.error("Google authentication failed: missing token.");
          setTimeout(() => router.replace("/login"), 2000);
          return;
        }

        // Fetch authenticated user profile using token
        const res = await apiClient.get<any>("/auth/me", {
          token,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = res?.data?.user || res?.user;
        if (!userData) {
          throw new Error("Unable to retrieve user details.");
        }

        if (!isMounted) return;

        // Save session in Zustand (localStorage) and sync browser cookies
        setAuth(userData, token, refreshToken || undefined);
        syncAuthCookies(token, refreshToken, userData.role);

        toast.success(`Welcome back, ${userData.name || "User"}!`);

        // Navigate to appropriate destination (e.g. /account-type or /dashboard)
        router.replace(redirectPath);
      } catch (err: any) {
        console.error("❌ OAuth callback synchronization error:", err);
        if (isMounted) {
          setError(err?.message || "Failed to finalize authentication session.");
          toast.error("Failed to complete Google login. Redirecting...");
          setTimeout(() => router.replace("/login"), 2000);
        }
      }
    };

    completeAuth();

    return () => {
      isMounted = false;
    };
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <LoadingScreen message="Completing secure Google login..." />
      {error && (
        <div className="fixed bottom-8 bg-red-50 border border-red-200 text-red-700 px-6 py-3 rounded-xl shadow-lg text-sm font-medium z-50">
          {error}
        </div>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Completing secure Google login..." />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
