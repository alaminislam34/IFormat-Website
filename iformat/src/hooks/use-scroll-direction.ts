"use client";

import { useState, useEffect, useRef } from "react";
import { useLenis } from "lenis/react";

export function useScrollDirection(threshold = 8) {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  const lastScrollY = useRef(0);
  const lenis = useLenis(({ scroll }) => {
    const current = scroll;
    const diff = current - lastScrollY.current;

    setIsAtTop(current < 40);
    setScrollY(current);

    if (Math.abs(diff) >= threshold) {
      setScrollDirection(diff > 0 ? "down" : "up");
      lastScrollY.current = current;
    }
  });

  // Fallback: native scroll listener when Lenis is not available
  useEffect(() => {
    if (lenis) return; // Lenis callback above handles it

    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const current = window.scrollY;
          const diff = current - lastY;
          setIsAtTop(current < 40);
          setScrollY(current);
          if (Math.abs(diff) >= threshold) {
            setScrollDirection(diff > 0 ? "down" : "up");
            lastY = current;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lenis, threshold]);

  return { scrollDirection, isAtTop, scrollY };
}
