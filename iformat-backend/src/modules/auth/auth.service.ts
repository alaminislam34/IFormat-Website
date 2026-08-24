import crypto from "crypto";
import { prisma } from "../../lib/prisma.js";
import { Role, OtpType } from "@prisma/client";
import { hashPassword, comparePassword } from "../../utils/password.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../utils/token.js";
import { AuthError, ConflictError, NotFoundError } from "../../errors/index.js";
import { sendEmail } from "../../lib/mailer.js";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

// Helper to project only safe, non-sensitive user fields
export const sanitizeUser = (user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl || null,
  phone: user.phone || null,
  emailVerified: user.emailVerified || false,
  companyName: user.companyName || null,
  companyWebsite: user.companyWebsite || null,
  companyDescription: user.companyDescription || null,
  companyLogoUrl: user.companyLogoUrl || null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export class AuthService {
  /**
   * Generates and stores a 6-digit numeric OTP with 10-minute expiry
   */
  private static async createOtp(email: string, type: OtpType): Promise<string> {
    // Invalidate previous active OTPs for this email and type
    await prisma.otpVerification.updateMany({
      where: {
        email: email.toLowerCase(),
        type,
        used: false,
      },
      data: { used: true },
    });

    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.otpVerification.create({
      data: {
        email: email.toLowerCase(),
        code,
        type,
        expiresAt,
      },
    });

    if (env.NODE_ENV === "development") {
      logger.info(`🔑 [DEV OTP CODE] ${type} for ${email} => ${code}`);
    }

    return code;
  }

  /**
   * Register Candidate or Employer
   */
  static async register(input: {
    name: string;
    email: string;
    password: string;
    role?: Role;
  }) {
    const email = input.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    let user: any;

    if (existing) {
      if (existing.emailVerified) {
        throw new ConflictError("An account with this email already exists");
      }

      // Existing unverified account: Update credentials and send fresh OTP
      const passwordHash = await hashPassword(input.password);
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: input.name.trim(),
          passwordHash,
          role: input.role || existing.role || Role.CANDIDATE,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          phone: true,
          emailVerified: true,
          tokenVersion: true,
          companyName: true,
          companyWebsite: true,
          companyDescription: true,
          companyLogoUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } else {
      const passwordHash = await hashPassword(input.password);
      user = await prisma.user.create({
        data: {
          name: input.name.trim(),
          email,
          passwordHash,
          role: input.role || Role.CANDIDATE,
          emailVerified: false,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          phone: true,
          emailVerified: true,
          tokenVersion: true,
          companyName: true,
          companyWebsite: true,
          companyDescription: true,
          companyLogoUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    // Generate 6-digit verification OTP
    const otpCode = await this.createOtp(email, OtpType.EMAIL_VERIFICATION);

    // Send OTP email
    sendEmail({
      to: user.email,
      subject: "Verify your iFormat account",
      template: "otp-verification",
      data: {
        name: user.name,
        code: otpCode,
      },
    });

    // Also send general welcome email
    sendEmail({
      to: user.email,
      subject: "Welcome to iFormat!",
      template: "welcome",
      data: {
        name: user.name,
        dashboardUrl: `${env.CORS_ORIGIN}/account-type`,
      },
    });

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
      requiresEmailVerification: true,
    };
  }

  /**
   * Login with email & password
   */
  static async login(input: { email: string; password: string }) {
    const email = input.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new AuthError("Invalid email or password");
    }

    const isMatch = await comparePassword(input.password, user.passwordHash);
    if (!isMatch) {
      throw new AuthError("Invalid email or password");
    }

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Verify 6-digit OTP code
   */
  static async verifyOtp(input: {
    email: string;
    code: string;
    type?: OtpType;
  }) {
    const email = input.email.toLowerCase().trim();
    const type = input.type || OtpType.EMAIL_VERIFICATION;

    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        email,
        type,
        used: false,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      throw new AuthError("No active verification code found. Please request a new code");
    }

    if (otpRecord.attempts >= 5) {
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { used: true },
      });
      throw new AuthError("Too many incorrect attempts. Please request a new OTP code");
    }

    if (new Date() > otpRecord.expiresAt) {
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { used: true },
      });
      throw new AuthError("Verification code has expired. Please request a new one");
    }

    if (otpRecord.code !== input.code.trim()) {
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      throw new AuthError("Invalid verification code. Please check and try again");
    }

    // Mark OTP as used
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // If email verification, mark user as verified
    let updatedUser = null;
    if (type === OtpType.EMAIL_VERIFICATION) {
      updatedUser = await prisma.user.update({
        where: { email },
        data: { emailVerified: true },
      });
    } else {
      updatedUser = await prisma.user.findUnique({
        where: { email },
      });
    }

    return {
      success: true,
      message: "Verification successful",
      user: updatedUser ? sanitizeUser(updatedUser) : null,
    };
  }

  /**
   * Resend 6-digit OTP code
   */
  static async resendOtp(input: {
    email: string;
    type?: OtpType;
  }) {
    const email = input.email.toLowerCase().trim();
    const type = input.type || OtpType.EMAIL_VERIFICATION;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return true to prevent email enumeration
      return { message: "If an account exists, a new verification code has been sent." };
    }

    const code = await this.createOtp(email, type);

    if (type === OtpType.EMAIL_VERIFICATION) {
      sendEmail({
        to: user.email,
        subject: "Your new iFormat verification code",
        template: "otp-verification",
        data: {
          name: user.name,
          code,
        },
      });
    } else if (type === OtpType.PASSWORD_RESET) {
      sendEmail({
        to: user.email,
        subject: "Password Reset Verification Code",
        template: "otp-verification",
        data: {
          name: user.name,
          code,
        },
      });
    }

    return { message: "A new verification code has been sent to your email." };
  }

  /**
   * Rotate access & refresh tokens
   */
  static async refreshToken(oldRefreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch {
      throw new AuthError("Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        phone: true,
        emailVerified: true,
        tokenVersion: true,
        companyName: true,
        companyWebsite: true,
        companyDescription: true,
        companyLogoUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || user.tokenVersion !== payload.tokenVersion) {
      throw new AuthError("Session revoked or expired. Please log in again");
    }

    // Issue rotated tokens
    const newAccessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    const newRefreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    return {
      user: sanitizeUser(user),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Invalidate all sessions on logout
   */
  static async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
  }

  /**
   * Request password reset (Generates magic link and OTP)
   */
  static async requestPasswordReset(emailInput: string) {
    const email = emailInput.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Prevent user enumeration
      return true;
    }

    const resetToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    const otpCode = await this.createOtp(email, OtpType.PASSWORD_RESET);

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request - iFormat",
      template: "password-reset",
      data: {
        name: user.name,
        resetUrl: `${env.CORS_ORIGIN}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`,
        code: otpCode,
      },
    });

    return true;
  }

  /**
   * Reset password via JWT token or 6-digit OTP code
   */
  static async resetPassword(input: {
    token?: string;
    email?: string;
    code?: string;
    password: string;
  }) {
    let targetUserId: string | null = null;

    if (input.token) {
      let payload;
      try {
        payload = verifyAccessToken(input.token);
      } catch {
        throw new AuthError("Reset link is invalid or has expired");
      }
      targetUserId = payload.userId;
    } else if (input.email && input.code) {
      const email = input.email.toLowerCase().trim();
      const otpRecord = await prisma.otpVerification.findFirst({
        where: {
          email,
          type: OtpType.PASSWORD_RESET,
          used: false,
        },
        orderBy: { createdAt: "desc" },
      });

      if (!otpRecord || otpRecord.code !== input.code.trim() || new Date() > otpRecord.expiresAt) {
        throw new AuthError("Invalid or expired reset code");
      }

      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { used: true },
      });

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new NotFoundError("User not found");
      }
      targetUserId = user.id;
    } else {
      throw new AuthError("Missing reset token or verification code");
    }

    const passwordHash = await hashPassword(input.password);

    // Update password and increment tokenVersion to revoke all active sessions
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        passwordHash,
        tokenVersion: { increment: 1 },
      },
    });

    return true;
  }

  /**
   * Change password for logged-in user
   */
  static async changePassword(
    userId: string,
    currentPass: string,
    newPass: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new AuthError("User not found");
    }

    const isMatch = await comparePassword(currentPass, user.passwordHash);
    if (!isMatch) {
      throw new AuthError("Current password is incorrect");
    }

    const passwordHash = await hashPassword(newPass);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        tokenVersion: { increment: 1 },
      },
    });

    return true;
  }

  /**
   * Get Current Authenticated User Profile
   */
  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User profile not found");
    }

    return sanitizeUser(user);
  }
}
