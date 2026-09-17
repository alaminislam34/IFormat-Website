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
    <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/80 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0A54B1] border border-blue-200/60">
              Schedule Candidate Interview
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Invite {candidateName}
            </h2>
            {jobTitle && (
              <p className="text-xs text-slate-500">Position: {jobTitle}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Interview Format Options */}
          <div className="space-y-1.5">
            <label className="text-slate-700 font-semibold block">Interview Format</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat("VIDEO")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  format === "VIDEO"
                    ? "bg-blue-50 border-[#0A54B1] text-[#0A54B1] ring-1 ring-[#0A54B1]"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
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
                    ? "bg-blue-50 border-[#0A54B1] text-[#0A54B1] ring-1 ring-[#0A54B1]"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
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
                    ? "bg-blue-50 border-[#0A54B1] text-[#0A54B1] ring-1 ring-[#0A54B1]"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
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
              <label className="text-slate-700 font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Date</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:bg-white focus:border-[#0A54B1] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Time</span>
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:bg-white focus:border-[#0A54B1] transition-all"
              />
            </div>
          </div>

          {/* Meeting Link (for Video) or Location */}
          {format === "VIDEO" && (
            <div className="space-y-1.5">
              <label className="text-slate-700 font-semibold flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>Meeting Link (Google Meet / Zoom)</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://meet.google.com/xyz-abcd-efg"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-[#0A54B1] transition-all"
              />
            </div>
          )}

          {/* Instructions Note */}
          <div className="space-y-1.5">
            <label className="text-slate-700 font-semibold block">
              Instructions / Agenda for Candidate (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Please bring a portfolio sample and prepare for a 30-min system design discussion."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-[#0A54B1] resize-none transition-all"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="bg-[#0A54B1] hover:bg-[#08448f] text-white font-bold cursor-pointer text-xs px-4 shadow-xs"
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
