"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import { cn } from "@/lib/utils";
import { Job } from "./job-card";
import { ApplyModal } from "./apply-modal";
import { EditJobModal } from "./edit-job-modal";
import { useDeleteJob } from "@/hooks";
import { toast } from "sonner";

import { JobDetailsHeader } from "./details/job-details-header";
import { JobDetailsBadges } from "./details/job-details-badges";
import { JobDetailsContent } from "./details/job-details-content";
import { JobDetailsApplicants } from "./details/job-details-applicants";

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
  const { user, isAuthenticated } = useAuthStore();
  const userRole = user?.role?.toUpperCase();
  const isEmployerOrAdmin = userRole === "EMPLOYER" || userRole === "ADMIN";

  const [activeTab, setActiveTab] = useState<"details" | "applicants">("details");
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasAppliedLocally, setHasAppliedLocally] = useState(false);

  const deleteJobMutation = useDeleteJob();

  if (!job) return null;

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
  const applicants = job.applicants || [];
  const applicantsCount = job._count?.applications ?? applicants.length;

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

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div key="job-details-sheet-container">
            {/* Backdrop Overlay */}
            <motion.div
              key="job-details-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 transition-opacity"
            />

            {/* Drawer Sheet Container */}
            <motion.div
              key="job-details-drawer"
              initial={{ x: "100%", opacity: 0.95 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.95 }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              data-lenis-prevent
              className="fixed top-4 right-4 bottom-4 w-full max-w-xl bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden border border-slate-100"
            >
              {/* Header */}
              <JobDetailsHeader
                job={job}
                isEmployerOrAdmin={isEmployerOrAdmin}
                isDeleting={isDeleting}
                onEdit={() => setIsEditModalOpen(true)}
                onDelete={handleDeleteJob}
                onClose={onClose}
              />

              {/* Badges Bar */}
              <JobDetailsBadges job={job} />

              {/* Tab Switcher */}
              {isEmployerOrAdmin && (
                <div className="flex bg-white px-6 border-b border-slate-100">
                  <button
                    onClick={() => setActiveTab("details")}
                    className="relative py-4 pr-6 text-sm font-bold focus:outline-none cursor-pointer"
                  >
                    <span className={activeTab === "details" ? "text-primary" : "text-slate-500 hover:text-slate-700"}>
                      Job Details
                    </span>
                    {activeTab === "details" && (
                      <motion.div
                        layoutId="active-tab-underline"
                        className="absolute bottom-0 left-0 right-6 h-0.5 bg-primary"
                      />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("applicants")}
                    className="relative py-4 px-6 text-sm font-bold focus:outline-none cursor-pointer flex items-center gap-1.5"
                  >
                    <span className={activeTab === "applicants" ? "text-primary" : "text-slate-500 hover:text-slate-700"}>
                      Applicants
                    </span>
                    <span
                      className={cn(
                        "text-xs font-semibold px-2 py-0.5 rounded-full",
                        activeTab === "applicants"
                          ? "bg-primary/10 text-primary"
                          : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {applicantsCount}
                    </span>
                    {activeTab === "applicants" && (
                      <motion.div
                        layoutId="active-tab-underline"
                        className="absolute bottom-0 left-6 right-6 h-0.5 bg-primary"
                      />
                    )}
                  </button>
                </div>
              )}

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200">
                {activeTab === "details" ? (
                  <JobDetailsContent job={job} />
                ) : (
                  <JobDetailsApplicants applicants={applicants} />
                )}
              </div>

              {/* Bottom Apply Action Bar (Visible only on Details tab) */}
              {activeTab === "details" && (
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-400">Offered Compensation</span>
                    <span className="text-base font-extrabold text-[#0A54B1]">{job.salary}</span>
                  </div>

                  {appliedState ? (
                    <button
                      disabled
                      className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-sm px-6 py-3 rounded-2xl flex items-center gap-2 cursor-default shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Applied Successfully
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyClick}
                      className="bg-primary hover:bg-primary/95 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all active:scale-95 cursor-pointer"
                    >
                      Apply for this Position
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Apply Modal */}
      {isApplyModalOpen && (
        <ApplyModal
          job={job}
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onApplied={(appliedJobId) => {
            setHasAppliedLocally(true);
            onApplied?.(appliedJobId);
          }}
        />
      )}

      {/* Edit Job Modal */}
      {isEditModalOpen && (
        <EditJobModal
          job={job}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </>
  );
}
