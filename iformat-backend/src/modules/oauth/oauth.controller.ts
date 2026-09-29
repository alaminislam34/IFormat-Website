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

      // Check state for originating frontend URL or deep returnTo path
      let frontendBase = getFrontendUrl();
      if (req.query.state && typeof req.query.state === "string") {
        try {
          const raw = Buffer.from(req.query.state, "base64").toString("utf-8");
          const parsedState = JSON.parse(raw);
          if (parsedState?.origin && typeof parsedState.origin === "string") {
            const requestedOrigin = new URL(parsedState.origin).origin;
            const allowed = env.CORS_ORIGIN.split(",").map((o) => o.trim().replace(/\/+$/, ""));
            if (allowed.includes(requestedOrigin)) {
              frontendBase = requestedOrigin;
            }
          }
          if (
            parsedState?.returnTo &&
            typeof parsedState.returnTo === "string" &&
            parsedState.returnTo.startsWith("/") &&
            !parsedState.returnTo.startsWith("//")
          ) {
            targetPath = parsedState.returnTo;
          }
        } catch {
          // ignore parsing error and fallback to default frontend base
        }
      }

      // Secure handover to frontend auth/callback
      const callbackUrl = new URL(`${frontendBase}/auth/callback`);
      callbackUrl.searchParams.set("token", accessToken);
      callbackUrl.searchParams.set("refreshToken", refreshToken);
      callbackUrl.searchParams.set("redirect", targetPath);

      return res.redirect(callbackUrl.toString());
    } catch (err) {
      console.error("❌ Google OAuth Callback Error:", err);
      return res.redirect(env.OAUTH_FAILURE_REDIRECT_URL);
    }
  }
}
