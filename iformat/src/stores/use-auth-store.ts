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
        if (typeof document !== "undefined") {
          const maxAge = 7 * 24 * 60 * 60; // 7 days
          document.cookie = `accessToken=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
          document.cookie = `iformat_access_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
        }
        set({
          user,
          token,
          refreshToken: refreshToken || null,
          role: (user.role?.toLowerCase() as UserRole) || "candidate",
          isAuthenticated: true,
        });
      },

      setRole: (role) =>
        set((state) => ({
          role,
          user: state.user ? { ...state.user, role } : null,
        })),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      logout: () => {
        if (typeof document !== "undefined") {
          document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
          document.cookie = "iformat_access_token=; path=/; max-age=0; SameSite=Lax";
        }
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
    }
  )
);
