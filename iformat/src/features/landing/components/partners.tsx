"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/section-header";

interface PartnerLogo {
  id: string;
  name: string;
  src: string;
  width: number;
  height: number;
}

const PARTNER_LOGOS: PartnerLogo[] = [
  // Row 1
  {
    id: "hays",
    name: "HAYS - Working for your tomorrow",
    src: "/brands/image (9).png",
    width: 220,
    height: 70,
  },
  {
    id: "manpowergroup",
    name: "ManpowerGroup",
    src: "/brands/image (8).png",
    width: 220,
    height: 70,
  },
  {
    id: "michaelpage",
    name: "Michael Page",
    src: "/brands/image.png",
    width: 220,
    height: 70,
  },
  {
    id: "nathan-nathan",
    name: "Nathan & Nathan Human Resource Solutions",
    src: "/brands/image (7).png",
    width: 220,
    height: 70,
  },
  {
    id: "robert-half",
    name: "Robert Half Talent Solutions",
    src: "/brands/image (6).png",
    width: 220,
    height: 70,
  },
  // Row 2
  {
    id: "first-access",
    name: "First Access Consulting",
    src: "/brands/image (1).png",
    width: 200,
    height: 70,
  },
  {
    id: "resource-right",
    name: "Resource Right",
    src: "/brands/image (5).png",
    width: 200,
    height: 70,
  },
  {
    id: "tbh",
    name: "TBH - Think Big, Honestly.",
    src: "/brands/image (4).png",
    width: 180,
    height: 70,
  },
  {
    id: "ics",
    name: "ics - We Know The Right People",
    src: "/brands/image (3).png",
    width: 180,
    height: 70,
  },
  {
    id: "iris-executives",
    name: "IRIS EXECUTIVES - Nationalisation at Heart!",
    src: "/brands/image (2).png",
    width: 200,
    height: 70,
  },
];

export function Partners() {
  const marqueeItems = [...PARTNER_LOGOS, ...PARTNER_LOGOS];

  return (
    <section className="py-20 sm:py-24 bg-white border-t border-slate-100 overflow-hidden" id="partners">
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeader
            title="Our Partners"
            className="mb-6"
          >
            <div className="w-14 h-1 bg-[#00D2EE] rounded-full mx-auto -mt-2" />
          </SectionHeader>
        </motion.div>
      </div>

      {/* Infinite Horizontal Smooth Marquee (Flowing Right to Left) */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Edge Gradient Fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-white to-transparent z-10" />

        <motion.div
          className="flex items-center gap-12 sm:gap-16 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: 28,
            ease: "linear",
          }}
        >
          {marqueeItems.map((partner, idx) => (
            <div
              key={`${partner.id}-${idx}`}
              className="flex items-center justify-center shrink-0 px-4 py-2 group cursor-pointer"
            >
              <Image
                src={partner.src}
                alt={partner.name}
                width={partner.width}
                height={partner.height}
                className="max-h-12 sm:max-h-14 w-auto object-contain filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105"
                priority={idx < 5}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
