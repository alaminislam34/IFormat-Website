import { Router } from "express";
import passport from "passport";
import { OAuthController } from "./oauth.controller.js";
import { catchAsync } from "../../utils/catchAsync.js";

const router = Router();

// Trigger Google OAuth handshake
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/v1/auth/oauth-failed",
  }),
  catchAsync(OAuthController.googleCallback)
);

export const oauthRouter = router;
