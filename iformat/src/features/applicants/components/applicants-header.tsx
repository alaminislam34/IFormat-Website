"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Building, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobDTO } from "@/types/api";

interface ApplicantsHeaderProps {
  job: JobDTO | null;
  userCompanyName?: string | null;
  totalApplicants: number;
  loading: boolean;
  onRefresh: () => void;
}

export function ApplicantsHeader({
  job,
  userCompanyName,
  totalApplicants,
  loading,
  onRefresh,
}: ApplicantsHeaderProps) {
  return (
    <div className="space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/jobs">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs rounded-xl shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Job Postings
          </Button>
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-xs text-slate-500 font-medium">Job Postings</span>
        <span className="text-slate-300">/</span>
        <span className="text-xs text-slate-900 font-bold">Applicants & AI Screening</span>
      </div>

      {/* Job Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-[#0A54B1] border border-blue-200/60">
              {job?.category || "Job Listing"}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 capitalize">
              {(job?.status || "PUBLISHED").toLowerCase()}
            </span>
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              {job?.company || userCompanyName || "Your Company"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {job?.title || "Job Applicants"}
          </h1>
          <p className="text-xs text-slate-500 flex items-center gap-4 flex-wrap">
            <span>Location: <strong className="text-slate-700 font-medium">{job?.location || "Remote"}</strong></span>
            <span>•</span>
            <span>Type: <strong className="text-slate-700 font-medium">{job?.jobType || "Full Time"}</strong></span>
            <span>•</span>
            <span>
              Total Applicants: <strong className="text-[#0A54B1] font-bold">{totalApplicants}</strong>
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={onRefresh}
            variant="outline"
            disabled={loading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs h-10 px-4 rounded-xl shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-2 text-slate-500 ${loading ? "animate-spin" : ""}`} /> Refresh Data
          </Button>
        </div>
      </div>
    </div>
  );
}
