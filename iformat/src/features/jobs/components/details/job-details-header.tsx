"use client";

import React from "react";
import { Edit3, Trash2, Loader2, X, MapPin, Briefcase, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Job } from "../job-card";

interface JobDetailsHeaderProps {
  job: Job;
  isEmployerOrAdmin: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function JobDetailsHeader({
  job,
  isEmployerOrAdmin,
  isDeleting,
  onEdit,
  onDelete,
  onClose,
}: JobDetailsHeaderProps) {
  const [imgError, setImgError] = React.useState(false);
  const logoUrl = job.companyLogoUrl || job.employer?.companyLogoUrl;
  const logoLetter = job.logoLetter || job.company?.charAt(0)?.toUpperCase() || "F";
  const logoBg = job.logoBg || "bg-gradient-to-br from-violet-500 to-purple-700";

  return (
    <div className="relative shrink-0 border-b border-slate-100 overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-[#0A54B1]/8 via-slate-50 to-[#52CEDE]/10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(82,206,222,0.08),transparent_60%)] pointer-events-none" />

      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-white/80 backdrop-blur-sm transition-all border border-slate-200/60 shadow-xs cursor-pointer"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative z-10 px-6 sm:px-8 pt-6 pb-5">
        <div className="flex items-start gap-4 pr-10">
          <div
            className={cn(
              "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-md ring-2 ring-white border border-slate-100/60",
              !logoUrl || imgError ? logoBg : "bg-white"
            )}
          >
            {logoUrl && !imgError ? (
              <img
                src={logoUrl}
                alt={`${job.company} logo`}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-white font-black text-xl tracking-tight">
                {logoLetter}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight truncate pr-2">
              {job.title}
            </h2>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-slate-600">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {job.company}
              </span>

              {job.location && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  {job.location}
                </span>
              )}

              {job.jobType && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                  <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                  {job.jobType}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Actively Hiring
              </span>

              {job.salary && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0A54B1]/6 border border-[#0A54B1]/15 text-[11px] font-bold text-[#0A54B1]">
                  {!/^(?:[\$€£¥৳]|USD|EUR|GBP|Competitive|Negotiable)/i.test(job.salary.trim()) && (
                    <span>$</span>
                  )}
                  {job.salary}
                </span>
              )}
            </div>
          </div>
        </div>

        {isEmployerOrAdmin && (
          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-100/80">
       
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0A54B1] border border-sky-200/80 font-bold text-xs transition-all hover:shadow-sm cursor-pointer"
              title="Edit this job posting"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Job
            </button>
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 font-bold text-xs transition-all hover:shadow-sm cursor-pointer disabled:opacity-60"
              title="Delete this job posting"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
