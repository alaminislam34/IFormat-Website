"use client";

import React from "react";
import { Clock, MapPin, DollarSign, Calendar } from "lucide-react";
import { Job } from "../job-card";

interface JobDetailsBadgesProps {
  job: Job;
}

export function JobDetailsBadges({ job }: JobDetailsBadgesProps) {
  const displayDate = job.date || (job.createdAt ? new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Jun 10");

  return (
    <div className="px-6 sm:px-7 py-4 flex flex-wrap gap-2.5 items-center bg-white border-b border-slate-100 shrink-0">
      {/* Full Time pill */}
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
        <Clock className="w-3.5 h-3.5 text-emerald-600" />
        <span>{job.jobType || "Full Time"}</span>
      </span>

      {/* Remote/Location pill */}
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
        <MapPin className="w-3.5 h-3.5 text-blue-600" />
        <span>{job.location || "Remote"}</span>
      </span>

      {/* Salary pill */}
      {job.salary && (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200/80">
          <span className="font-bold text-teal-600">$</span>
          <span>{job.salary.replace(/^\$/, "")}</span>
        </span>
      )}

      {/* Posted Date pill */}
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200/80">
        <Calendar className="w-3.5 h-3.5 text-rose-500" />
        <span>Posted {displayDate}</span>
      </span>
    </div>
  );
}
