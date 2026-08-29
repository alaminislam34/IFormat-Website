"use client";

import React from "react";
import { Briefcase, Users, Sparkles, TrendingUp, CheckCircle2, Clock, FileText } from "lucide-react";
import { JobApplicantDTO, JobDTO } from "@/types/api";

interface DashboardStatsGridProps {
  isEmployer: boolean;
  employerJobs: JobDTO[];
  applications: JobApplicantDTO[];
}

export function DashboardStatsGrid({
  isEmployer,
  employerJobs,
  applications,
}: DashboardStatsGridProps) {
  if (isEmployer) {
    const totalApplicants = employerJobs.reduce(
      (acc, job) => acc + (job._count?.applications || job.applicants?.length || 0),
      0
    );

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{employerJobs.length}</div>
            <div className="text-xs text-slate-400">Active Job Postings</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalApplicants}</div>
            <div className="text-xs text-slate-400">Total Applicants</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">AI Active</div>
            <div className="text-xs text-slate-400">Candidate Screening</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">98.4%</div>
            <div className="text-xs text-slate-400">Candidate Match Rate</div>
          </div>
        </div>
      </div>
    );
  }

  const screenedCount = applications.filter(
    (a) => a.status === "SCREENED" || a.status === "SHORTLISTED"
  ).length;

  const inReviewCount = applications.filter(
    (a) => a.status === "SUBMITTED" || a.status === "INTERVIEWING"
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
          <Briefcase className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{applications.length}</div>
          <div className="text-xs text-slate-400">Jobs Applied</div>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{screenedCount}</div>
          <div className="text-xs text-slate-400">AI Screened / Shortlisted</div>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{inReviewCount}</div>
          <div className="text-xs text-slate-400">In Review</div>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
        <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white">Ready</div>
          <div className="text-xs text-slate-400">ATS Optimized CV</div>
        </div>
      </div>
    </div>
  );
}
