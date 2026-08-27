import { Response, CookieOptions } from "express";
import { env } from "../config/env.js";
import { COOKIE_NAMES } from "../config/constants.js";

const getBaseCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.COOKIE_SECURE === true,
  sameSite: "lax",
  domain: env.COOKIE_DOMAIN && env.COOKIE_DOMAIN !== "localhost" && env.COOKIE_DOMAIN !== "" ? env.COOKIE_DOMAIN : undefined,
  path: "/",
});

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  const baseOptions = getBaseCookieOptions();

  // 15 minutes for access token
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
    ...baseOptions,
    maxAge: 15 * 60 * 1000,
  });

  // 7 days for refresh token
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
    ...baseOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookies = (res: Response) => {
  const baseOptions = getBaseCookieOptions();
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, baseOptions);
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, baseOptions);
};
