"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, Building2, Handshake } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useLandingContentStore,
  DEFAULT_PARTNERS_SETTINGS,
} from "@/stores/use-landing-content-store";

function PartnersSkeleton() {
  return (
    <section className="py-24 bg-slate-50/70 border-t border-slate-100 overflow-hidden" id="partners">
      <div className="max-w-360 mx-auto w-11/12">
        <div className="max-w-2xl mx-auto text-center mb-16 space-y-3">
          <Skeleton className="h-9 w-64 mx-auto rounded-xl bg-slate-200" />
          <Skeleton className="h-5 w-96 mx-auto rounded-lg bg-slate-200" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="relative rounded-3xl overflow-hidden aspect-3/4 bg-slate-200/90 animate-pulse p-5 flex flex-col justify-end"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 rounded-md bg-slate-300" />
                <Skeleton className="h-6 w-32 rounded-md bg-slate-300" />
                <Skeleton className="h-4 w-24 rounded-md bg-slate-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Partners() {
  const { partnersSettings, isHydrated, isLoading, syncWithBackend } = useLandingContentStore();

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  if (!isHydrated || isLoading) {
    return <PartnersSkeleton />;
  }

  const activeSettings = partnersSettings || DEFAULT_PARTNERS_SETTINGS;
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
            title={sectionTitle || "Recruitment Partners"}
            description={
              sectionDescription ||
              "Collaborating with elite global talent networks, venture builders, and executive organizations."
            }
          />
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {members.map((partner, idx) => {
            const hasValidImage =
              partner.image &&
              !partner.image.includes("images.unsplash.com") &&
              partner.image.trim() !== "";

            const cardContent = (
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                key={partner.id || idx}
                className="relative rounded-3xl overflow-hidden aspect-3/4 group shadow-md hover:shadow-xl transition-all duration-500 bg-slate-900 flex flex-col justify-end"
              >
                {hasValidImage ? (
                  <Image
                    src={partner.image}
                    alt={partner.name}
                    fill
                    unoptimized={partner.image?.startsWith("http") || partner.image?.startsWith("data:")}
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 bg-linear-to-b from-slate-800 to-slate-950 flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                      <Handshake className="w-7 h-7 text-cyan-400" />
                    </div>
                    {partner.company && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400/80 bg-cyan-950/60 border border-cyan-500/20 px-2 py-0.5 rounded-md mb-2 line-clamp-1">
                        {partner.company}
                      </span>
                    )}
                  </div>
                )}

                <div className="absolute inset-0 bg-linear-to-t from-[#0f172a]/95 via-[#0f172a]/40 to-transparent transition-opacity" />
                <div className="relative p-5 z-10">
                  {partner.company && hasValidImage && (
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
            return cardContent;
          })}
        </div>
      </div>
    </section>
  );
}
