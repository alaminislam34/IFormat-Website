"use client";

import React, { useState } from "react";
import { FileText, Loader2, Check, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Applicant } from "../job-card";

interface JobDetailsApplicantsProps {
  applicants: Applicant[];
}

export function JobDetailsApplicants({ applicants }: JobDetailsApplicantsProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadAllState, setDownloadAllState] = useState<"idle" | "loading" | "success">("idle");
  const [downloadedApplicants, setDownloadedApplicants] = useState<Record<string, boolean>>({});

  const handleDownloadCV = (applicantName: string) => {
    setDownloadingId(applicantName);
    setTimeout(() => {
      setDownloadingId(null);
      setDownloadedApplicants((prev) => ({ ...prev, [applicantName]: true }));
      toast.success(`Downloaded CV for ${applicantName}`);
    }, 1200);
  };

  const handleDownloadAll = () => {
    setDownloadAllState("loading");
    setTimeout(() => {
      setDownloadAllState("success");
      const newDownloads: Record<string, boolean> = {};
      applicants.forEach((app) => {
        const key = app.name || app.candidateName || "Candidate";
        newDownloads[key] = true;
      });
      setDownloadedApplicants(newDownloads);
      toast.success(`Downloaded all ${applicants.length} candidate CVs!`);
    }, 1800);
  };

  if (applicants.length === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
          <FileText className="w-8 h-8" />
        </div>
        <p className="text-sm text-slate-500 font-medium">No applications yet for this role.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Box */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
          <span className="block text-2xl font-extrabold text-slate-800">
            {applicants.length}
          </span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Applied
          </span>
        </div>

        <button
          onClick={handleDownloadAll}
          disabled={downloadAllState === "loading" || downloadAllState === "success"}
          className={cn(
            "rounded-2xl p-4 flex flex-col items-center justify-center border font-bold text-sm transition-all cursor-pointer",
            downloadAllState === "success"
              ? "bg-sky-50 border-sky-200 text-[#0A54B1]"
              : "bg-[#f0f7fa] border-sky-100 text-sky-600 hover:bg-[#e0f2fe]"
          )}
        >
          {downloadAllState === "loading" ? (
            <Loader2 className="w-5 h-5 animate-spin mb-1" />
          ) : downloadAllState === "success" ? (
            <Check className="w-5 h-5 mb-1" />
          ) : (
            <Download className="w-5 h-5 mb-1" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider">
            {downloadAllState === "loading"
              ? "Downloading..."
              : downloadAllState === "success"
              ? "All Saved"
              : "Download All"}
          </span>
        </button>
      </div>

      {/* Applicants List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Applicant List
        </h4>

        {applicants.map((applicant, idx) => {
          const candidateDisplayName =
            applicant.name || applicant.candidateName || applicant.candidate?.name || "Candidate";
          const candidateAvatar =
            applicant.avatar || candidateDisplayName.charAt(0).toUpperCase() || "A";
          const candidateColor = applicant.color || "bg-sky-500";
          const isDownloading = downloadingId === candidateDisplayName;
          const isDownloaded = downloadedApplicants[candidateDisplayName];

          return (
            <div
              key={applicant.id || idx}
              className="flex items-center justify-between p-4 bg-white border border-slate-100 hover:border-slate-200 rounded-2xl transition-all shadow-xs"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-sm shadow-sm",
                    candidateColor
                  )}
                >
                  {candidateAvatar}
                </div>
                <div>
                  <h5 className="font-bold text-slate-800 text-sm">
                    {candidateDisplayName}
                  </h5>
                  <span className="text-xs text-slate-400 font-medium">
                    Applied {applicant.date || "Recently"}
                  </span>
                </div>
              </div>

              {/* Download Action */}
              <button
                onClick={() => handleDownloadCV(candidateDisplayName)}
                disabled={isDownloading || isDownloaded}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  isDownloaded
                    ? "bg-sky-50 text-[#0A54B1] border border-sky-100"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                )}
              >
                {isDownloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isDownloaded ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{isDownloading ? "Saving..." : isDownloaded ? "Saved" : "CV"}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
