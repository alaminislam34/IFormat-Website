"use client";

import { Calendar, Users, DollarSign, Clock, MapPin } from "lucide-react";
import { Job } from "../job-card";

interface JobDetailsBadgesProps {
  job: Job;
  applicantsCount?: number;
  showApplicantsBadge?: boolean;
}

export function JobDetailsBadges({
  job,
  applicantsCount,
  showApplicantsBadge,
}: JobDetailsBadgesProps) {
  const displayDate =
    job.date ||
    (job.createdAt
      ? new Date(job.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Recently");

  const hasCurrencyPrefix =
    job.salary &&
    /^(?:[\$€£¥৳]|USD|EUR|GBP|Competitive|Negotiable)/i.test(job.salary.trim());

  return (
    <div className="px-6 sm:px-8 py-3 flex flex-wrap gap-2 items-center bg-slate-50/60 border-b border-slate-100 shrink-0">

      {/* Job Type */}
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-white text-emerald-700 border border-emerald-200/70 shadow-xs">
        <Clock className="w-3 h-3 text-emerald-500" />
        {job.jobType || "Full Time"}
      </span>

      {/* Location */}
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-white text-blue-700 border border-blue-200/70 shadow-xs">
        <MapPin className="w-3 h-3 text-blue-500" />
        {job.location || "Remote"}
      </span>

      {/* Salary */}
      {job.salary && (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-white text-teal-700 border border-teal-200/70 shadow-xs">
          <DollarSign className="w-3 h-3 text-teal-500" />
          {!hasCurrencyPrefix && <span>$</span>}
          {job.salary}
        </span>
      )}

      {/* Posted date */}
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-white text-slate-600 border border-slate-200/70 shadow-xs">
        <Calendar className="w-3 h-3 text-slate-400" />
        Posted {displayDate}
      </span>

      {/* Applicants count */}
      {showApplicantsBadge &&
        typeof applicantsCount === "number" &&
        applicantsCount > 0 && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-white text-violet-700 border border-violet-200/70 shadow-xs ml-auto">
            <Users className="w-3 h-3 text-violet-500" />
            {applicantsCount} {applicantsCount === 1 ? "Applicant" : "Applicants"}
          </span>
        )}
    </div>
  );
}
