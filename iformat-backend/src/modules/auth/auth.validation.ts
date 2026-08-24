import { z } from "zod";
import { Role } from "@prisma/client";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z
    .enum([Role.CANDIDATE, Role.EMPLOYER])
    .optional()
    .default(Role.CANDIDATE),
});

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().optional(),
  email: z.string().email("Please provide a valid email address").optional(),
  code: z.string().length(6, "OTP must be 6 digits").optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
}).refine(
  (data) => Boolean(data.token || (data.email && data.code)),
  {
    message: "Either reset token or email + OTP code must be provided",
  }
);

export const verifyOtpSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  code: z.string().length(6, "OTP must be a 6-digit code"),
  type: z.enum(["EMAIL_VERIFICATION", "PASSWORD_RESET"]).optional().default("EMAIL_VERIFICATION"),
});

export const resendOtpSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  type: z.enum(["EMAIL_VERIFICATION", "PASSWORD_RESET"]).optional().default("EMAIL_VERIFICATION"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});
