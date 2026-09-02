"use client";

import React from "react";
import { Briefcase, Users, Sparkles, TrendingUp, CheckCircle2, Clock, Award } from "lucide-react";
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

    const allApplicants = employerJobs.flatMap((j) => j.applicants || []);
    const aiScreenedCount = allApplicants.filter(
      (a) => a.screeningResult || a.status === "SCREENED" || a.status === "SHORTLISTED"
    ).length;

    const scoredApplicants = allApplicants.filter(
      (a) => a.screeningResult?.score != null && typeof a.screeningResult.score === "number"
    );

    const avgMatchScore =
      scoredApplicants.length > 0
        ? `${Math.round(
            scoredApplicants.reduce((sum, a) => sum + (a.screeningResult?.score || 0), 0) /
              scoredApplicants.length
          )}%`
        : totalApplicants > 0
        ? "Processing"
        : "0%";

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-50 text-[#0A54B1] rounded-2xl flex items-center justify-center shrink-0 border border-blue-100">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{employerJobs.length}</div>
            <div className="text-xs text-slate-500 font-semibold">Active Job Postings</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{totalApplicants}</div>
            <div className="text-xs text-slate-500 font-semibold">Total Applicants</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 border border-amber-100">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{aiScreenedCount}</div>
            <div className="text-xs text-slate-500 font-semibold">AI Screened Candidates</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center shrink-0 border border-sky-100">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{avgMatchScore}</div>
            <div className="text-xs text-slate-500 font-semibold">Avg Candidate Match</div>
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

  const interviewOffersCount = applications.filter(
    (a) => a.status === "INTERVIEWING" || a.status === "OFFERED" || a.status === "HIRED"
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 bg-blue-50 text-[#0A54B1] rounded-2xl flex items-center justify-center shrink-0 border border-blue-100">
          <Briefcase className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-extrabold text-slate-900">{applications.length}</div>
          <div className="text-xs text-slate-500 font-semibold">Jobs Applied</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-extrabold text-slate-900">{screenedCount}</div>
          <div className="text-xs text-slate-500 font-semibold">AI Screened / Shortlisted</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 border border-amber-100">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-extrabold text-slate-900">{inReviewCount}</div>
          <div className="text-xs text-slate-500 font-semibold">In Active Review</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0 border border-purple-100">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-extrabold text-slate-900">{interviewOffersCount}</div>
          <div className="text-xs text-slate-500 font-semibold">Interviews & Offers</div>
        </div>
      </div>
    </div>
  );
}
