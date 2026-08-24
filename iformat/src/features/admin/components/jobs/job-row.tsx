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
      className={`hover:bg-slate-800/30 transition-colors ${
        job.isDeleted ? "opacity-60 bg-rose-950/10" : ""
      }`}
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">{job.title}</p>
            <div className="flex items-center gap-2 text-slate-400 text-xs mt-0.5">
              <span>{job.company || job.employer?.companyName}</span>
              {job.employer?.isVerifiedCompany && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-500/20 text-sky-400">
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      <td className="p-4">
        <p className="font-semibold text-slate-300">{job.category}</p>
        <p className="text-slate-500 text-[11px]">
          {job.jobType} • {job.location}
        </p>
      </td>

      <td className="p-4">
        {job.isDeleted ? (
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-rose-950 text-rose-400 border border-rose-800">
            Soft Deleted
          </span>
        ) : (
          <span
            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
              job.status === "PUBLISHED"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : job.status === "DRAFT"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}
          >
            {job.status}
          </span>
        )}
      </td>

      <td className="p-4 font-bold text-slate-300">{job._count.applications} applied</td>

      <td className="p-4 text-slate-500 text-[11px]">{new Date(job.createdAt).toLocaleDateString()}</td>

      <td className="p-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {!job.isDeleted && (
            <select
              value={job.status}
              onChange={(e) => onUpdateStatus(job.id, e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1 font-bold focus:ring-sky-500"
            >
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="DRAFT">DRAFT</option>
              <option value="CLOSED">CLOSED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          )}

          {job.isDeleted ? (
            <Button
              onClick={() => onRestore(job)}
              variant="ghost"
              size="sm"
              title="Restore Job"
              className="h-8 px-2 text-emerald-400 hover:bg-emerald-950/40 rounded-lg text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              onClick={() => onSoftDelete(job)}
              variant="ghost"
              size="sm"
              title="Soft Delete"
              className="h-8 px-2 text-rose-400 hover:bg-rose-950/40 rounded-lg text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
