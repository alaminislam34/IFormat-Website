import { Request, Response, NextFunction } from "express";
import { rewriteS3UrlsToCdn } from "../lib/s3.js";

/**
 * Serves every stored media URL (logos, avatars, videos, CVs) through
 * CloudFront, including legacy direct S3 URLs saved in the database.
 */
export const cdnUrls = (_req: Request, res: Response, next: NextFunction): void => {
  const json = res.json.bind(res);
  res.json = (body?: any) => {
    if (body === undefined) return json(body);
    const raw = JSON.stringify(body);
    const rewritten = rewriteS3UrlsToCdn(raw);
    return json(rewritten === raw ? body : JSON.parse(rewritten));
  };
  next();
};
