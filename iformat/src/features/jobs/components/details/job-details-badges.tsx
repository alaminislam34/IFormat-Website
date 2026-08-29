"use client";

import React from "react";
import { MapPin, DollarSign, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Job } from "../job-card";

interface JobDetailsBadgesProps {
  job: Job;
}

export function JobDetailsBadges({ job }: JobDetailsBadgesProps) {
  const typeStyles: Record<string, string> = {
    "Full Time": "text-[#0A54B1] bg-sky-50 border border-sky-100",
    "Part Time": "text-indigo-600 bg-indigo-50 border border-indigo-100",
    Contract: "text-amber-600 bg-amber-50 border border-amber-100",
  };

  const locationStyles: Record<string, string> = {
    Remote: "text-sky-600 bg-sky-50 border border-sky-100",
    Onsite: "text-slate-600 bg-slate-50 border border-slate-100",
    Hybrid: "text-purple-600 bg-purple-50 border border-purple-100",
  };

  const typeClass = typeStyles[job.jobType] || "text-slate-600 bg-slate-50 border border-slate-100";
  const locationClass = locationStyles[job.location] || "text-sky-600 bg-sky-50 border border-sky-100";
  const displayDate = job.date || (job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Active");

  return (
    <div className="px-6 py-4 flex flex-wrap gap-2 items-center bg-white border-b border-slate-50">
      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-lg", typeClass)}>
        {job.jobType}
      </span>
      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-lg", locationClass)}>
        <MapPin className="w-3.5 h-3.5 inline mr-1" />
        {job.location}
      </span>
      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
        <DollarSign className="w-3.5 h-3.5 inline mr-1" />
        {job.salary}
      </span>
      <span className="text-xs font-semibold text-rose-500 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-lg">
        <Calendar className="w-3.5 h-3.5 inline mr-1" />
        Posted {displayDate}
      </span>
    </div>
  );
}
