"use client";

import React from "react";
import { Mail, Calendar, Sparkles, AlertCircle, Loader2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicationStatus, JobApplicantDTO, isInsufficientResumeScreening } from "@/types/api";

interface ApplicantCardRowProps {
  app: JobApplicantDTO;
  isSelected?: boolean;
  isRerunning: boolean;
  isUpdating: boolean;
  onToggleSelect?: (id: string, e: React.MouseEvent) => void;
  onOpenDrawer: (app: JobApplicantDTO) => void;
  onRerunScreening: (id: string, e?: React.MouseEvent) => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus, e?: React.MouseEvent) => void;
  onScheduleInterview?: (app: JobApplicantDTO, e?: React.MouseEvent) => void;
}

export function ApplicantCardRow({
  app,
  isSelected = false,
  isRerunning,
  isUpdating,
  onToggleSelect,
  onOpenDrawer,
  onRerunScreening,
  onUpdateStatus,
  onScheduleInterview,
}: ApplicantCardRowProps) {
  const name = app.candidateName || app.candidate?.name || "Candidate";
  const email = app.candidateEmail || app.candidate?.email || "No email available";
  const score = app.screeningResult?.score;
  const hasScreening = typeof score === "number";
  const insufficient = isInsufficientResumeScreening(app.screeningResult);
  const recommendation = app.screeningResult?.recommendation || "RECOMMEND";
  const appId = app.id || "";

  return (
    <div
      onClick={() => hasScreening && onOpenDrawer(app)}
      className={`bg-white border rounded-3xl p-5 sm:p-6 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xs ${
        isSelected
          ? "border-[#0A54B1] bg-blue-50/30 ring-1 ring-[#0A54B1]"
          : hasScreening
          ? "hover:border-blue-200 hover:shadow-md cursor-pointer border-slate-200/80"
          : "border-slate-200/80"
      }`}
    >
      {/* Left: Checkbox + Candidate Info */}
      <div className="flex items-start gap-3.5">
        {onToggleSelect && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="pt-3.5 shrink-0"
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onToggleSelect(appId, e as any)}
              className="w-4 h-4 rounded-md border-slate-300 bg-white text-[#0A54B1] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#0A54B1]"
            />
          </div>
        )}

        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0A54B1] border border-blue-100 flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
          {name.charAt(0).toUpperCase()}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-bold text-slate-900">{name}</h3>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                app.status === "SHORTLISTED"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : app.status === "SCREENED"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : app.status === "INTERVIEWING"
                  ? "bg-sky-50 text-sky-700 border-sky-200"
                  : app.status === "OFFERED" || app.status === "HIRED"
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : app.status === "REJECTED"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {app.status || "SUBMITTED"}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {email}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Applied {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "Recently"}
            </span>
          </div>

          {app.coverNote && (
            <p className="text-xs text-slate-500 line-clamp-1 italic mt-1 max-w-xl">
              &ldquo;{app.coverNote}&rdquo;
            </p>
          )}

          {app.employerFeedback && (
            <p className="text-xs text-sky-700 font-medium mt-1">
              Note: {app.employerFeedback}
            </p>
          )}
        </div>
      </div>

      {/* Middle: AI Screening Score Badge */}
      <div className="flex items-center gap-4 flex-wrap lg:flex-nowrap">
        {hasScreening ? (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                insufficient
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : score! >= 80
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : score! >= 60
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {insufficient ? "—" : `${score}%`}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0A54B1]" />
                <span className="text-xs font-bold text-slate-900">
                  {insufficient
                    ? "Resume unreadable"
                    : recommendation === "RECOMMEND" || recommendation === "STRONG_MATCH"
                    ? "Strong Fit"
                    : recommendation === "CONSIDER"
                    ? "Moderate Match"
                    : "Low Alignment"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-48">
                {insufficient
                  ? "Ask candidate for readable PDF"
                  : app.screeningResult?.summary || "Screening score calculated by AI."}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-xs text-slate-500">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Not screened yet</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
          {/* Interview Button */}
          {onScheduleInterview && app.status !== "REJECTED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => onScheduleInterview(app, e)}
              className="border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs h-9 rounded-xl font-medium cursor-pointer"
            >
              <Video className="w-3.5 h-3.5 mr-1" />
              <span>Interview</span>
            </Button>
          )}

          {hasScreening ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenDrawer(app)}
              className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs h-9 rounded-xl font-medium shadow-xs cursor-pointer"
            >
              View Report
            </Button>
          ) : null}

          <Button
            size="sm"
            disabled={isRerunning}
            onClick={(e) => onRerunScreening(appId, e)}
            className={`text-xs h-9 rounded-xl font-semibold transition-all cursor-pointer ${
              hasScreening
                ? "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs"
                : "bg-[#0A54B1] hover:bg-[#08448f] text-white shadow-xs"
            }`}
          >
            {isRerunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Screening...
              </>
            ) : (
              <>
                <Sparkles className={`w-3.5 h-3.5 mr-1.5 ${hasScreening ? "text-[#0A54B1]" : "text-white"}`} />
                {hasScreening ? "Re-run" : "Run AI Screen"}
              </>
            )}
          </Button>

          {/* Status Dropdown */}
          <select
            value={app.status || "SUBMITTED"}
            disabled={isUpdating}
            onChange={(e) =>
              onUpdateStatus(appId, e.target.value as ApplicationStatus)
            }
            className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-2.5 py-2 focus:outline-none focus:border-[#0A54B1] shadow-xs cursor-pointer"
          >
            <option value="SUBMITTED">Submitted</option>
            <option value="SCREENED">Screened</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEWING">Interviewing</option>
            <option value="OFFERED">Offered</option>
            <option value="HIRED">Hired</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>
    </div>
  );
}
