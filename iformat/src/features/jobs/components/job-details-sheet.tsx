"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import { cn } from "@/lib/utils";
import { Job } from "./job-card";
import { ApplyModal } from "./apply-modal";
import { EditJobModal } from "./edit-job-modal";
import { useDeleteJob, useJobApplicants } from "@/hooks";
import { toast } from "sonner";

import { JobDetailsHeader } from "./details/job-details-header";
import { JobDetailsBadges } from "./details/job-details-badges";
import { JobDetailsContent } from "./details/job-details-content";
import { JobDetailsApplicants } from "./details/job-details-applicants";
import { JobAnalyzerModal } from "./modal/job-analyzer-modal";
import { AuthPromptModal } from "@/components/auth/auth-prompt-modal";

interface JobDetailsSheetProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  isApplied?: boolean;
  onApplied?: (jobId: string) => void;
}

export function JobDetailsSheet({
  job,
  isOpen,
  onClose,
  isApplied = false,
  onApplied,
}: JobDetailsSheetProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const userRole = user?.role?.toUpperCase();
  const isAdmin = userRole === "ADMIN";

  // Check if current user is the owner of this job posting or platform Admin
  const isJobOwner = Boolean(
    user?.id &&
      job &&
      (
        (job.employerId && job.employerId === user.id) ||
        (job.employer?.id && job.employer?.id === user.id) ||
        (user.companyName && job.company && user.companyName.trim().toLowerCase() === job.company.trim().toLowerCase())
      )
  );
  const canManageJob = isJobOwner || isAdmin;

  const [activeTab, setActiveTab] = useState<"details" | "applicants">("details");
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAnalyzerModalOpen, setIsAnalyzerModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasAppliedLocally, setHasAppliedLocally] = useState(false);

  const deleteJobMutation = useDeleteJob();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    setActiveTab("details");
  }, [job?.id]);

  const { data: fetchedApplicants, isLoading: isLoadingApplicants } = useJobApplicants(
    isOpen && canManageJob ? job?.id : null
  );

  if (!mounted || !job) return null;

  const handleDeleteJob = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${job.title}"? This will archive the posting and remove it from the job board.`
      )
    ) {
      return;
    }
    try {
      setIsDeleting(true);
      await deleteJobMutation.mutateAsync(job.id);
      toast.success(`Job "${job.title}" deleted successfully.`);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete job posting.");
    } finally {
      setIsDeleting(false);
    }
  };

  const appliedState = isApplied || hasAppliedLocally;

  const realApplicants = (Array.isArray(fetchedApplicants)
    ? fetchedApplicants
    : (fetchedApplicants as any)?.applications || job.applicants || []) as any[];

  const applicantsCount =
    realApplicants.length > 0 ? realApplicants.length : job._count?.applications ?? 0;

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to submit your job application.");
      onClose();
      router.push(`/login?redirect=${encodeURIComponent(`/job-portal?job=${job.id}`)}`);
      return;
    }

    if (userRole === "EMPLOYER") {
      toast.error("Employer accounts cannot submit job applications. Please use a candidate account.");
      return;
    }

    setIsApplyModalOpen(true);
  };

  const handleAiAnalyserClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (userRole === "EMPLOYER") {
      toast.info("Candidate job fit analysis is designed for job applicants.");
      return;
    }

    setIsAnalyzerModalOpen(true);
  };

  // The drawer sheet should only be visible when isOpen is true AND no child modal is currently active
  const isDrawerVisible =
    isOpen &&
    !isAnalyzerModalOpen &&
    !isApplyModalOpen &&
    !isEditModalOpen &&
    !showAuthModal;

  const sheetContent = (
    <>
      <AnimatePresence mode="wait">
        {isDrawerVisible && (
          <motion.div
            key="job-details-drawer-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-0 z-99999 flex justify-end bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4"
          >
            {/* Backdrop Click-away */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* Drawer Sheet Container matching Figma */}
            <motion.div
              key="job-details-drawer-panel"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-full w-full max-w-md bg-white rounded-l-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100 z-10"
            >
              {/* Header */}
              <JobDetailsHeader
                job={job}
                isEmployerOrAdmin={canManageJob}
                isDeleting={isDeleting}
                onEdit={() => setIsEditModalOpen(true)}
                onDelete={handleDeleteJob}
                onClose={onClose}
              />

              {/* Badges Bar (Full Time, Remote, Salary, Posted, and Applicants Count for non-owners) */}
              <JobDetailsBadges
                job={job}
                applicantsCount={applicantsCount}
                showApplicantsBadge={!canManageJob}
              />

              {/* Tab Switcher: Only shown for the Posting Company or Admin */}
              {canManageJob && (
                <div className="flex bg-white px-6 border-b border-slate-100 shrink-0">
                  <button
                    onClick={() => setActiveTab("details")}
                    className="relative py-3.5 pr-6 text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <span className={activeTab === "details" ? "text-primary font-black" : "text-slate-500 hover:text-slate-700"}>
                      Job Details
                    </span>
                    {activeTab === "details" && (
                      <motion.div
                        layoutId="active-tab-underline"
                        className="absolute bottom-0 left-0 right-6 h-0.5 bg-primary rounded-full"
                      />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("applicants")}
                    className="relative py-3.5 px-6 text-xs font-bold focus:outline-none cursor-pointer flex items-center gap-2"
                  >
                    <span className={activeTab === "applicants" ? "text-primary font-black" : "text-slate-500 hover:text-slate-700"}>
                      Applicants
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.5 text-[10px] rounded-full font-bold transition-colors",
                        activeTab === "applicants"
                          ? "bg-primary/10 text-primary"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {applicantsCount}
                    </span>
                    {activeTab === "applicants" && (
                      <motion.div
                        layoutId="active-tab-underline"
                        className="absolute bottom-0 left-6 right-6 h-0.5 bg-primary rounded-full"
                      />
                    )}
                  </button>
                </div>
              )}

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {!canManageJob || activeTab === "details" ? (
                  <JobDetailsContent job={job} />
                ) : (
                  <JobDetailsApplicants
                    applicants={realApplicants}
                    isLoading={isLoadingApplicants}
                    jobId={job.id}
                  />
                )}
              </div>

              {/* Sticky Action Footer: Only visible to candidates and visitors, never for company/employer accounts */}
              {!canManageJob && userRole !== "EMPLOYER" && userRole !== "ADMIN" && (
                <div className="p-5 border-t border-slate-100 bg-white space-y-2.5 shrink-0">
                  {/* Button 1: AI Job Analyser */}
                  <button
                    onClick={handleAiAnalyserClick}
                    className="w-full h-11 rounded-2xl bg-linear-to-r from-[#00D2EE] via-[#00B4D8] to-[#0A54B1] hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-sky-400/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>AI Job Analyser</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>

                  {/* Button 2: Apply Now */}
                  <button
                    disabled={appliedState}
                    onClick={handleApplyClick}
                    className={cn(
                      "w-full h-11 rounded-2xl font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98",
                      appliedState
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                        : "bg-[#0A54B1] hover:bg-[#08428C] text-white shadow-blue-500/15"
                    )}
                  >
                    {appliedState ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Application Submitted</span>
                      </>
                    ) : (
                      <>
                        <span>Apply Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  {/* Footer Subtext */}
                  <p className="text-[11px] text-slate-400 text-center font-medium pt-0.5">
                    Usually responds within 3–5 business days
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apply Modal */}
      {isApplyModalOpen && (
        <ApplyModal
          job={job as any}
          isOpen={isApplyModalOpen}
          onClose={() => {
            setIsApplyModalOpen(false);
            if (hasAppliedLocally) {
              onClose();
            }
          }}
          onApplied={(jobId) => {
            setHasAppliedLocally(true);
            onApplied?.(jobId);
          }}
        />
      )}

      {/* Edit Job Modal */}
      {isEditModalOpen && (
        <EditJobModal
          job={job as any}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={() => {
            setIsEditModalOpen(false);
            onClose();
          }}
        />
      )}

      {/* AI Candidate Job Fit Analyzer Modal */}
      {isAnalyzerModalOpen && job && (
        <JobAnalyzerModal
          job={job as any}
          isOpen={isAnalyzerModalOpen}
          onClose={() => setIsAnalyzerModalOpen(false)}
          onApplyNow={() => {
            setIsAnalyzerModalOpen(false);
            handleApplyClick();
          }}
        />
      )}

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign In to Analyze Job Fit"
        description="Sign in to your candidate account to scan your resume against this job's requirements and see your real-time match score."
      />
    </>
  );

  return createPortal(sheetContent, document.body);
}
