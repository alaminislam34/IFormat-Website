"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, ExternalLink, AlertCircle, RotateCcw } from "lucide-react";
import { getMediaUrl } from "@/lib/utils";

interface CompanyVideoPlayerProps {
  src: string;
  title?: string;
  poster?: string | null;
  autoPlay?: boolean;
  className?: string;
}

export function CompanyVideoPlayer({
  src,
  title,
  poster,
  autoPlay = false,
  className = "",
}: CompanyVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Automatically rewrite raw S3 bucket URLs to CloudFront CDN
  const mediaSrc = React.useMemo(() => {
    return getMediaUrl(src);
  }, [src]);

  // Validate poster: never pass SVG URLs as video poster since browsers cannot render them
  const validPoster = React.useMemo(() => {
    if (!poster) return undefined;
    const clean = poster.split("?")[0].toLowerCase();
    if (clean.endsWith(".svg") || clean.includes("image/svg")) {
      return undefined;
    }
    return getMediaUrl(poster);
  }, [poster]);

  // Determine MIME type for optimal browser decoding
  const mimeType = React.useMemo(() => {
    if (!mediaSrc) return undefined;
    const clean = mediaSrc.split("?")[0].toLowerCase();
    if (clean.endsWith(".webm")) return "video/webm";
    if (clean.endsWith(".mp4")) return "video/mp4";
    if (clean.endsWith(".mov")) return "video/quicktime";
    if (clean.endsWith(".ogg") || clean.endsWith(".ogv")) return "video/ogg";
    return undefined;
  }, [mediaSrc]);

  // Reset error when src changes
  useEffect(() => {
    setHasError(false);
    setIsPlaying(false);
    setIsLoaded(false);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [mediaSrc]);

  const handlePlayOverlay = async () => {
    if (!videoRef.current) return;
    try {
      setHasError(false);
      await videoRef.current.play();
      setIsPlaying(true);
    } catch (err: any) {
      console.warn("Video play request failed or blocked:", err);
      // If autoplay was blocked or decoding issue, try with controls
      setIsPlaying(true);
    }
  };

  const handleRetry = () => {
    setHasError(false);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  if (!src) return null;

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-slate-950 aspect-video border border-slate-200/80 shadow-inner group ${className}`}
    >
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/95 text-white space-y-3 z-20">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-xs">
            <p className="text-xs font-bold text-slate-200">
              Video Playback Error
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your browser could not decode this video format ({mimeType || "media"}).
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleRetry}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <a
              href={mediaSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#0A54B1] hover:bg-[#084290] text-xs font-semibold text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Video</span>
            </a>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            controls={isPlaying || isLoaded}
            playsInline
            preload="metadata"
            autoPlay={autoPlay}
            poster={validPoster}
            className="w-full h-full object-contain bg-black"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onLoadedData={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
          >
            {mimeType && <source src={mediaSrc} type={mimeType} />}
            <source src={mediaSrc} />
            Your browser does not support HTML5 video playback.
          </video>

          {/* Interactive Play Overlay when not playing */}
          {!isPlaying && (
            <div
              onClick={handlePlayOverlay}
              className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-all duration-200 group-hover:bg-black/30 z-10"
              title="Click to play video"
            >
              <div className="w-14 h-14 rounded-full bg-white/95 text-[#0A54B1] shadow-2xl flex items-center justify-center group-hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white/40">
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </div>
            </div>
          )}

          {/* Direct Link button in top right */}
          <a
            href={mediaSrc}
            target="_blank"
            rel="noopener noreferrer"
            title="Open video in new tab"
            className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition-colors opacity-0 group-hover:opacity-100 z-10"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </>
      )}
    </div>
  );
}
