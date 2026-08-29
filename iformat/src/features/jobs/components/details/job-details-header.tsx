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
  const logoLetter = job.logoLetter || job.company?.charAt(0)?.toUpperCase() || "C";
  const logoBg = job.logoBg || "bg-[#0A54B1]";

  return (
    <div className="p-6 border-b border-slate-100 flex items-start justify-between relative bg-slate-50/50">
      <div className="flex items-center gap-4 pr-8">
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-sm shrink-0",
            logoBg
          )}
        >
          {logoLetter}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 leading-snug tracking-tight">
            {job.title}
          </h2>
          <p className="text-sm font-semibold text-slate-500 mt-0.5">{job.company}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isEmployerOrAdmin && (
          <div className="flex items-center gap-1.5 mr-8">
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
          className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors absolute top-6 right-6 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
