import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { ForbiddenError, AuthError } from "../errors/index.js";

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthError("Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access forbidden: requires one of [${allowedRoles.join(", ")}] roles`
        )
      );
    }

    next();
  };
};

export const requireAdmin = requireRole(Role.ADMIN);
export const requireEmployer = requireRole(Role.EMPLOYER, Role.ADMIN);
export const requireCandidate = requireRole(Role.CANDIDATE, Role.ADMIN);
