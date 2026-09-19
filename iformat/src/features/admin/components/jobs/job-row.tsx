import React from "react";
import { Briefcase, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminJobItemDTO } from "@/services/admin.service";

interface JobRowProps {
  job: AdminJobItemDTO;
  onUpdateStatus: (jobId: string, status: string) => void;
  onSoftDelete: (job: AdminJobItemDTO) => void;
  onRestore: (job: AdminJobItemDTO) => void;
}

export function JobRow({ job, onUpdateStatus, onSoftDelete, onRestore }: JobRowProps) {
  return (
    <tr
      className={`hover:bg-slate-50/80 transition-colors ${
        job.isDeleted ? "opacity-60 bg-rose-50/40" : ""
      }`}
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">{job.title}</p>
            <div className="flex items-center gap-2 text-slate-500 text-xs mt-0.5">
              <span>{job.company || job.employer?.companyName}</span>
              {job.employer?.isVerifiedCompany && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-50 text-sky-700 border border-sky-200/60">
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      <td className="p-4">
        <p className="font-semibold text-slate-800">{job.category}</p>
        <p className="text-slate-500 text-xs">
          {job.jobType} • {job.location}
        </p>
      </td>

      <td className="p-4">
        {job.isDeleted ? (
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            Soft Deleted
          </span>
        ) : (
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${
              job.status === "PUBLISHED"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : job.status === "DRAFT"
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            {job.status?.toLowerCase()}
          </span>
        )}
      </td>

      <td className="p-4 font-semibold text-slate-700">{job._count.applications} applied</td>

      <td className="p-4 text-slate-500 text-xs">{new Date(job.createdAt).toLocaleDateString()}</td>

      <td className="p-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {!job.isDeleted && (
            <select
              value={job.status}
              onChange={(e) => onUpdateStatus(job.id, e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-1 font-medium focus:ring-sky-500 shadow-xs cursor-pointer"
            >
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="CLOSED">Closed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          )}

          {job.isDeleted ? (
            <Button
              onClick={() => onRestore(job)}
              variant="ghost"
              size="sm"
              title="Restore Job"
              className="h-8 px-2 text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              onClick={() => onSoftDelete(job)}
              variant="ghost"
              size="sm"
              title="Soft Delete"
              className="h-8 px-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
