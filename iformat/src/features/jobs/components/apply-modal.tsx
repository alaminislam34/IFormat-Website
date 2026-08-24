"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Loader2,
  CheckCircle2,
  User,
  Mail,
  FileText,
  Sparkles,
  Paperclip,
  FolderOpen,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useApplyJob, useUserCVs, useGenerateCoverLetter } from "@/hooks";
import { JobDTO } from "@/types/api";
import { toast } from "sonner";
import { handleFormError } from "@/lib/handle-form-error";
import { useAuthStore } from "@/stores/use-auth-store";
import { Button } from "@/components/ui/button";

const applySchema = z.object({
  candidateName: z
    .string()
    .min(2, "Full name must be at least 2 characters"),
  candidateEmail: z
    .string()
    .email("Please enter a valid email address"),
  coverNote: z
    .string()
    .max(3000, "Cover note cannot exceed 3000 characters")
    .optional(),
});

type ApplyFormData = z.infer<typeof applySchema>;

interface ApplyModalProps {
  job: JobDTO;
  isOpen: boolean;
  onClose: () => void;
}

export function ApplyModal({ job, isOpen, onClose }: ApplyModalProps) {
  const { user, isAuthenticated } = useAuthStore();
  const applyJobMutation = useApplyJob();
  const generateLetterMutation = useGenerateCoverLetter();
  const { data: userCVs, isLoading: loadingCVs } = useUserCVs();

  const [selectedCvId, setSelectedCvId] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ApplyFormData>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      candidateName: user?.name || "",
      candidateEmail: user?.email || "",
      coverNote: "",
    },
  });

  // Auto-select primary CV if available
  useEffect(() => {
    if (userCVs && userCVs.length > 0 && !selectedCvId) {
      setSelectedCvId(userCVs[0].id);
    }
  }, [userCVs, selectedCvId]);

  const handleAiDraftCoverNote = () => {
    generateLetterMutation.mutate(
      {
        role: job.title,
        company: job.company,
        experienceContext: `Applying for ${job.title} located in ${job.location}. Requirements: ${(job.requirements || []).slice(0, 3).join(", ")}`,
      },
      {
        onSuccess: (letter) => {
          setValue("coverNote", letter);
          toast.success("AI drafted your cover note!");
        },
        onError: () => {
          toast.error("Failed to generate AI draft. Please try again.");
        },
      }
    );
  };

  const onSubmit = (data: ApplyFormData) => {
    applyJobMutation.mutate(
      {
        jobId: job.id,
        cvId: selectedCvId || undefined,
        candidateName: data.candidateName,
        candidateEmail: data.candidateEmail,
        coverNote: data.coverNote || null,
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
          toast.success("Application submitted! AI screening in progress...");
          setTimeout(() => {
            setIsSuccess(false);
            onClose();
          }, 2500);
        },
        onError: (err) => {
          handleFormError(err, setError, {
            fallbackMessage: "Failed to submit application. Please try again.",
          });
        },
      }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 md:p-8 z-10 overflow-hidden border border-slate-100"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0A54B1]">
                  Apply for Position
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{job.title}</h3>
                <p className="text-xs text-slate-500">{job.company} • {job.location}</p>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Application Submitted!</h4>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                  Your application and CV have been submitted to <strong>{job.company}</strong>. Our AI Talent Engine is screening your profile now.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      {...register("candidateName")}
                      placeholder="e.g. Sarah Jenkins"
                      className={`flex h-11 w-full rounded-xl border ${
                        errors.candidateName
                          ? "border-red-500 focus:ring-red-500/20"
                          : "border-slate-200 focus:border-[#0A54B1] focus:ring-[#0A54B1]/20"
                      } bg-slate-50/50 px-3.5 pl-10 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all`}
                    />
                  </div>
                  {errors.candidateName && (
                    <p className="text-xs text-red-500 mt-1 font-medium">
                      {errors.candidateName.message}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      {...register("candidateEmail")}
                      placeholder="you@example.com"
                      className={`flex h-11 w-full rounded-xl border ${
                        errors.candidateEmail
                          ? "border-red-500 focus:ring-red-500/20"
                          : "border-slate-200 focus:border-[#0A54B1] focus:ring-[#0A54B1]/20"
                      } bg-slate-50/50 px-3.5 pl-10 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all`}
                    />
                  </div>
                  {errors.candidateEmail && (
                    <p className="text-xs text-red-500 mt-1 font-medium">
                      {errors.candidateEmail.message}
                    </p>
                  )}
                </div>

                {/* Attach Saved Cloud Resume */}
                {isAuthenticated && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-blue-600" /> Attach Cloud Resume
                      </span>
                      {userCVs && userCVs.length > 0 && (
                        <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                          {userCVs.length} saved
                        </span>
                      )}
                    </label>

                    {loadingCVs ? (
                      <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading your resumes...
                      </div>
                    ) : userCVs && userCVs.length > 0 ? (
                      <select
                        value={selectedCvId}
                        onChange={(e) => setSelectedCvId(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
                      >
                        <option value="">-- Do not attach saved CV --</option>
                        {userCVs.map((cv) => (
                          <option key={cv.id} value={cv.id}>
                            {cv.title} (v{cv.versions?.[0]?.versionNumber || 1})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-500 flex items-center justify-between">
                        <span>No resumes in cloud yet.</span>
                        <a
                          href="/job-assistant"
                          target="_blank"
                          className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
                        >
                          <FolderOpen className="w-3.5 h-3.5" /> Build in Job Assistant
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Cover Note / Message with AI Assistant Button */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Cover Note / Pitch
                    </label>
                    <button
                      type="button"
                      onClick={handleAiDraftCoverNote}
                      disabled={generateLetterMutation.isPending}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {generateLetterMutation.isPending ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" /> Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" /> Auto-draft with AI
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <textarea
                      rows={4}
                      {...register("coverNote")}
                      placeholder="Highlight your key achievements and why you're a great match for this role..."
                      className="flex w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all resize-none"
                    />
                  </div>
                  {errors.coverNote && (
                    <p className="text-xs text-red-500 mt-1 font-medium">
                      {errors.coverNote.message}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <Button
                    type="submit"
                    disabled={isSubmitting || applyJobMutation.isPending}
                    className="bg-[#0A54B1] hover:bg-[#0A54B1]/95 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting || applyJobMutation.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Submit Application
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
