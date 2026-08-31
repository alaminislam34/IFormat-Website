import { Request, Response } from "express";
import { OAuthService } from "./oauth.service.js";
import { setAuthCookies } from "../../utils/cookie.js";
import { env, getFrontendUrl } from "../../config/env.js";
import { Role } from "@prisma/client";

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
      if (isNewUser) {
        return res.redirect(env.OAUTH_SUCCESS_REDIRECT_URL); // /account-type
      }

      if (user.role === Role.EMPLOYER) {
        return res.redirect(`${getFrontendUrl()}/company-details`);
      }

      return res.redirect(`${getFrontendUrl()}/dashboard`);
    } catch {
      return res.redirect(env.OAUTH_FAILURE_REDIRECT_URL);
    }
  }
}
