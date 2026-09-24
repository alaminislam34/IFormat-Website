"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TrustedBrands } from "./trusted-brands";

export function Stats() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Format seconds to mm:ss
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Play / Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current.play();
      setIsPlaying(true);
      setHasStarted(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Mute toggle
  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  // Volume slider change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      const muted = newVol === 0;
      videoRef.current.muted = muted;
      setIsMuted(muted);
    }
  };

  // Time update
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  // Loaded metadata (duration)
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  // Seek on scrubber click
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(duration, clickPosition * duration));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Listen to native fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Controls auto-hide on inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-slate-50 overflow-hidden">
      {/* Video Section - Entirely In-Section (NO POPUP) */}
      <section
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        className="relative w-full h-[65vh] min-h-[460px] max-h-[720px] bg-[#070b14] flex items-center justify-center overflow-hidden group select-none"
      >
        {/* Blurred Background Ambiance for ultra-wide displays */}
        <video
          src="/videos/Event Promotion Video (2).mp4"
          className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 pointer-events-none scale-110"
          muted
          loop
          playsInline
        />

        {/* Primary Video Element (Plays right in this section) */}
        <video
          ref={videoRef}
          src="/videos/Event Promotion Video (2).mp4"
          className="relative z-10 w-full h-full object-contain cursor-pointer"
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            setShowControls(true);
          }}
          onClick={togglePlay}
        />

        {/* Initial Hero Overlay & Play Button (Fades away once playing) */}
        <AnimatePresence>
          {!hasStarted && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 z-20 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center pointer-events-auto"
            >
              <div className="text-center flex flex-col items-center gap-6 px-4 max-w-2xl">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="relative w-22 h-22 sm:w-24 sm:h-24 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] rounded-full flex items-center justify-center text-white shadow-2xl shadow-cyan-500/40 hover:scale-110 active:scale-95 transition-all group cursor-pointer"
                  aria-label="Play video directly in section"
                >
                  <span className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping -z-10" />
                  <Play className="w-10 h-10 ml-1.5 fill-current" />
                </button>

                <div>
                  <h3 className="text-white font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight drop-shadow-md">
                    Experience the iFormat Vision
                  </h3>
                  <p className="mt-2 text-cyan-200/90 text-sm sm:text-base font-medium drop-shadow-xs max-w-lg mx-auto">
                    Watch how our technology and psychological branding elevate executive careers & high-growth brands.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Big Center Play Indicator when Paused after starting */}
        {hasStarted && !isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-2xs cursor-pointer transition-opacity"
          >
            <div className="w-20 h-20 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform">
              <Play className="w-9 h-9 ml-1 fill-current" />
            </div>
          </div>
        )}

        {/* In-Section Video Player Controls Bar */}
        {hasStarted && (
          <div
            className={`absolute bottom-0 left-0 right-0 z-30 bg-linear-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-6 transition-opacity duration-300 ${
              showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Scrubber Progress Bar */}
            <div
              ref={progressBarRef}
              onClick={handleSeek}
              className="relative w-full h-3 group/scrubber flex items-center cursor-pointer mb-3"
            >
              {/* Background Track */}
              <div className="w-full h-1.5 group-hover/scrubber:h-2 rounded-full bg-white/20 overflow-hidden transition-all">
                <div
                  className="h-full bg-linear-to-r from-[#52CEDE] to-[#0A54B1] relative rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md scale-0 group-hover/scrubber:scale-100 transition-transform pointer-events-none"
                style={{ left: `${progressPercent}%` }}
              />
            </div>

            {/* Bottom Controls Row */}
            <div className="flex items-center justify-between text-white text-xs">
              {/* Left Cluster: Play/Pause, Volume, Timestamps */}
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-1.5 hover:text-cyan-400 transition-colors cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                {/* Restart */}
                <button
                  type="button"
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                      videoRef.current.play();
                      setIsPlaying(true);
                    }
                  }}
                  className="p-1 hover:text-cyan-400 transition-colors cursor-pointer text-slate-300 hover:text-white"
                  title="Replay from start"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Volume & Slider */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="p-1 hover:text-cyan-400 transition-colors cursor-pointer"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 sm:w-20 h-1.5 accent-cyan-400 bg-white/20 rounded-lg cursor-pointer"
                    aria-label="Volume Slider"
                  />
                </div>

                {/* Time Display */}
                <span className="font-mono text-slate-300 text-[11px] sm:text-xs tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right Cluster: Brand & Fullscreen */}
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  iFormat Vision
                </span>

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-1.5 hover:text-cyan-400 transition-colors cursor-pointer"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <TrustedBrands />
    </div>
  );
}
