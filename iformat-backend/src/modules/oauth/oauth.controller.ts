import { Request, Response } from "express";
import { OAuthService } from "./oauth.service.js";
import { setAuthCookies } from "../../utils/cookie.js";
import { env, getFrontendUrl } from "../../config/env.js";
import { Role } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

export class OAuthController {
  /**
   * Google OAuth2 Callback Handler
   * Receives authenticated Google profile from Passport, manages account creation/linking,
   * sets HttpOnly authentication cookies, and redirects to frontend.
   */
  static async googleCallback(req: Request, res: Response) {
    try {
      const profile = req.user as any;
      if (!profile) {
        return res.redirect(env.OAUTH_FAILURE_REDIRECT_URL);
      }

      const email = profile.emails?.[0]?.value;
      const name = profile.displayName || profile.name?.givenName || "Google User";
      const avatarUrl = profile.photos?.[0]?.value;
      const providerAccountId = profile.id;

      if (!email || !providerAccountId) {
        return res.redirect(`${env.OAUTH_FAILURE_REDIRECT_URL}?reason=missing_email`);
      }

      const { user, accessToken, refreshToken, isNewUser } =
        await OAuthService.handleSocialProfile({
          provider: "GOOGLE",
          providerAccountId,
          email,
          name,
          avatarUrl,
          emailVerified: true,
        });

      // Set HttpOnly dual cookies (access token + refresh token)
      setAuthCookies(res, accessToken, refreshToken);

      // Determine smart post-login redirect
      let targetPath = "/dashboard";
      if (isNewUser) {
        targetPath = "/account-type";
      } else if (user.role === Role.EMPLOYER) {
        targetPath = user.companyName && user.companyName.trim() ? "/dashboard" : "/company-details";
      } else if (user.role === Role.CANDIDATE) {
        // If candidate has no CV, no applications, and was created recently, direct to role choice onboarding
        const hasHistory =
          (await prisma.application.count({ where: { candidateId: user.id } })) > 0 ||
          (await prisma.cV.count({ where: { userId: user.id } })) > 0;
        const isRecent = Date.now() - new Date(user.createdAt).getTime() < 24 * 60 * 60 * 1000;
        if (!hasHistory && isRecent) {
          targetPath = "/account-type";
        }
      }

      // Secure handover to frontend auth/callback
      const callbackUrl = new URL(`${getFrontendUrl()}/auth/callback`);
      callbackUrl.searchParams.set("token", accessToken);
      callbackUrl.searchParams.set("refreshToken", refreshToken);
      callbackUrl.searchParams.set("redirect", targetPath);

      return res.redirect(callbackUrl.toString());
    } catch {
      return res.redirect(env.OAUTH_FAILURE_REDIRECT_URL);
    }
  }
}
