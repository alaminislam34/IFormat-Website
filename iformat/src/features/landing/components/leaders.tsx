"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useLandingContentStore,
  DEFAULT_LEADERS_SETTINGS,
} from "@/stores/use-landing-content-store";
import { getMediaUrl } from "@/lib/utils";

function LeadersSkeleton() {
  return (
    <section className="py-24 bg-white overflow-hidden" id="leaders">
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

export function Leaders() {
  const { leadersSettings, isHydrated, isLoading, syncWithBackend } = useLandingContentStore();

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  if (!isHydrated || isLoading) {
    return <LeadersSkeleton />;
  }

  const activeSettings = leadersSettings || DEFAULT_LEADERS_SETTINGS;
  const { sectionTitle, sectionDescription, members } = activeSettings;

  if (!members || members.length === 0) return null;

  return (
    <section className="py-24 bg-white overflow-hidden" id="leaders">
      <div className="max-w-360 mx-auto w-11/12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeader
            title={sectionTitle || "MEET OUR EXPERTS"}
            description={
              sectionDescription ||
              "It is our privilege to introduce the talented individuals behind our success. Our team of personal branding experts is dedicated to helping you craft a powerful, authentic personal brand that resonates with your audience and achieves your goals."
            }
          />
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {members.map((leader, idx) => {
            const mediaUrl = getMediaUrl(leader.image);
            const hasValidImage = Boolean(mediaUrl && mediaUrl.trim() !== "");

            return (
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                key={leader.id || idx} 
                className="relative rounded-3xl overflow-hidden aspect-3/4 group shadow-md bg-slate-900 flex flex-col justify-end"
              >
                {hasValidImage ? (
                  <Image 
                    src={mediaUrl} 
                    alt={leader.name}
                    fill
                    unoptimized
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 bg-linear-to-b from-slate-800 to-slate-950 flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                      <User className="w-7 h-7 text-cyan-400" />
                    </div>
                  </div>
                )}
                
                {/* Gradient Overlay for text readability */}
                <div className="absolute inset-0 bg-linear-to-t from-[#0f172a]/95 via-[#0f172a]/30 to-transparent"></div>
                
                <div className="relative p-5 z-10">
                  <h3 className="text-white font-bold text-lg sm:text-xl mb-1 truncate">{leader.name}</h3>
                  <p className="text-brand-cyan font-medium text-xs sm:text-sm leading-tight truncate">{leader.role}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
