"use client";

import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TrustedBrands } from "./trusted-brands";

export function Stats() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  return (
    <div className="bg-slate-50 overflow-hidden">
      <section className="relative h-[65vh] min-h-115 bg-[#0f172a] flex items-center justify-center overflow-hidden group">
        {/* Background Embedded Video */}
        <video
          ref={videoRef}
          src="/videos/Event Promotion Video (2).mp4"
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted={isMuted}
          loop
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Ambient Dark/Gradient Overlay */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
            isPlaying ? "bg-[#0f172a]/40" : "bg-[#0f172a]/75 backdrop-blur-[2px]"
          }`}
        />

        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#0f172a]/30 to-[#0f172a] pointer-events-none" />

        {/* Center Play Button & Title */}
        <div className="relative z-10 text-center flex flex-col items-center gap-6 px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            <button
              onClick={() => {
                if (!isPlaying) {
                  togglePlay();
                } else {
                  setIsModalOpen(true);
                }
              }}
              className="relative w-22 h-22 sm:w-24 sm:h-24 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] rounded-full flex items-center justify-center text-white shadow-2xl shadow-cyan-500/30 hover:scale-110 active:scale-95 transition-all group cursor-pointer"
              aria-label={isPlaying ? "Watch video in modal" : "Play video"}
            >
              <span className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping -z-10" />
              {isPlaying ? (
                <Maximize className="w-9 h-9" />
              ) : (
                <Play className="w-10 h-10 ml-1.5 fill-current" />
              )}
            </button>

            <h3 className="mt-6 text-white font-black text-2xl sm:text-3xl tracking-tight drop-shadow-md">
              Experience the iFormat Vision
            </h3>
            <p className="mt-2 text-cyan-200/90 text-sm sm:text-base max-w-lg font-medium drop-shadow-xs">
              Watch how our technology and psychological branding elevate executive careers & high-growth brands.
            </p>
          </motion.div>
        </div>

        {/* Floating Quick Controls Bar when playing in-place */}
        {isPlaying && (
          <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2 shadow-xl">
            <button
              onClick={togglePlay}
              className="p-2 rounded-xl text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              onClick={toggleMute}
              className="p-2 rounded-xl text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 rounded-xl text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Expand Video Theater"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* Fullscreen Video Theater Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-100000 flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-md">
            <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-5xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-video flex items-center justify-center"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer border border-white/20"
              >
                <X className="w-5 h-5" />
              </button>

              <video
                src="/videos/Event Promotion Video (2).mp4"
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TrustedBrands />
    </div>
  );
}
