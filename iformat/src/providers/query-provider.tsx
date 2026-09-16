"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState, useEffect } from "react";
import { useAuthStore, syncAuthCookies } from "@/stores/use-auth-store";
import { authService } from "@/services/auth.service";

interface QueryProviderProps {
  children: ReactNode;
}

function AuthInitializer() {
  const { isAuthenticated, token, refreshToken, updateUser, logout } = useAuthStore();

  useEffect(() => {
    // 1. Immediately ensure cookies match localStorage tokens for SSR/middleware
    if (token) {
      syncAuthCookies(token, refreshToken);
    }

    // 2. Validate current session against the backend
    if (isAuthenticated && token) {
      authService
        .getCurrentUser()
        .then((user) => {
          if (user) {
            updateUser(user);
          } else {
            // Session invalidated on server (e.g. user deleted or token revoked)
            logout();
          }
        })
        .catch(() => {
          // On network errors, avoid immediate logout; 401s are handled by apiClient
        });
    }
  }, []);

  return null;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      {children}
    </QueryClientProvider>
  );
}
