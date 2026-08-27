import { apiClient } from "@/lib/api/api-client";
import {
  AuthResponse,
  LoginRequest,
  PasswordResetRequest,
  RegisterRequest,
  SetNewPasswordRequest,
  UserSession,
  VerifyOtpRequest,
  ResendOtpRequest,
  ChangePasswordRequest,
} from "@/types/api";

export const authService = {
  /**
   * Login user with credentials
   */
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/login", payload);
    return res;
  },

  /**
   * Register a new candidate or employer
   */
  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/register", payload);
    return res;
  },

  /**
   * Verify 6-digit OTP code for email verification or password reset
   */
  async verifyOtp(payload: VerifyOtpRequest): Promise<{
    success: boolean;
    message: string;
    user?: UserSession;
    token?: string;
    accessToken?: string;
    refreshToken?: string;
  }> {
    return await apiClient.post<{
      success: boolean;
      message: string;
      user?: UserSession;
      token?: string;
      accessToken?: string;
      refreshToken?: string;
    }>("/auth/verify-otp", payload);
  },

  /**
   * Resend 6-digit verification code
   */
  async resendOtp(payload: ResendOtpRequest): Promise<{ message: string }> {
    return await apiClient.post<{ message: string }>("/auth/resend-otp", payload);
  },

  /**
   * Get current authenticated user profile
   */
  async getCurrentUser(): Promise<UserSession | null> {
    try {
      const res = await apiClient.get<{ user: UserSession }>("/auth/me");
      return res?.user || (res as unknown as UserSession) || null;
    } catch {
      return null;
    }
  },

  /**
   * Request password reset instructions
   */
  async requestPasswordReset(payload: PasswordResetRequest): Promise<{ message: string }> {
    return await apiClient.post<{ message: string }>("/auth/forgot-password", payload);
  },

  /**
   * Set new password via reset token or OTP code
   */
  async setNewPassword(payload: SetNewPasswordRequest): Promise<{ message: string }> {
    return await apiClient.post<{ message: string }>("/auth/reset-password", payload);
  },

  /**
   * Change password for logged-in user
   */
  async changePassword(payload: ChangePasswordRequest): Promise<{ message: string }> {
    return await apiClient.post<{ message: string }>("/auth/change-password", payload);
  },

  /**
   * Logout user and clear server session cookies
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignore network errors on logout
    }
  },
};
