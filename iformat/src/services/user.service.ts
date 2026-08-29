import { apiClient } from "@/lib/api/api-client";
import { UserSession } from "@/types/api";

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}

export const userService = {
  /**
   * Get current authenticated user profile
   */
  async getProfile(): Promise<UserSession> {
    return apiClient.get<UserSession>("/users/me");
  },

  /**
   * Update profile information (name, phone, avatar)
   */
  async updateProfile(payload: UpdateProfileRequest): Promise<UserSession> {
    return apiClient.patch<UserSession>("/users/me", payload);
  },

  /**
   * Switch or set user role (CANDIDATE | EMPLOYER)
   */
  async updateRole(role: "CANDIDATE" | "EMPLOYER"): Promise<{ role: string }> {
    return apiClient.post<{ role: string }>("/users/role", { role });
  },
};
