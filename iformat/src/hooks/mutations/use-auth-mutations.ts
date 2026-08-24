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
      const token = data.token || data.accessToken || "";
      setAuth(data.user, token, data.refreshToken);
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (payload: RegisterRequest) => authService.register(payload),
    onSuccess: (data) => {
      const token = data.token || data.accessToken || "";
      setAuth(data.user, token, data.refreshToken);
    },
  });
}

export function useVerifyOtp() {
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (payload: VerifyOtpRequest) => authService.verifyOtp(payload),
    onSuccess: (data) => {
      if (data.user) {
        updateUser(data.user);
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
