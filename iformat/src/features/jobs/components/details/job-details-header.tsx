"use client";

import React from "react";
import { Edit3, Trash2, Loader2, X } from "lucide-react";
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
  const logoLetter = job.logoLetter || job.company?.charAt(0)?.toUpperCase() || "F";
  const logoBg = job.logoBg || "bg-[#9333EA]";

  return (
    <div className="p-6 sm:p-7 border-b border-slate-100 flex items-start justify-between bg-white relative shrink-0">
      <div className="flex items-center gap-4 pr-6">
        {/* Rounded square avatar like in Figma screenshot */}
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xs shrink-0",
            logoBg
          )}
        >
          {logoLetter}
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
            {job.title}
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-0.5">{job.company}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isEmployerOrAdmin && (
          <div className="flex items-center gap-1.5 mr-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-50 text-[#0A54B1] hover:bg-sky-100 font-bold text-xs border border-sky-100 transition-colors cursor-pointer"
              title="Edit this job posting"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs border border-rose-100 transition-colors cursor-pointer"
              title="Delete this job posting"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
