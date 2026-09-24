"use client";

import { useState, useRef, useEffect } from "react";
import { Play, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TrustedBrands } from "./trusted-brands";

export function Stats() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleOpenModal = () => {
    // 1. Immediately pause the background under-section video
    if (videoRef.current) {
      videoRef.current.pause();
    }
    // 2. Open the video theater modal
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Resume ambient muted background loop when modal closes
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  // Close modal on Escape key press
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  return (
    <div className="bg-slate-50 overflow-hidden">
      <section className="relative h-[65vh] min-h-115 bg-[#0f172a] flex items-center justify-center overflow-hidden group">
        {/* Ambient Background Video (Always muted, acts as cinematic backdrop) */}
        <video
          ref={videoRef}
          src="/videos/Event Promotion Video (2).mp4"
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
          loop
          autoPlay
        />

        {/* Ambient Dark/Gradient Overlay */}
        <div className="absolute inset-0 bg-[#0f172a]/75 backdrop-blur-[2px] pointer-events-none transition-opacity duration-500" />

        {/* Ambient Radial Glow */}
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
              onClick={handleOpenModal}
              className="relative w-22 h-22 sm:w-24 sm:h-24 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] rounded-full flex items-center justify-center text-white shadow-2xl shadow-cyan-500/30 hover:scale-110 active:scale-95 transition-all group cursor-pointer"
              aria-label="Play video in theater modal"
            >
              <span className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping -z-10" />
              <Play className="w-10 h-10 ml-1.5 fill-current" />
            </button>

            <h3 className="mt-6 text-white font-black text-2xl sm:text-3xl tracking-tight drop-shadow-md">
              Experience the iFormat Vision
            </h3>
            <p className="mt-2 text-cyan-200/90 text-sm sm:text-base max-w-lg font-medium drop-shadow-xs">
              Watch how our technology and psychological branding elevate executive careers & high-growth brands.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Fullscreen Video Theater Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-100000 flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-md">
            <div className="absolute inset-0 cursor-pointer" onClick={handleCloseModal} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-5xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-video flex items-center justify-center"
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer border border-white/20"
                aria-label="Close video theater"
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
