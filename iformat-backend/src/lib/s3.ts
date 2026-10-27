import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

export const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID || "mock",
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "mock",
  },
});

export const getPresignedUploadUrl = async (
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> => {
  try {
    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    logger.error("Error generating S3 presigned upload URL:", error);
    return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
  }
};

export const getPublicAssetUrl = (key: string): string => {
  const cleanKey = key.replace(/^\/+/, "");
  const cfDomain = env.AWS_CLOUDFRONT_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  if (cfDomain) {
    return `https://${cfDomain}/${cleanKey}`;
  }
  return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${cleanKey}`;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Virtual-hosted (bucket.s3.region...) and path-style (s3.region.../bucket) URLs
const s3UrlPattern = (() => {
  const bucket = escapeRegExp(env.AWS_S3_BUCKET);
  return new RegExp(
    `https://(?:${bucket}\\.s3[.-][a-z0-9.-]*amazonaws\\.com|s3[.-][a-z0-9.-]*amazonaws\\.com/${bucket})/([^"'\\s?]*)(\\?[^"'\\s]*)?`,
    "g"
  );
})();

/**
 * Rewrites direct S3 object URLs to CloudFront. The bucket is private, so URLs
 * stored before the CDN switch return 403 unless served through CloudFront.
 * Presigned URLs (with a query string) are left untouched.
 */
export const rewriteS3UrlsToCdn = (text: string): string => {
  const cfDomain = env.AWS_CLOUDFRONT_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  if (!cfDomain) return text;
  return text.replace(s3UrlPattern, (match, key: string, query?: string) =>
    query ? match : `https://${cfDomain}/${key}`
  );
};

/**
 * True when the URL points at this app's own media (CloudFront or the S3 bucket),
 * so the server can safely fetch it on the user's behalf.
 */
export const isOwnMediaUrl = (url: string): boolean => {
  const cfDomain = env.AWS_CLOUDFRONT_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const cdnUrl = rewriteS3UrlsToCdn(url);
  return Boolean(cfDomain) && cdnUrl.startsWith(`https://${cfDomain}/`);
};

export const getPresignedDownloadUrl = async (
  key: string,
  expiresIn = 3600
): Promise<string> => {
  // If CloudFront is configured, deliver directly through high-speed CDN without presigning needed
  const cfDomain = env.AWS_CLOUDFRONT_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  if (cfDomain) {
    return getPublicAssetUrl(key);
  }

  try {
    const command = new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    logger.error("Error generating S3 presigned download URL:", error);
    return getPublicAssetUrl(key);
  }
};

export const deleteS3Object = async (key: string): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
    });
    await s3Client.send(command);
  } catch (error) {
    logger.error(`Failed to delete S3 object: ${key}`, error);
  }
};
