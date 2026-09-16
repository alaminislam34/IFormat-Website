"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  Phone,
  Building2,
  Link as LinkIcon,
  Sparkles,
  Loader2,
  X,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobApplicantDTO } from "@/types/api";
import { jobsService } from "@/services/jobs.service";
import { toast } from "sonner";

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: JobApplicantDTO | null;
  jobTitle?: string;
  onSuccess: (applicationId: string, feedback: string) => void;
}

export function ScheduleInterviewModal({
  isOpen,
  onClose,
  applicant,
  jobTitle,
  onSuccess,
}: ScheduleInterviewModalProps) {
  const [format, setFormat] = useState<"VIDEO" | "PHONE" | "ONSITE">("VIDEO");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !applicant) return null;

  const candidateName = applicant.candidateName || applicant.candidate?.name || "Candidate";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !time) {
      toast.error("Please select a date and time for the interview");
      return;
    }

    if (format === "VIDEO" && !meetingUrl.trim()) {
      toast.error("Please enter a meeting link (Google Meet, Zoom, or Teams)");
      return;
    }

    try {
      setLoading(true);

      const feedback = [
        `Interview Scheduled: ${new Date(`${date}T${time}`).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        })} (${format === "VIDEO" ? "Video Conference" : format === "PHONE" ? "Phone Call" : "On-site"})`,
        meetingUrl ? `Meeting Link: ${meetingUrl.trim()}` : "",
        instructions ? `Instructions: ${instructions.trim()}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      await jobsService.updateApplicationStatus({
        applicationId: applicant.id || "",
        status: "INTERVIEWING",
        employerFeedback: feedback,
      });

      toast.success(`Interview invitation sent to ${candidateName}!`);
      onSuccess(applicant.id || "", feedback);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to schedule interview.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Schedule Candidate Interview
            </span>
            <h2 className="text-lg font-bold text-white">
              Invite {candidateName}
            </h2>
            {jobTitle && (
              <p className="text-xs text-slate-400">Position: {jobTitle}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Interview Format Options */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">Interview Format</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat("VIDEO")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  format === "VIDEO"
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <Video className="w-4 h-4" />
                <span className="font-bold text-[11px]">Video Call</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat("PHONE")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  format === "PHONE"
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <Phone className="w-4 h-4" />
                <span className="font-bold text-[11px]">Phone Call</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat("ONSITE")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  format === "ONSITE"
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="font-bold text-[11px]">On-site</span>
              </button>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Date</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Time</span>
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Meeting Link (for Video) or Location */}
          {format === "VIDEO" && (
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Meeting Link (Google Meet / Zoom)</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://meet.google.com/xyz-abcd-efg"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          )}

          {/* Instructions Note */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">
              Instructions / Agenda for Candidate (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Please bring a portfolio sample and prepare for a 30-min system design discussion."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-hidden focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-slate-800 text-slate-300 hover:bg-slate-800 cursor-pointer text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer text-xs px-4"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              )}
              Confirm & Send Invite
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
