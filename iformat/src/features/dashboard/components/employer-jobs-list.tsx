"use client";

import React from "react";
import Link from "next/link";
import { Building, ChevronRight, Users, Edit3, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobDTO } from "@/types/api";

interface EmployerJobsListProps {
  employerJobs: JobDTO[];
  loading: boolean;
  deletingJobId: string | null;
  onEditJob: (job: JobDTO) => void;
  onDeleteJob: (jobId: string, title: string) => void;
}

export function EmployerJobsList({
  employerJobs,
  loading,
  deletingJobId,
  onEditJob,
  onDeleteJob,
}: EmployerJobsListProps) {
  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm animate-pulse">
        Loading dashboard data...
      </div>
    );
  }

  if (employerJobs.length === 0) {
    return (
      <div className="py-12 text-center space-y-3">
        <Building className="w-10 h-10 text-slate-600 mx-auto" />
        <p className="text-slate-400 text-sm">No job postings created yet.</p>
        <Link href="/company-details">
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer">
            Create Your First Job Posting
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-800">
      {employerJobs.map((job) => (
        <div key={job.id} className="py-4 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href={`/dashboard/jobs/${job.id}/applicants`}
              className="font-medium text-white text-sm hover:text-indigo-400 transition-colors flex items-center gap-1.5 group"
            >
              <span>{job.title}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-indigo-400" />
            </Link>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>{job.category}</span>
              <span>•</span>
              <span>{job.location}</span>
              <span>•</span>
              <span className="capitalize text-emerald-400">
                {(job.status || "PUBLISHED").toLowerCase()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <Link href={`/dashboard/jobs/${job.id}/applicants`}>
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-8 border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-indigo-300 rounded-xl cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                Applicants ({job._count?.applications || job.applicants?.length || 0})
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEditJob(job)}
              className="text-xs h-8 px-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl cursor-pointer"
              title="Edit Job Details"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1 text-sky-400" /> Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDeleteJob(job.id, job.title)}
              disabled={deletingJobId === job.id}
              className="text-xs h-8 px-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl cursor-pointer"
              title="Delete Job Posting"
            >
              {deletingJobId === job.id ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
