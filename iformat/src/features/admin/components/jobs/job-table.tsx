import React from "react";
import { Briefcase } from "lucide-react";
import { AdminJobItemDTO } from "@/services/admin.service";
import { JobRow } from "./job-row";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Skeleton,
} from "@/components/ui/table";

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
    <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Title & Company</TableHead>
            <TableHead>Category & Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applicants</TableHead>
            <TableHead>Posted</TableHead>
            <TableHead className="text-right">Moderation Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            /* UI-Preserving Skeleton Loading Rows */
            Array.from({ length: 6 }).map((_, idx) => (
              <TableRow key={`job-skeleton-${idx}`} className="hover:bg-transparent">
                {/* Job Title & Company */}
                <TableCell>
                  <div className="space-y-1.5 max-w-xs">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </TableCell>

                {/* Category & Type */}
                <TableCell>
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-4 w-16 rounded-md" />
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>

                {/* Applicants */}
                <TableCell>
                  <Skeleton className="h-5 w-12 rounded-full" />
                </TableCell>

                {/* Posted */}
                <TableCell>
                  <Skeleton className="h-3.5 w-20" />
                </TableCell>

                {/* Moderation Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Skeleton className="h-8 w-20 rounded-xl" />
                    <Skeleton className="h-8 w-8 rounded-xl" />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : jobs.length === 0 ? (
            /* Empty State */
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={6} className="p-0 border-none">
                <div className="py-16 px-6 text-center space-y-3 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200/60 shadow-xs">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800 tracking-tight">No Jobs Found</h4>
                    <p className="text-xs text-slate-500 max-w-sm">
                      No job postings match your current filter criteria.
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            /* Real Data Rows */
            jobs.map((job) => (
              <JobRow
                key={job.id}
                job={job}
                onUpdateStatus={onUpdateStatus}
                onSoftDelete={onSoftDelete}
                onRestore={onRestore}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
