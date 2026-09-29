"use client";

import { useState, useEffect, useRef } from "react";

export function useScrollDirection(threshold = 8, resetTrigger?: unknown) {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  const lastScrollY = useRef(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAtTop(window.scrollY < 40);
      setScrollY(window.scrollY);
      lastScrollY.current = window.scrollY;
      setScrollDirection(null);
    }
  }, [resetTrigger]);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const current = window.scrollY;
          const diff = current - lastScrollY.current;

          setIsAtTop(current < 40);
          setScrollY(current);

          if (Math.abs(diff) >= threshold) {
            setScrollDirection(diff > 0 ? "down" : "up");
            lastScrollY.current = current;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return { scrollDirection, isAtTop, scrollY };
}
