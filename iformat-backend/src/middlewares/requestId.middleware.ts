import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware to generate or forward correlation ID (x-request-id)
 * for end-to-end tracing and structured logging across services.
 */
export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const existingId = req.headers["x-request-id"]?.toString();
  const id = existingId && existingId.trim().length > 0 ? existingId : randomUUID();

  req.id = id;
  res.setHeader("x-request-id", id);
  next();
};
