"use client";

import { useState, useEffect, useRef } from "react";
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
  UploadCloud,
  Check,
  FolderOpen,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useApplyJob, useUserCVs, useGenerateCoverLetter } from "@/hooks";
import { cvService } from "@/services/cv.service";
import { JobDTO } from "@/types/api";
import { toast } from "sonner";
import { handleFormError } from "@/lib/handle-form-error";
import { useAuthStore } from "@/stores/use-auth-store";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const applySchema = z.object({
  candidateName: z
    .string()
    .min(2, "Full name must be at least 2 characters"),
  candidateEmail: z
    .string()
    .email("Please enter a valid email address"),
  coverNote: z
    .string()
    .max(2000, "Cover note cannot exceed 2000 characters")
    .optional(),
});

type ApplyFormData = z.infer<typeof applySchema>;

interface ApplyModalProps {
  job: JobDTO;
  isOpen: boolean;
  onClose: () => void;
  onApplied?: (jobId: string) => void;
}

export function ApplyModal({ job, isOpen, onClose, onApplied }: ApplyModalProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const applyJobMutation = useApplyJob();
  const generateLetterMutation = useGenerateCoverLetter();
  const { data: userCVs, isLoading: loadingCVs, refetch: refetchCVs } = useUserCVs();

  const [resumeMode, setResumeMode] = useState<"cloud" | "upload">("cloud");
  const [selectedCvId, setSelectedCvId] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ApplyFormData>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      candidateName: user?.name || "",
      candidateEmail: user?.email || "",
      coverNote: "",
    },
  });

  const coverNoteValue = watch("coverNote") || "";
  const candidateNameValue = watch("candidateName") || user?.name || "";

  // Auto-select primary CV if available
  useEffect(() => {
    if (userCVs && userCVs.length > 0 && !selectedCvId) {
      setSelectedCvId(userCVs[0].id);
      setResumeMode("cloud");
    } else if (!userCVs || userCVs.length === 0) {
      setResumeMode("upload");
    }
  }, [userCVs, selectedCvId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      toast.error("Please select a valid PDF file (.pdf)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }

    setUploadedFile(file);
    toast.success(`Attached ${file.name}`);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAiDraftCoverNote = () => {
    generateLetterMutation.mutate(
      {
        role: job.title,
        company: job.company,
        recipient: "Hiring Manager",
        jobDescription: job.description || (job.requirements || []).join(". "),
        candidateProfile: {
          name: candidateNameValue,
          experienceYears: 4,
          skills: job.requirements?.slice(0, 3) || [],
        },
      },
      {
        onSuccess: (letter) => {
          // Truncate to 2000 if needed
          setValue("coverNote", letter.slice(0, 2000));
          toast.success("AI drafted your cover note!");
        },
        onError: () => {
          toast.error("Failed to generate AI draft. Please try again.");
        },
      }
    );
  };

  const onSubmit = async (data: ApplyFormData) => {
    if (!isAuthenticated) {
      toast.info("Please sign in to submit your job application.");
      onClose();
      router.push(`/login?redirect=${encodeURIComponent(`/job-portal?job=${job.id}`)}`);
      return;
    }

    let finalCvId: string | undefined = selectedCvId || undefined;

    // If user uploaded a new PDF file, save it to their cloud CVs automatically
    if (resumeMode === "upload" && uploadedFile) {
      try {
        setIsUploadingFile(true);
        const newCv = await cvService.createCV({
          title: `${uploadedFile.name.replace(/\.pdf$/i, "")}`,
          content: {
            fileName: uploadedFile.name,
            fileSize: `${(uploadedFile.size / 1024).toFixed(1)} KB`,
            uploadedAt: new Date().toISOString(),
            candidateName: data.candidateName,
            candidateEmail: data.candidateEmail,
          },
        });
        finalCvId = newCv.id;
        refetchCVs();
      } catch (err: any) {
        toast.error("Could not register uploaded resume. Proceeding with application.");
      } finally {
        setIsUploadingFile(false);
      }
    }

    applyJobMutation.mutate(
      {
        jobId: job.id,
        cvId: finalCvId,
        candidateName: data.candidateName,
        candidateEmail: data.candidateEmail,
        coverNote: data.coverNote || null,
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
          onApplied?.(job.id);
          toast.success("Application submitted! AI screening in progress...");
          setTimeout(() => {
            setIsSuccess(false);
            onClose();
          }, 2200);
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
        <div key="apply-modal-container" className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <motion.div
            key="apply-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          <motion.div
            key="apply-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            data-lenis-prevent
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 md:p-8 z-10 overflow-hidden border border-slate-100 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A54B1]">
                  Apply for Position
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">{job.title}</h3>
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
                  Your application has been delivered to <strong>{job.company}</strong>. Our AI Talent Engine is screening your profile now.
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

                {/* Resume Selection / Direct Upload */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600" /> Resume / CV
                    </label>

                    {/* Mode Toggle */}
                    <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setResumeMode("cloud")}
                        className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                          resumeMode === "cloud"
                            ? "bg-white text-[#0A54B1] shadow-xs"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Saved Resumes
                      </button>
                      <button
                        type="button"
                        onClick={() => setResumeMode("upload")}
                        className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                          resumeMode === "upload"
                            ? "bg-white text-[#0A54B1] shadow-xs"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Upload PDF
                      </button>
                    </div>
                  </div>

                  {resumeMode === "cloud" ? (
                    loadingCVs ? (
                      <div className="flex items-center gap-2 text-xs text-slate-400 py-3 bg-slate-50 rounded-xl px-3.5">
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
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                        <span>No saved resumes yet.</span>
                        <button
                          type="button"
                          onClick={() => setResumeMode("upload")}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          Upload PDF directly
                        </button>
                      </div>
                    )
                  ) : (
                    /* Direct PDF Upload Dropzone */
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="resume-file-input"
                      />

                      {uploadedFile ? (
                        <div className="flex items-center justify-between p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{uploadedFile.name}</p>
                              <p className="text-[10px] text-slate-500">{(uploadedFile.size / 1024).toFixed(1)} KB • Ready to submit</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remove file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="resume-file-input"
                          className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 rounded-xl transition-all cursor-pointer group"
                        >
                          <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-blue-600 mb-1 transition-colors" />
                          <p className="text-xs font-semibold text-slate-700">Click to upload or drag & drop PDF</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Maximum size: 10MB (.pdf)</p>
                        </label>
                      )}
                    </div>
                  )}
                </div>

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
                      maxLength={2000}
                      {...register("coverNote")}
                      placeholder="Highlight your key achievements and why you're a great match for this role..."
                      className="flex w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    {errors.coverNote ? (
                      <p className="text-xs text-red-500 font-medium">
                        {errors.coverNote.message}
                      </p>
                    ) : <span />}
                    <span className={`text-[10px] font-semibold ${
                      coverNoteValue.length > 1900 ? "text-amber-600" : "text-slate-400"
                    }`}>
                      {coverNoteValue.length} / 2000
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <Button
                    type="submit"
                    disabled={isSubmitting || isUploadingFile || applyJobMutation.isPending}
                    className="bg-[#0A54B1] hover:bg-[#0A54B1]/95 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting || isUploadingFile || applyJobMutation.isPending ? (
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

