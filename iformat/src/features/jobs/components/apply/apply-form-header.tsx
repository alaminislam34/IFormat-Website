"use client";

import React from "react";
import { X } from "lucide-react";
import { JobDTO } from "@/types/api";

interface ApplyFormHeaderProps {
  job: JobDTO;
  onClose: () => void;
}

export function ApplyFormHeader({ job, onClose }: ApplyFormHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A54B1]">
          Apply for Position
        </span>
        <h3 className="text-xl font-bold text-slate-900 mt-0.5">{job.title}</h3>
        <p className="text-xs text-slate-500">
          {job.company} • {job.location}
        </p>
      </div>

      <button
        onClick={onClose}
        className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
