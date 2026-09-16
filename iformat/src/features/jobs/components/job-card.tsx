"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, ArrowRight, CheckCircle2, Users, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { JobDTO as Job, JobApplicantDTO as Applicant } from "@/types/api";

export type { Job, Applicant };

interface JobCardProps {
  job: Job;
  onViewDetails: () => void;
  isApplied?: boolean;
  isEmployer?: boolean;
}

export function JobCard({
  job,
  onViewDetails,
  isApplied = false,
  isEmployer = false,
}: JobCardProps) {
  const router = useRouter();

  const handleCompanyNavigation = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (job.company) {
      router.push(`/companies/${encodeURIComponent(job.company.trim())}`);
    }
  };

  const displayDate = React.useMemo(() => {
    if (job.date && !job.date.includes("-") && !job.date.includes("/")) {
      return job.date;
    }
    const targetDate = job.createdAt || job.date;
    if (!targetDate) return "Active";
    try {
      const d = new Date(targetDate);
      if (isNaN(d.getTime())) return job.date || "Active";
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return job.date || "Active";
    }
  }, [job.date, job.createdAt]);

  const logoLetter = job.logoLetter || job.company?.charAt(0)?.toUpperCase() || "C";
  const logoBg = job.logoBg || "bg-[#0A54B1]";
  const companyLogo = job.companyLogoUrl || job.employer?.companyLogoUrl;
  const applicantCount = job._count?.applications ?? job.applicants?.length ?? 0;

  const rawSalary = job.salary?.trim() || "";
  const hasCurrencyOrText = /^(?:[\$€£¥৳]|USD|EUR|GBP|BDT|CAD|AUD|Competitive|Negotiable)/i.test(rawSalary);
  const salaryString = rawSalary
    ? hasCurrencyOrText
      ? rawSalary
      : `$${rawSalary}`
    : "Negotiable";

  const employerTypeStyles: Record<string, string> = {
    "Full Time": "bg-emerald-50 text-emerald-600 border border-emerald-100/60",
    "Part Time": "bg-indigo-50 text-indigo-600 border border-indigo-100/60",
    Contract: "bg-amber-50 text-amber-600 border border-amber-100/60",
    Remote: "bg-sky-50 text-sky-600 border border-sky-100/60",
  };
  const employerTypeBadgeClass =
    employerTypeStyles[job.jobType] || "bg-emerald-50 text-emerald-600 border border-emerald-100/60";

  const seekerTypeStyles: Record<string, string> = {
    "Full Time": "text-[#0A54B1] bg-sky-50/80 border border-sky-100",
    "Part Time": "text-indigo-600 bg-indigo-50/70 border border-indigo-100",
    Contract: "text-amber-600 bg-amber-50/70 border border-amber-100",
    Remote: "text-emerald-600 bg-emerald-50/70 border border-emerald-100",
  };
  const seekerTypeClass =
    seekerTypeStyles[job.jobType] || "text-slate-600 bg-slate-50 border border-slate-100";

  const locationStyles: Record<string, string> = {
    Remote: "text-sky-600 bg-sky-50/70 border border-sky-100",
    Onsite: "text-slate-600 bg-slate-50/70 border border-slate-100",
    Hybrid: "text-purple-600 bg-purple-50/70 border border-purple-100",
  };
  const locationClass =
    locationStyles[job.location] || "text-sky-600 bg-sky-50 border border-sky-100";

  // 1. Company View: includes the full-width "View Details" button at the bottom
  if (isEmployer) {
    return (
      <div
        onClick={onViewDetails}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onViewDetails();
          }
        }}
        role="button"
        tabIndex={0}
        className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-slate-200/90 relative overflow-hidden group cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/30 transition-all duration-200 ease-out select-none"
      >
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5 text-rose-500 font-bold text-xs">
              <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>{displayDate}</span>
            </div>

            <div className="flex items-center gap-2">
              {applicantCount > 0 && (
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Users className="w-3 h-3" /> {applicantCount}
                </span>
              )}
              <span className={cn("text-xs font-bold px-3 py-1 rounded-full", employerTypeBadgeClass)}>
                {job.jobType || "Full Time"}
              </span>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 tracking-tight leading-snug line-clamp-2 mt-2 mb-4 group-hover:text-[#0A54B1] transition-colors">
            {job.title}
          </h3>

          <div className="flex items-center justify-between gap-3 pt-1">
            <div
              onClick={handleCompanyNavigation}
              className="flex items-center gap-2.5 min-w-0 group/company hover:opacity-85 transition-opacity cursor-pointer"
              title={`View ${job.company} company profile`}
            >
              <div className="w-8 h-8 rounded-xl bg-black text-white font-extrabold text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-2xs group-hover/company:ring-2 group-hover/company:ring-[#0A54B1]/40 transition-all">
                {companyLogo ? (
                  <img
                    src={companyLogo}
                    alt={`${job.company} logo`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span>{logoLetter}</span>
                )}
              </div>
              <span className="text-sm font-semibold text-slate-600 truncate group-hover/company:text-[#0A54B1] group-hover/company:underline">
                {job.company}
              </span>
            </div>

            <div className="flex items-center gap-1 text-sky-500 font-bold text-xs shrink-0">
              <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span>{job.location}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-emerald-600 font-extrabold text-lg mt-4 mb-6">
            <span className="font-bold text-base">$</span>
            <span>{salaryString}</span>
          </div>
        </div>

        {/* Company View: Full-width button */}
        <div className="w-full h-12 rounded-2xl bg-slate-50 group-hover:bg-slate-100 text-slate-700 group-hover:text-slate-900 font-bold text-sm flex items-center justify-center gap-2 transition-all border border-slate-100 group-hover:border-slate-200 mt-auto">
          <span>View Details</span>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-800 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    );
  }

  // 2. Seeker / Candidate View: Original layout with bottom location/salary row and small square arrow button
  return (
    <div
      onClick={onViewDetails}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onViewDetails();
        }
      }}
      role="button"
      tabIndex={0}
      className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-slate-200/90 relative overflow-hidden group cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/30 transition-all duration-200 ease-out select-none"
    >
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-1.5 text-rose-500 font-bold text-xs">
            <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>{displayDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {isApplied && (
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Applied
              </span>
            )}
            <span className={cn("text-xs font-semibold px-3 py-1.5 rounded-xl", seekerTypeClass)}>
              {job.jobType}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900 tracking-tight group-hover:text-[#0A54B1] transition-colors line-clamp-2">
            {job.title}
          </h3>

          <div
            onClick={handleCompanyNavigation}
            className="flex items-center gap-3 mt-3 group/company hover:opacity-85 transition-opacity cursor-pointer max-w-full"
            title={`View ${job.company} company profile`}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center overflow-hidden text-white font-bold text-sm shadow-xs shrink-0 border border-slate-100 group-hover/company:ring-2 group-hover/company:ring-[#0A54B1]/40 transition-all",
                !companyLogo ? logoBg : "bg-white"
              )}
            >
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={`${job.company} logo`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                logoLetter
              )}
            </div>
            <span className="text-sm font-semibold text-slate-600 truncate group-hover/company:text-[#0A54B1] group-hover/company:underline">
              {job.company}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100/80 flex items-center justify-between mt-auto">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className={cn("px-1.5 py-0.5 rounded text-[11px] font-semibold", locationClass)}>
              {job.location}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[#0A54B1] font-bold text-xs">
            <DollarSign className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span>{job.salary || salaryString}</span>
          </div>
        </div>

        <div
          className="flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-50 group-hover:bg-[#0A54B1] text-slate-400 group-hover:text-white transition-all duration-300 shadow-xs"
          title="View Job Details"
        >
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
  );
}
