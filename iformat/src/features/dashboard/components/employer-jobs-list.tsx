"use client";

import React from "react";
import Link from "next/link";
import { Building, ChevronRight, Users, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobDTO } from "@/types/api";

interface EmployerJobsListProps {
  employerJobs: JobDTO[];
  loading: boolean;
  deletingJobId: string | null;
  onEditJob: (job: JobDTO) => void;
  onDeleteJob: (jobId: string, title: string) => void;
  onPostJobClick?: () => void;
}

export function EmployerJobsList({
  employerJobs,
  loading,
  deletingJobId,
  onEditJob,
  onDeleteJob,
  onPostJobClick,
}: EmployerJobsListProps) {
  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm font-medium animate-pulse">
        Loading dashboard data...
      </div>
    );
  }

  if (employerJobs.length === 0) {
    return (
      <div className="py-12 text-center space-y-3">
        <div className="w-12 h-12 bg-blue-50 text-[#0A54B1] rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
          <Building className="w-6 h-6" />
        </div>
        <p className="text-slate-500 text-sm font-medium">No job postings created yet.</p>
        <button
          onClick={onPostJobClick}
          className="h-10 px-5 rounded-xl bg-[#0A54B1] hover:bg-[#0A54B1]/90 text-white font-bold text-xs shadow-md shadow-blue-500/15 cursor-pointer active:scale-95 transition-all"
        >
          Create Your First Job Posting
        </button>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {employerJobs.map((job) => (
        <div key={job.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
          <div className="space-y-1">
            <Link
              href={`/dashboard/jobs/${job.id}/applicants`}
              className="font-bold text-slate-900 text-sm hover:text-[#0A54B1] transition-colors flex items-center gap-1.5 group"
            >
              <span>{job.title}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#0A54B1]" />
            </Link>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
              <span>{job.category}</span>
              <span>•</span>
              <span>{job.location}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#0A54B1] font-bold">
                <Users className="w-3.5 h-3.5" />
                {job._count?.applications || job.applicants?.length || 0} Candidates
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/dashboard/jobs/${job.id}/applicants`}>
              <button className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0A54B1] font-bold text-xs transition-colors cursor-pointer">
                View Applicants
              </button>
            </Link>
            <button
              onClick={() => onEditJob(job)}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer border border-slate-200/60"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteJob(job.id, job.title)}
              disabled={deletingJobId === job.id}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer border border-rose-200/60"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
