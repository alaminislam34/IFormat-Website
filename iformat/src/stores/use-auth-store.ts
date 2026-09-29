import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserRole, UserSession } from "@/types/api";

interface AuthState {
  user: UserSession | null;
  token: string | null;
  refreshToken: string | null;
  role: UserRole;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: UserSession, token: string, refreshToken?: string) => void;
  setRole: (role: UserRole) => void;
  updateUser: (partial: Partial<UserSession>) => void;
  logout: () => void;
}

export function syncAuthCookies(
  token: string | null,
  refreshToken?: string | null,
  role?: string | null
) {
  if (typeof document === "undefined") return;

  if (token) {
    const maxAge = 7 * 24 * 60 * 60; // 7 days
    document.cookie = `accessToken=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = `iformat_access_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;

    if (refreshToken) {
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `iformat_refresh_token=${refreshToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
    }

    if (role) {
      document.cookie = `userRole=${role.toLowerCase()}; path=/; max-age=${maxAge}; SameSite=Lax`;
    }
  } else {
    document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "iformat_access_token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "refreshToken=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "iformat_refresh_token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "userRole=; path=/; max-age=0; SameSite=Lax";
  }
}

// Immediately synchronize cookies if localStorage has active session on client load
if (typeof window !== "undefined") {
  try {
    const stored = localStorage.getItem("iformat-auth-storage");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.state?.isAuthenticated && parsed?.state?.token) {
        syncAuthCookies(
          parsed.state.token,
          parsed.state.refreshToken,
          parsed.state.user?.role || parsed.state.role
        );
      }
    }
  } catch {
    // Ignore storage read error
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      role: "candidate",
      isAuthenticated: false,

      setAuth: (user, token, refreshToken) => {
        // Synchronize cookies so Next.js server middleware can verify protected dashboard routes
        syncAuthCookies(token, refreshToken, user.role);
        set({
          user,
          token,
          refreshToken: refreshToken || null,
          role: (user.role?.toLowerCase() as UserRole) || "candidate",
          isAuthenticated: true,
        });
      },

      setRole: (role) =>
        set((state) => {
          syncAuthCookies(state.token, state.refreshToken, role);
          return {
            role,
            user: state.user ? { ...state.user, role } : null,
          };
        }),

      updateUser: (partial) =>
        set((state) => {
          if (partial.role) {
            syncAuthCookies(state.token, state.refreshToken, partial.role);
          }
          return {
            user: state.user ? { ...state.user, ...partial } : null,
          };
        }),

      logout: () => {
        syncAuthCookies(null);
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "iformat-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.isAuthenticated && state?.token) {
          syncAuthCookies(
            state.token,
            state.refreshToken,
            state.user?.role || state.role
          );
        }
      },
    }
  )
);
