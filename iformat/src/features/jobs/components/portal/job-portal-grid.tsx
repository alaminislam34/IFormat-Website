"use client";

import React from "react";
import { Search, Loader2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { JobCard, Job } from "@/features/jobs/components/job-card";

interface JobPortalGridProps {
  jobs: Job[];
  visibleJobs: Job[];
  isLoading: boolean;
  isLoadingMore: boolean;
  appliedJobIds: Set<string>;
  visibleJobsCount: number;
  onSelectJob: (job: Job) => void;
  onLoadMore: () => void;
  onResetFilters: () => void;
}

export function JobPortalGrid({
  jobs,
  visibleJobs,
  isLoading,
  isLoadingMore,
  appliedJobIds,
  visibleJobsCount,
  onSelectJob,
  onLoadMore,
  onResetFilters,
}: JobPortalGridProps) {
  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between h-64 shadow-xs"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="h-5 w-16 bg-slate-100 rounded-full" />
              <div className="h-5 w-20 bg-slate-100 rounded-full" />
            </div>
            <div className="space-y-3 mb-6">
              <div className="h-6 w-3/4 bg-slate-100 rounded-md" />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100" />
                <div className="h-4 w-1/3 bg-slate-100 rounded-md" />
              </div>
            </div>
            <div className="space-y-2 pt-3 border-t border-slate-50">
              <div className="h-5 w-20 bg-slate-100 rounded-md" />
              <div className="h-5 w-28 bg-slate-100 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-xl mx-auto space-y-4 p-8">
        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
          <Search className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">No jobs found</h3>
        <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
          We couldn&apos;t find any job match for your search criteria. Try modifying your filters or search query.
        </p>
        <button
          onClick={onResetFilters}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <motion.div layout className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {visibleJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isApplied={appliedJobIds.has(job.id)}
              onViewDetails={() => onSelectJob(job)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Load More Button */}
      {jobs.length > visibleJobsCount && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer focus:outline-none"
          >
            {isLoadingMore ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            ) : (
              <>
                <span>Load More</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
