"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function ScrollReveal({ children, delay = 0, yOffset = 50 }: { children: ReactNode, delay?: number, yOffset?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }} // Custom spring-like easeOut
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
