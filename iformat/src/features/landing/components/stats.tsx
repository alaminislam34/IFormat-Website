"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TrustedBrands } from "./trusted-brands";
import {
  useLandingContentStore,
  DEFAULT_VIDEO_SETTINGS,
} from "@/stores/use-landing-content-store";

export function Stats() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const { videoSettings, isHydrated, syncWithBackend } = useLandingContentStore();

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  const activeVideo = isHydrated ? videoSettings : DEFAULT_VIDEO_SETTINGS;

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Play / Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Mute / Unmute toggle
  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);

    // If unmuting while paused, resume playback
    if (!nextMuted && videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-slate-50 overflow-hidden">
      {/* Branding Video Section - Pure In-Section Branding Showcase */}
      <section className="relative w-full h-[65vh] min-h-[460px] max-h-[720px] bg-[#070b14] flex items-center justify-center overflow-hidden group select-none">
        {/* Background Blurred Ambient Glow */}
        <video
          key={`ambient-${activeVideo.videoUrl}`}
          src={activeVideo.videoUrl}
          className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-25 pointer-events-none scale-110"
          muted
          loop
          autoPlay
          playsInline
        />

        {/* Main Branding Video Element */}
        <video
          ref={videoRef}
          key={`main-${activeVideo.videoUrl}`}
          src={activeVideo.videoUrl}
          className="relative z-10 w-full h-full object-cover cursor-pointer"
          playsInline
          loop
          autoPlay
          muted={isMuted}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlay}
        />

        {/* Cinematic Branding Overlay (Always on the video for high-end agency look) */}
        <div className="absolute inset-0 z-20 bg-linear-to-t from-[#070b14]/90 via-[#070b14]/50 to-[#070b14]/65 pointer-events-none transition-opacity duration-300" />

        {/* Ambient Radial Vignette */}
        <div className="absolute inset-0 z-20 bg-radial from-transparent via-[#070b14]/30 to-[#070b14]/80 pointer-events-none" />

        {/* Center Content: Title, Description & Action Button */}
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center flex flex-col items-center gap-6 max-w-3xl"
          >
            {/* Center Play/Pause Indicator Button */}
            <button
              type="button"
              onClick={togglePlay}
              className="pointer-events-auto relative w-20 h-20 sm:w-24 sm:h-24 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] rounded-full flex items-center justify-center text-white shadow-2xl shadow-cyan-500/30 hover:scale-110 active:scale-95 transition-all group cursor-pointer"
              aria-label={isPlaying ? "Pause video" : "Play video"}
              title={isPlaying ? "Pause video" : "Play video"}
            >
              {!isPlaying && (
                <span className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping -z-10" />
              )}
              {isPlaying ? (
                <Pause className="w-8 h-8 sm:w-10 sm:h-10 fill-current" />
              ) : (
                <Play className="w-9 h-9 sm:w-10 sm:h-10 ml-1 fill-current" />
              )}
            </button>

            {/* Branding Typography */}
            <div className="space-y-2.5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                iFormat Vision
              </span>

              <h2 className="text-white font-black text-2xl sm:text-4xl lg:text-5xl tracking-tight drop-shadow-md">
                {activeVideo.title}
              </h2>

              <p className="text-cyan-100/90 text-sm sm:text-base lg:text-lg font-medium drop-shadow-xs max-w-xl mx-auto leading-relaxed">
                {activeVideo.description}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Minimalist Floating Controls: ONLY Play/Pause and Mute/Unmute */}
        <div className="absolute bottom-6 right-6 z-40 flex items-center gap-2 pointer-events-auto">
          {/* Play / Pause Toggle Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 text-white text-xs font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title={isPlaying ? "Pause Video" : "Play Video"}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span className="hidden sm:inline">Play</span>
              </>
            )}
          </button>

          {/* Mute / Unmute Toggle Button */}
          <button
            type="button"
            onClick={toggleMute}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl backdrop-blur-md border text-xs font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              isMuted
                ? "bg-black/60 hover:bg-black/80 border-white/15 text-white"
                : "bg-cyan-500 hover:bg-cyan-400 border-cyan-400 text-slate-950 font-bold"
            }`}
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-400" />
                <span>Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Sound On</span>
              </>
            )}
          </button>
        </div>
      </section>

      <TrustedBrands />
    </div>
  );
}
