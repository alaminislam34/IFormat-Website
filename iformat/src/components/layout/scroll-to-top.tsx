"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          const currentScroll = window.scrollY;

          setIsVisible(currentScroll > 300);

          if (totalHeight > 0) {
            const progress = Math.min(1, Math.max(0, currentScroll / totalHeight));
            setScrollProgress(progress);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Ultra-smooth cubic bezier momentum scroll
  const scrollToTop = () => {
    if (isAnimatingRef.current) return;
    const startY = window.scrollY;
    if (startY === 0) return;

    isAnimatingRef.current = true;
    const duration = Math.min(750, Math.max(450, Math.floor(startY / 4)));
    let startTime: number | null = null;

    // Smooth ease-in-out cubic easing function
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = easeInOutCubic(progress);

      window.scrollTo(0, Math.round(startY * (1 - ease)));

      if (elapsed < duration) {
        window.requestAnimationFrame(step);
      } else {
        isAnimatingRef.current = false;
      }
    };

    window.requestAnimationFrame(step);
  };

  // SVG Circular Progress Ring parameters
  const size = 44;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - scrollProgress * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 12 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.94 }}
          onClick={scrollToTop}
          // Safe positioning: avoids mini-player overlap on mobile (bottom-24 sm:bottom-8), right side clear of safe-area insets
          className="fixed bottom-24 right-5 sm:bottom-8 sm:right-8 z-40 group flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-[#0A54B1] hover:bg-[#08428C] text-white rounded-full shadow-lg shadow-[#0A54B1]/30 hover:shadow-xl hover:shadow-[#0A54B1]/40 transition-colors duration-200 cursor-pointer print:hidden no-print focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
          aria-label="Scroll to top"
        >
          {/* Circular Progress Ring */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5"
            viewBox={`0 0 ${size} ${size}`}
          >
            {/* Background Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              className="text-white/20"
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="transparent"
            />
            {/* Dynamic Progress Fill */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              className="text-[#52CEDE] transition-all duration-150 ease-out"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Up Arrow with subtle hover lift */}
          <ArrowUp className="w-5 h-5 relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
