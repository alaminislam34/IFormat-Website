"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/use-auth-store";
import {
  LoginRequest,
  PasswordResetRequest,
  RegisterRequest,
  SetNewPasswordRequest,
  VerifyOtpRequest,
  ResendOtpRequest,
  ChangePasswordRequest,
} from "@/types/api";

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
    onSuccess: (data) => {
      const token = data.token || data.accessToken;
      if (token && data.user && data.user.emailVerified !== false && !data.requiresEmailVerification) {
        setAuth(data.user, token, data.refreshToken);
      }
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterRequest) => authService.register(payload),
    // Do NOT setAuth here; user is unverified until OTP confirmation!
  });
}

export function useVerifyOtp() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (payload: VerifyOtpRequest) => authService.verifyOtp(payload),
    onSuccess: (data) => {
      const token = data.token || data.accessToken;
      if (data.user && token) {
        setAuth(data.user, token, data.refreshToken);
      }
    },
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: (payload: ResendOtpRequest) => authService.resendOtp(payload),
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (payload: PasswordResetRequest) =>
      authService.requestPasswordReset(payload),
  });
}

export function useSetNewPassword() {
  return useMutation({
    mutationFn: (payload: SetNewPasswordRequest) =>
      authService.setNewPassword(payload),
  });
}

export function useChangePassword() {
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) =>
      authService.changePassword(payload),
    onSuccess: () => {
      logout();
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });
}
