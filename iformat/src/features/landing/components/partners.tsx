"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, Building2, Handshake } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import {
  useLandingContentStore,
  DEFAULT_PARTNERS_SETTINGS,
} from "@/stores/use-landing-content-store";

export function Partners() {
  const { partnersSettings, isHydrated, syncWithBackend } = useLandingContentStore();

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  const activeSettings = isHydrated ? partnersSettings : DEFAULT_PARTNERS_SETTINGS;
  const { sectionTitle, sectionDescription, members } = activeSettings;

  if (!members || members.length === 0) return null;

  return (
    <section className="py-24 bg-slate-50/70 border-t border-slate-100 overflow-hidden" id="partners">
      <div className="max-w-360 mx-auto w-11/12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeader
            title={sectionTitle || "Strategic Partners"}
            description={
              sectionDescription ||
              "Collaborating with elite global talent networks, venture builders, and executive organizations."
            }
          />
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {members.map((partner, idx) => {
            const cardContent = (
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                key={partner.id || idx}
                className="relative rounded-3xl overflow-hidden aspect-3/4 group shadow-md hover:shadow-xl transition-all duration-500 bg-slate-900"
              >
                {/* Partner Image */}
                {partner.image ? (
                  <Image
                    src={partner.image}
                    alt={partner.name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                    <Handshake className="w-12 h-12" />
                  </div>
                )}

                {/* Dark Vignette / Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-[#0f172a]/95 via-[#0f172a]/40 to-transparent transition-opacity" />

                {/* External Link Indicator if URL provided */}
                {partner.link && (
                  <div className="absolute top-3.5 right-3.5 z-10 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Partner Details at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                  {partner.company && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/60 border border-cyan-500/20 px-2 py-0.5 rounded-md backdrop-blur-xs mb-1.5 truncate max-w-full">
                      <Building2 className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{partner.company}</span>
                    </span>
                  )}
                  <h3 className="text-white font-bold text-lg sm:text-xl leading-tight mb-1 truncate">
                    {partner.name}
                  </h3>
                  <p className="text-brand-cyan font-medium text-xs sm:text-sm leading-tight line-clamp-1">
                    {partner.position}
                  </p>
                </div>
              </motion.div>
            );

            if (partner.link) {
              return (
                <Link
                  key={partner.id || idx}
                  href={partner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block cursor-pointer"
                >
                  {cardContent}
                </Link>
              );
            }

            return cardContent;
          })}
        </div>
      </div>
    </section>
  );
}
