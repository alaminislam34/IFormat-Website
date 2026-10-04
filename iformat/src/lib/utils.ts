import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Ensures media URLs route through CloudFront CDN to avoid S3 403 Forbidden errors.
 */
export function getMediaUrl(url?: string | null): string {
  if (!url) return "";
  if (url.includes("images.unsplash.com")) return "";
  const cfDomain = "d27emhc73cwv74.cloudfront.net";
  return url.replace(
    /https:\/\/(?:ifromat-media-db\.s3[.-][^/]+|s3[.-][^/]+\/ifromat-media-db)/g,
    `https://${cfDomain}`
  );
}
