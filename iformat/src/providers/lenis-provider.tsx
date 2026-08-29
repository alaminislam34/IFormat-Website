"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, ReactNode } from "react";

function LenisNavigationHandler() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    // Check if there is a hash in the current URL
    if (typeof window !== "undefined" && window.location.hash) {
      const cleanId = window.location.hash.replace(/^#/, "").split(/[?&]/)[0];
      if (cleanId) {
        const targetEl = document.getElementById(cleanId);
        if (targetEl) {
          // Smoothly scroll to the hash target with navbar offset
          lenis.scrollTo(targetEl, {
            offset: -80,
            duration: 1.2,
            immediate: false,
          });
          return;
        }
      }
    }

    // Default: Reset scroll to top on route change
    lenis.scrollTo(0, { immediate: true });
  }, [pathname, lenis]);

  useEffect(() => {
    if (!lenis) return;

    // Intercept in-page hash anchor clicks
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // In-page hash link (e.g. #about or /#about on homepage)
      if (href.startsWith("#") || (href.startsWith("/#") && pathname === "/")) {
        const rawHash = href.startsWith("/#") ? href.slice(1) : href;
        const cleanId = rawHash.replace(/^#/, "").split(/[?&]/)[0];
        if (!cleanId) return;

        const targetEl = document.getElementById(cleanId);
        if (targetEl) {
          e.preventDefault();
          lenis.scrollTo(targetEl, {
            offset: -80,
            duration: 1.2,
          });
          // Update URL without jump
          window.history.pushState(null, "", `#${cleanId}`);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, [pathname, lenis]);

  return null;
}

interface LenisProviderProps {
  children: ReactNode;
}

export function LenisProvider({ children }: LenisProviderProps) {
  // Respect user's reduced-motion preference
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  return (
    <ReactLenis
      root
      options={{
        lerp: prefersReducedMotion ? 1 : 0.08,      // Instant scroll when user prefers reduced motion
        duration: prefersReducedMotion ? 0 : 1.2,
        smoothWheel: !prefersReducedMotion,
        wheelMultiplier: 1.1,
        touchMultiplier: 2.0,
        infinite: false,
        orientation: "vertical",
      }}
    >
      <LenisNavigationHandler />
      {children}
    </ReactLenis>
  );
}
