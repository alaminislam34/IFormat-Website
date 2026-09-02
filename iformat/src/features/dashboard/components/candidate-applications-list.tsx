"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { JobApplicantDTO } from "@/types/api";

interface CandidateApplicationsListProps {
  applications: JobApplicantDTO[];
  loading: boolean;
}

export function CandidateApplicationsList({
  applications,
  loading,
}: CandidateApplicationsListProps) {
  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm font-medium animate-pulse">
        Loading applications...
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="py-12 text-center space-y-3">
        <div className="w-12 h-12 bg-blue-50 text-[#0A54B1] rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
          <Search className="w-6 h-6" />
        </div>
        <p className="text-slate-500 text-sm font-medium">You haven&apos;t applied to any jobs yet.</p>
        <Link href="/job-portal">
          <button className="h-10 px-5 rounded-xl bg-[#0A54B1] hover:bg-[#0A54B1]/90 text-white font-bold text-xs shadow-md shadow-blue-500/15 cursor-pointer">
            Browse Open Roles
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {applications.map((app, idx) => (
        <div key={app.id || idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-sm">
              {app.candidateName || "Application Submission"}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
              <span>{app.candidateEmail || "Candidate"}</span>
              <span>•</span>
              <span>
                Applied on{" "}
                {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "Recently"}
              </span>
            </div>
          </div>
          <div>
            <span
              className={`text-xs px-3 py-1 rounded-full font-extrabold border ${
                app.status === "SHORTLISTED"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : app.status === "SCREENED"
                  ? "bg-blue-50 text-[#0A54B1] border-blue-200"
                  : app.status === "REJECTED"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {app.status || "UNDER REVIEW"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
