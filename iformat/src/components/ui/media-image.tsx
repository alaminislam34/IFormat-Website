"use client";

import React, { useState } from "react";
import { getMediaUrl } from "@/lib/utils";

interface MediaImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  /** Rendered when there is no src or the image fails to load */
  fallback: React.ReactNode;
}

/**
 * Uploaded media image (logos, avatars) served through the CDN, falling back
 * to `fallback` instead of a broken image / alt text when it cannot load.
 */
export function MediaImage({ src, alt, className, fallback }: MediaImageProps) {
  const url = getMediaUrl(src);
  // Remember which URL failed so a new src is retried
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (!url || failedUrl === url) return <>{fallback}</>;

  return <img src={url} alt={alt} className={className} onError={() => setFailedUrl(url)} />;
}
