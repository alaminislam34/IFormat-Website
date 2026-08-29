"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, User, Mail } from "lucide-react";
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

import { ApplyFormHeader } from "./apply/apply-form-header";
import { ApplyCandidateFields } from "./apply/apply-candidate-fields";
import { ApplyResumeSelector } from "./apply/apply-resume-selector";
import { ApplyCoverNoteField } from "./apply/apply-cover-note-field";
import { ApplySuccessView } from "./apply/apply-success-view";

const applySchema = z.object({
  candidateName: z.string().min(2, "Full name must be at least 2 characters"),
  candidateEmail: z.string().email("Please enter a valid email address"),
  coverNote: z.string().max(2000, "Cover note cannot exceed 2000 characters").optional(),
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

    if (resumeMode === "upload") {
      if (!uploadedFile) {
        toast.error("Please select a resume file to upload.");
        return;
      }

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
        toast.error("Failed to upload your resume. Please try again before submitting.");
        return;
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
            <ApplyFormHeader job={job} onClose={onClose} />

            {isSuccess ? (
              <ApplySuccessView companyName={job.company} />
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <ApplyCandidateFields register={register} errors={errors} />

                {/* Resume Selector */}
                <ApplyResumeSelector
                  resumeMode={resumeMode}
                  setResumeMode={setResumeMode}
                  selectedCvId={selectedCvId}
                  setSelectedCvId={setSelectedCvId}
                  userCVs={userCVs}
                  loadingCVs={loadingCVs}
                  uploadedFile={uploadedFile}
                  fileInputRef={fileInputRef}
                  onFileChange={handleFileChange}
                  onRemoveFile={handleRemoveFile}
                />

                {/* Cover Note with AI Generator */}
                <ApplyCoverNoteField
                  register={register}
                  errors={errors}
                  coverNoteLength={coverNoteValue.length}
                  isAiGenerating={generateLetterMutation.isPending}
                  onAiDraft={handleAiDraftCoverNote}
                />

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
