import rateLimit from "express-rate-limit";
import { ApiResponse } from "../utils/apiResponse.js";
import { env } from "../config/env.js";

const isDev = env.NODE_ENV !== "production";

// General API rate limiter (1500 req per 15 min in prod, unlimited in dev)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100000 : 1500,
  skip: () => isDev,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponse.error(
      res,
      "Too many requests from this IP, please try again after 15 minutes",
      429
    );
  },
});

// Auth endpoints rate limiter (100 req per 15 min in prod, unlimited in dev)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100000 : 100,
  skip: () => isDev,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponse.error(
      res,
      "Too many login or registration attempts. Please try again later",
      429
    );
  },
});

// Password reset rate limiter (20 req per hour in prod, unlimited in dev)
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 100000 : 20,
  skip: () => isDev,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponse.error(
      res,
      "Too many password reset requests. Please check your inbox or try again in an hour",
      429
    );
  },
});

// AI endpoints rate limiter (100 req per 15 min in prod, unlimited in dev)
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100000 : 100,
  skip: () => isDev,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponse.error(
      res,
      "AI screening/generation limit reached. Please wait a few minutes before trying again",
      429
    );
  },
});
