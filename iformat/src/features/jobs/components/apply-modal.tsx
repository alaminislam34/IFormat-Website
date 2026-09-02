"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => {
    setMounted(true);
  }, []);

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

  useEffect(() => {
    if (user) {
      setValue("candidateName", user.name || "");
      setValue("candidateEmail", user.email || "");
    }
  }, [user, setValue]);

  useEffect(() => {
    if (userCVs && userCVs.length > 0 && !selectedCvId) {
      const primaryCv = userCVs.find((c: any) => c.isPrimary) || userCVs[0];
      setSelectedCvId(primaryCv.id);
    }
  }, [userCVs, selectedCvId]);

  if (!mounted) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size cannot exceed 5MB.");
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleGenerateCoverLetter = async () => {
    try {
      const res: any = await generateLetterMutation.mutateAsync({
        role: job.title,
        company: job.company,
        jobDescription: job.description,
      });
      const letterText = typeof res === "string" ? res : res?.letter || "";
      if (letterText) {
        setValue("coverNote", letterText);
        toast.success("AI Cover Letter generated and populated.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to generate AI Cover Letter.");
    }
  };

  const onSubmit = async (data: ApplyFormData) => {
    let finalCvId = selectedCvId;

    if (resumeMode === "upload") {
      if (!uploadedFile) {
        toast.error("Please upload a CV document (PDF, DOCX).");
        return;
      }

      try {
        setIsUploadingFile(true);
        const uploadRes = await cvService.createCV({
          title: `Application CV: ${job.title}`,
          content: {
            fileName: uploadedFile.name,
            fileSize: uploadedFile.size,
            fileType: uploadedFile.type,
            uploadedAt: new Date().toISOString(),
          },
        });
        finalCvId = uploadRes.id;
        refetchCVs();
      } catch (err: any) {
        toast.error(err?.message || "Failed to upload resume file.");
        setIsUploadingFile(false);
        return;
      } finally {
        setIsUploadingFile(false);
      }
    } else {
      if (!finalCvId && (!userCVs || userCVs.length === 0)) {
        toast.error("No cloud CV available. Please upload a file.");
        setResumeMode("upload");
        return;
      }
    }

    applyJobMutation.mutate(
      {
        jobId: job.id,
        candidateName: data.candidateName,
        candidateEmail: data.candidateEmail,
        cvId: finalCvId || undefined,
        coverNote: data.coverNote?.trim() || undefined,
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
          toast.success("Your job application has been submitted successfully!");
          onApplied?.(job.id);
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

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
        >
          {/* Backdrop Click-away */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
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
                  userCVs={userCVs || []}
                  loadingCVs={loadingCVs}
                  selectedCvId={selectedCvId}
                  setSelectedCvId={setSelectedCvId}
                  uploadedFile={uploadedFile}
                  fileInputRef={fileInputRef}
                  onFileChange={handleFileChange}
                  onRemoveFile={() => setUploadedFile(null)}
                />

                {/* Cover Note Field with AI Generator */}
                <ApplyCoverNoteField
                  register={register}
                  errors={errors}
                  coverNoteLength={coverNoteValue.length}
                  isAiGenerating={generateLetterMutation.isPending}
                  onAiDraft={handleGenerateCoverLetter}
                />

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || applyJobMutation.isPending || isUploadingFile}
                    className="w-full h-11 rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting || applyJobMutation.isPending || isUploadingFile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Job Application</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
