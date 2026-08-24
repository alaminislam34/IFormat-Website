import React from "react";
import { Loader2 } from "lucide-react";
import { AdminJobItemDTO } from "@/services/admin.service";
import { JobRow } from "./job-row";

interface JobTableProps {
  jobs: AdminJobItemDTO[];
  loading: boolean;
  onUpdateStatus: (jobId: string, status: string) => void;
  onSoftDelete: (job: AdminJobItemDTO) => void;
  onRestore: (job: AdminJobItemDTO) => void;
}

export function JobTable({
  jobs,
  loading,
  onUpdateStatus,
  onSoftDelete,
  onRestore,
}: JobTableProps) {
  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl overflow-hidden shadow-xl">
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 font-medium">
          No job postings found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Job Title & Company</th>
                <th className="p-4">Category & Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Applicants</th>
                <th className="p-4">Posted</th>
                <th className="p-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {jobs.map((job) => (
                <JobRow
                  key={job.id}
                  job={job}
                  onUpdateStatus={onUpdateStatus}
                  onSoftDelete={onSoftDelete}
                  onRestore={onRestore}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
