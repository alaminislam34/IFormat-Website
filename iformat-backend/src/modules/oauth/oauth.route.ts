import { Router } from "express";
import passport from "passport";
import { OAuthController } from "./oauth.controller.js";
import { catchAsync } from "../../utils/catchAsync.js";

const router = Router();

// Trigger Google OAuth handshake
router.get("/google", (req, res, next) => {
  const origin = req.query.origin as string | undefined;
  const returnTo = req.query.returnTo as string | undefined;
  const statePayload = { origin, returnTo };
  const state = Buffer.from(JSON.stringify(statePayload)).toString("base64");

  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    state,
  })(req, res, next);
});

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
