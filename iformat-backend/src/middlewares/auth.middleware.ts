import { Request, Response, NextFunction } from "express";
import { AuthError } from "../errors/index.js";
import { verifyAccessToken } from "../utils/token.js";
import { COOKIE_NAMES } from "../config/constants.js";
import { prisma } from "../lib/prisma.js";

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // 1. Check HTTP-only cookie first
    if (req.cookies && req.cookies[COOKIE_NAMES.ACCESS_TOKEN]) {
      token = req.cookies[COOKIE_NAMES.ACCESS_TOKEN];
    }
    // 2. Check Authorization Bearer header fallback
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AuthError("You must be logged in to access this resource"));
    }

    // 3. Verify JWT signature
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      return next(new AuthError("Invalid or expired access token"));
    }

    // 4. Verify user exists in database & token version matches
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        tokenVersion: true,
      },
    });

    if (!user) {
      return next(new AuthError("User no longer exists"));
    }

    if (
      decoded.tokenVersion !== undefined &&
      user.tokenVersion !== decoded.tokenVersion
    ) {
      return next(new AuthError("Session has been invalidated. Please log in again"));
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    next();
  } catch (error) {
    next(error);
  }
};
