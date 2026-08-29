"use client";

import React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="py-12 text-center text-slate-400 text-sm animate-pulse">
        Loading dashboard data...
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="py-12 text-center space-y-3">
        <Search className="w-10 h-10 text-slate-600 mx-auto" />
        <p className="text-slate-400 text-sm">You haven&apos;t applied to any jobs yet.</p>
        <Link href="/job-portal">
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer">
            Browse Open Roles
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-800">
      {applications.map((app, idx) => (
        <div key={app.id || idx} className="py-4 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-medium text-white text-sm">
              {app.candidateName || "Application Submission"}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-400">
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
              className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                app.status === "SHORTLISTED"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : app.status === "SCREENED"
                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                  : app.status === "REJECTED"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}
            >
              {app.status || "SUBMITTED"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
