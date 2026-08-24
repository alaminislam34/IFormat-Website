export type UserRole = "candidate" | "employer" | "admin" | "CANDIDATE" | "EMPLOYER" | "ADMIN";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  avatar?: string;
  phone?: string | null;
  emailVerified?: boolean;
  companyName?: string | null;
  companyWebsite?: string | null;
  companyDescription?: string | null;
  companyLogoUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: UserSession;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  requiresEmailVerification?: boolean;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
  type?: "EMAIL_VERIFICATION" | "PASSWORD_RESET";
}

export interface ResendOtpRequest {
  email: string;
  type?: "EMAIL_VERIFICATION" | "PASSWORD_RESET";
}

export interface PasswordResetRequest {
  email: string;
}

export interface SetNewPasswordRequest {
  email?: string;
  code?: string;
  password: string;
  confirmPassword?: string;
  token?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
