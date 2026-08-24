"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function TrustedBrands() {
  const brands = [
    "image.png",
    "image (1).png",
    "image (2).png",
    "image (3).png",
    "image (4).png",
    "image (5).png",
    "image (6).png",
    "image (7).png",
    "image (8).png",
    "image (9).png",
  ];

  return (
    <section className="py-16 bg-[#f8fafc] overflow-hidden">
      <ScrollReveal yOffset={20}>
        <div className="max-w-7xl mx-auto px-8 mb-10">
          <h3 className="text-center text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">
            Trusted by professionals from top organizations
          </h3>
        </div>
      </ScrollReveal>
      
      <div className="relative w-full overflow-hidden flex">
        {/* Left Gradient Mask */}
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-linear-to-r from-[#f8fafc] to-transparent z-10 pointer-events-none"></div>
        
        {/* Right Gradient Mask */}
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-linear-to-l from-[#f8fafc] to-transparent z-10 pointer-events-none"></div>

        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 35,
            ease: "linear",
            repeat: Infinity,
          }}
          className="flex w-max"
        >
          {[0, 1].map((set) => (
            <div key={`brand-set-${set}`} className="flex gap-16 md:gap-24 pr-16 md:pr-24">
              {brands.map((src, idx) => (
                <div key={`brand-${set}-${src}-${idx}`} className="relative w-32 md:w-40 h-16 shrink-0 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                  <Image
                    src={`/brands/${src}`}
                    alt={`Brand partner ${idx + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
