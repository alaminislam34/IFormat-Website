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
        <Link href="/dashboard">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs rounded-xl cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Dashboard
          </Button>
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-xs text-slate-400 font-medium">Job Postings</span>
        <span className="text-slate-600">/</span>
        <span className="text-xs text-white font-semibold">Applicants & AI Screening</span>
      </div>

      {/* Job Header Card */}
      <div className="bg-linear-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {job?.category || "Job Listing"}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
              {(job?.status || "PUBLISHED").toLowerCase()}
            </span>
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              {job?.company || userCompanyName || "Your Company"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {job?.title || "Job Applicants"}
          </h1>
          <p className="text-xs text-slate-400 flex items-center gap-4 flex-wrap">
            <span>Location: {job?.location || "Remote"}</span>
            <span>•</span>
            <span>Type: {job?.jobType || "Full Time"}</span>
            <span>•</span>
            <span>
              Total Applicants: <strong className="text-white font-semibold">{totalApplicants}</strong>
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={onRefresh}
            variant="outline"
            disabled={loading}
            className="border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs h-10 px-4 rounded-xl cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh Data
          </Button>
        </div>
      </div>
    </div>
  );
}
