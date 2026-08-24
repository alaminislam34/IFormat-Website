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
      const targetId = window.location.hash;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        // Smoothly scroll to the hash target with navbar offset
        lenis.scrollTo(targetId, {
          offset: -80,
          duration: 1.2,
          immediate: false,
        });
        return;
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
        const hash = href.startsWith("/#") ? href.slice(1) : href;
        if (hash === "#") return;

        const targetEl = document.querySelector(hash);
        if (targetEl) {
          e.preventDefault();
          lenis.scrollTo(hash, {
            offset: -80,
            duration: 1.2,
          });
          // Update URL without jump
          window.history.pushState(null, "", hash);
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
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.4,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
      }}
    >
      <LenisNavigationHandler />
      {children}
    </ReactLenis>
  );
}
