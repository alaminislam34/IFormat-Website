"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Search, Upload } from "lucide-react";
import { JobApplicantDTO, isInsufficientResumeScreening } from "@/types/api";
import { jobsService } from "@/services/jobs.service";
import { toast } from "sonner";

interface CandidateApplicationsListProps {
  applications: JobApplicantDTO[];
  loading: boolean;
  onUpdated?: () => void;
}

export function CandidateApplicationsList({
  applications,
  loading,
  onUpdated,
}: CandidateApplicationsListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingAppId, setPendingAppId] = useState<string | null>(null);
  const [uploadingAppId, setUploadingAppId] = useState<string | null>(null);

  const canReplaceResume = (status?: string) =>
    status !== "HIRED" && status !== "REJECTED";

  const openResumePicker = (applicationId: string) => {
    setPendingAppId(applicationId);
    fileInputRef.current?.click();
  };

  const handleResumeSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const applicationId = pendingAppId;
    e.target.value = "";
    setPendingAppId(null);

    if (!file || !applicationId) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size cannot exceed 10MB.");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      toast.error("Please upload a PDF resume.");
      return;
    }

    try {
      setUploadingAppId(applicationId);
      await jobsService.replaceApplicationResume(applicationId, file);
      toast.success("Resume updated. Screening will now use your actual document.");
      onUpdated?.();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update resume. Please upload a text-based PDF.");
    } finally {
      setUploadingAppId(null);
    }
  };

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
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleResumeSelected}
      />
      {applications.map((app, idx) => {
        const insufficient = isInsufficientResumeScreening(app.screeningResult);
        const replacing = uploadingAppId === app.id;

        return (
          <div
            key={app.id || idx}
            className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0"
          >
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">
                {app.job?.title || "Application Submission"}
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium flex-wrap">
                <span>{app.job?.company || app.candidateEmail || "Open role"}</span>
                <span>•</span>
                <span>
                  Applied on{" "}
                  {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "Recently"}
                </span>
              </div>
              {insufficient && (
                <p className="text-[11px] text-amber-700 font-medium">
                  Screening could not read a resume. Upload your PDF so the score uses your profile.
                </p>
              )}
              {!insufficient && app.screeningResult?.score === 0 && (
                <p className="text-[11px] text-amber-700 font-medium">
                  If this score used the wrong background, upload your own PDF to re-run screening.
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {canReplaceResume(app.status) && (
                <button
                  type="button"
                  disabled={replacing}
                  onClick={() => app.id && openResumePicker(app.id)}
                  className="h-8 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {replacing ? "Uploading..." : insufficient ? "Upload my resume" : "Replace resume"}
                </button>
              )}
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
        );
      })}
    </div>
  );
}
