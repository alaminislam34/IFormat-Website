import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../errors/index.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";

export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const reqId = req.id || req.headers["x-request-id"]?.toString();
  const logPrefix = reqId ? `[ReqID: ${reqId}] ` : "";

  if (err instanceof AppError && err.statusCode < 500) {
    logger.warn(`${logPrefix}${err.message}`);
  } else {
    logger.error(`${logPrefix}${err?.stack || err?.message || err}`);
  }

  // 1. Handled AppError instances
  if (err instanceof AppError) {
    return ApiResponse.error(res, err.message, err.statusCode, err.errors, reqId);
  }

  // 2. Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return ApiResponse.error(res, "Validation failed", 400, formattedErrors, reqId);
  }

  // 3. Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation (e.g. email or unique composite index)
    if (err.code === "P2002") {
      const target = Array.isArray(err.meta?.target)
        ? err.meta.target.join(", ")
        : "Record";
      return ApiResponse.error(
        res,
        `${target} already exists and violates unique constraint`,
        409,
        undefined,
        reqId
      );
    }
    // Record not found
    if (err.code === "P2025") {
      return ApiResponse.error(res, "Requested record was not found", 404, undefined, reqId);
    }
    // Foreign key constraint failed
    if (err.code === "P2003") {
      return ApiResponse.error(res, "Referenced record does not exist", 400, undefined, reqId);
    }
  }

  // 4. JWT Errors
  if (err.name === "JsonWebTokenError") {
    return ApiResponse.error(res, "Invalid token signature", 401, undefined, reqId);
  }
  if (err.name === "TokenExpiredError") {
    return ApiResponse.error(res, "Token has expired", 401, undefined, reqId);
  }

  // 5. Stripe Webhook Errors
  if (err.type === "StripeSignatureVerificationError") {
    return ApiResponse.error(res, "Stripe webhook signature verification failed", 400, undefined, reqId);
  }

  // 6. Unknown / Unhandled Errors
  const statusCode = err.statusCode || 500;
  const message =
    env.NODE_ENV === "production" && statusCode === 500
      ? "Internal server error. Please contact support"
      : err.message || "Internal server error";

  return ApiResponse.error(
    res,
    message,
    statusCode,
    env.NODE_ENV === "development" ? err.stack : undefined,
    reqId
  );
};
