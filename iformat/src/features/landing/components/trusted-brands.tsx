"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const BRAND_LOGOS_ROW_1 = [
  "image1.png",
  "image2.png",
  "image3.png",
  "image4.png",
  "image5.png",
  "image6.png",
  "image7.png",
  "image8.png",
  "image9.png",
  "image10.png",
];

const BRAND_LOGOS_ROW_2 = [
  "image11.png",
  "image12.png",
  "image13.png",
  "image14.png",
  "image15.png",
  "image16.png",
  "image17.png",
  "image18.png",
  "image19.png",
  "image1.png",
];

export function TrustedBrands() {
  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-6 mb-14 text-center">
        <ScrollReveal yOffset={25}>
          {/* 100% SATISFACTION GUARANTEED BADGE */}
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-slate-950 text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] shadow-md mb-5 border border-slate-800">
            100% Satisfaction Guaranteed
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0B1528] tracking-tight max-w-3xl mx-auto leading-snug">
            Our CV Writing Service Helped Clients Land Roles at These Companies
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-3 max-w-xl mx-auto font-medium">
            Trusted by senior professionals and executives placed across top-tier multinational organizations.
          </p>
        </ScrollReveal>
      </div>

      {/* Row 1: Leftward Infinite Marquee */}
      <div className="relative w-full overflow-hidden flex mb-6">
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-36 bg-linear-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-36 bg-linear-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 32,
            ease: "linear",
            repeat: Infinity,
          }}
          className="flex w-max items-center"
        >
          {[0, 1].map((set) => (
            <div key={`brand-set-1-${set}`} className="flex gap-6 pr-6 items-center">
              {BRAND_LOGOS_ROW_1.map((src, idx) => (
                <div
                  key={`brand-1-${set}-${src}-${idx}`}
                  className="relative w-36 sm:w-44 h-20 sm:h-24 px-4 py-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-sky-300 transition-all duration-300 flex items-center justify-center shrink-0 group"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={`/brands_images/${src}`}
                      alt={`Target Company Logo ${idx + 1}`}
                      fill
                      sizes="(max-width: 640px) 144px, 176px"
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Row 2: Rightward Infinite Marquee */}
      <div className="relative w-full overflow-hidden flex">
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-36 bg-linear-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-36 bg-linear-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

        <motion.div
          animate={{ x: ["-50%", "0%"] }}
          transition={{
            duration: 35,
            ease: "linear",
            repeat: Infinity,
          }}
          className="flex w-max items-center"
        >
          {[0, 1].map((set) => (
            <div key={`brand-set-2-${set}`} className="flex gap-6 pr-6 items-center">
              {BRAND_LOGOS_ROW_2.map((src, idx) => (
                <div
                  key={`brand-2-${set}-${src}-${idx}`}
                  className="relative w-36 sm:w-44 h-20 sm:h-24 px-4 py-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-sky-300 transition-all duration-300 flex items-center justify-center shrink-0 group"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={`/brands_images/${src}`}
                      alt={`Target Company Logo ${idx + 11}`}
                      fill
                      sizes="(max-width: 640px) 144px, 176px"
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
