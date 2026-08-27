"use client";

import { motion } from "framer-motion";
import { MapPin, ArrowRight, DollarSign, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { JobDTO as Job, JobApplicantDTO as Applicant } from "@/types/api";
export type { Job, Applicant };

interface JobCardProps {
  job: Job;
  onViewDetails: () => void;
  isApplied?: boolean;
}

export function JobCard({ job, onViewDetails, isApplied = false }: JobCardProps) {
  const typeStyles: Record<string, string> = {
    "Full Time": "text-[#0A54B1] bg-sky-50/80 border border-sky-100",
    "Part Time": "text-indigo-600 bg-indigo-50/70 border border-indigo-100",
    Contract: "text-amber-600 bg-amber-50/70 border border-amber-100",
  };

  const locationStyles: Record<string, string> = {
    Remote: "text-sky-600 bg-sky-50/70 border border-sky-100",
    Onsite: "text-slate-600 bg-slate-50/70 border border-slate-100",
    Hybrid: "text-purple-600 bg-purple-50/70 border border-purple-100",
  };

  const typeClass = typeStyles[job.jobType] || "text-slate-600 bg-slate-50 border border-slate-100";
  const locationClass = locationStyles[job.location] || "text-sky-600 bg-sky-50 border border-sky-100";
  const displayDate = job.date || (job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Active");
  const logoLetter = job.logoLetter || job.company?.charAt(0)?.toUpperCase() || "C";
  const logoBg = job.logoBg || "bg-[#0A54B1]";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={onViewDetails}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onViewDetails();
        }
      }}
      role="button"
      tabIndex={0}
      className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/30 transition-all select-none"
    >
      {/* Top Badges */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100">
          📅 {displayDate}
        </span>
        <div className="flex items-center gap-1.5">
          {isApplied && (
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Applied
            </span>
          )}
          <span className={cn("text-xs font-semibold px-3 py-1.5 rounded-xl", typeClass)}>
            {job.jobType}
          </span>
        </div>
      </div>

      {/* Title & Company */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight group-hover:text-primary transition-colors min-h-14 line-clamp-2">
          {job.title}
        </h3>
        
        <div className="flex items-center gap-3 mt-3">
          {/* Logo Circle */}
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0",
              logoBg
            )}
          >
            {logoLetter}
          </div>
          <span className="text-sm font-semibold text-slate-600 truncate">{job.company}</span>
        </div>
      </div>

      {/* Location & Salary */}
      <div className="pt-4 border-t border-slate-100/80 flex items-center justify-between mt-auto">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className={cn("px-1.5 py-0.5 rounded text-[11px] font-semibold", locationClass)}>
              {job.location}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[#0A54B1] font-bold text-xs">
            <DollarSign className="w-3.5 h-3.5 text-sky-500" />
            <span>{job.salary}</span>
          </div>
        </div>

        {/* View Details Button */}
        <div
          className="flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-50 group-hover:bg-primary text-slate-400 group-hover:text-white transition-all duration-300 shadow-xs"
          title="View Job Details"
        >
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </motion.div>
  );
}

