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
  return (
    <section className="py-20 sm:py-24 bg-white border-t border-slate-100 overflow-hidden" id="partners">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header using SectionHeader component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeader
            title="Our Partners"
            className="mb-14 sm:mb-16"
          >
            <div className="w-14 h-1 bg-[#00D2EE] rounded-full mx-auto -mt-2" />
          </SectionHeader>
        </motion.div>

        {/* Partners Logos Grid: 2 rows of 5 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-12 items-center justify-items-center">
          {PARTNER_LOGOS.map((partner, idx) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="w-full flex items-center justify-center p-3 h-20 sm:h-24"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={partner.src}
                  alt={partner.name}
                  width={partner.width}
                  height={partner.height}
                  className="max-h-12 sm:max-h-14 md:max-h-16 w-auto object-contain transition-transform duration-300"
                  priority={idx < 5}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
