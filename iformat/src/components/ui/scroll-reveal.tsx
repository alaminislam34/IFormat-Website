"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  yOffset?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  delay = 0,
  yOffset = 30,
  className = "w-full",
}: ScrollRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{
        once: true,
        margin: "0px 0px -5% 0px", // Trigger slightly before element is fully in view — feels earlier and snappier
      }}
      transition={{
        duration: 0.65,
        delay,
        ease: [0.22, 1, 0.36, 1], // Refined expo out easing — natural deceleration
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
