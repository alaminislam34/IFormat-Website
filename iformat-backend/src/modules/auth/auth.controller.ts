import { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { setAuthCookies, clearAuthCookies } from "../../utils/cookie.js";
import { COOKIE_NAMES } from "../../config/constants.js";
import { AuthError } from "../../errors/index.js";

export class AuthController {
  static async register(req: Request, res: Response) {
    const { user, requiresEmailVerification } =
      await AuthService.register(req.body);

    return ApiResponse.success(
      res,
      "Account registered successfully. A verification code has been sent to your email.",
      { user, requiresEmailVerification },
      201
    );
  }

  static async login(req: Request, res: Response) {
    const { user, accessToken, refreshToken, requiresEmailVerification } =
      await AuthService.login(req.body);

    if (requiresEmailVerification || !accessToken) {
      return ApiResponse.success(
        res,
        "Please verify your email address to complete sign in. A new verification code has been sent.",
        { user, requiresEmailVerification: true }
      );
    }

    setAuthCookies(res, accessToken, refreshToken!);

    return ApiResponse.success(
      res,
      "Logged in successfully",
      { user, token: accessToken, accessToken, refreshToken }
    );
  }

  static async verifyOtp(req: Request, res: Response) {
    const result = await AuthService.verifyOtp(req.body);
    if (result.accessToken && result.refreshToken) {
      setAuthCookies(res, result.accessToken, result.refreshToken);
    }

    return ApiResponse.success(res, result.message, {
      user: result.user,
      token: result.accessToken,
      refreshToken: result.refreshToken,
    });
  }

  static async resendOtp(req: Request, res: Response) {
    const result = await AuthService.resendOtp(req.body);
    return ApiResponse.success(res, result.message);
  }

  static async refresh(req: Request, res: Response) {
    const rawToken =
      req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN] ||
      req.body?.refreshToken;

    if (!rawToken) {
      throw new AuthError("Refresh token missing");
    }

    const { user, accessToken, refreshToken } = await AuthService.refreshToken(rawToken);
    setAuthCookies(res, accessToken, refreshToken);

    return ApiResponse.success(
      res,
      "Session refreshed successfully",
      { user, token: accessToken }
    );
  }

  static async logout(req: Request, res: Response) {
    if (req.user?.id) {
      await AuthService.logout(req.user.id);
    }
    clearAuthCookies(res);

    return ApiResponse.success(res, "Logged out successfully");
  }

  static async forgotPassword(req: Request, res: Response) {
    await AuthService.requestPasswordReset(req.body.email);
    return ApiResponse.success(
      res,
      "If an account exists with this email, reset instructions have been sent."
    );
  }

  static async resetPassword(req: Request, res: Response) {
    await AuthService.resetPassword(req.body);
    return ApiResponse.success(
      res,
      "Password updated successfully. Please log in with your new password."
    );
  }

  static async changePassword(req: Request, res: Response) {
    if (!req.user?.id) {
      throw new AuthError("Authentication required");
    }
    await AuthService.changePassword(
      req.user.id,
      req.body.currentPassword,
      req.body.newPassword
    );
    clearAuthCookies(res);
    return ApiResponse.success(
      res,
      "Password changed successfully. Please log in again with your new password."
    );
  }

  static async getMe(req: Request, res: Response) {
    if (!req.user?.id) {
      throw new AuthError("Authentication required");
    }
    const user = await AuthService.getMe(req.user.id);
    return ApiResponse.success(res, "User profile retrieved", { user });
  }
}
