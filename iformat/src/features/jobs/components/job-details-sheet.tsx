"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  DollarSign,
  Calendar,
  Briefcase,
  CheckCircle2,
  Sparkles,
  Download,
  Check,
  Loader2,
  FileText,
  Edit3,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import { cn } from "@/lib/utils";
import { Job, Applicant } from "./job-card";
import { ApplyModal } from "./apply-modal";
import { EditJobModal } from "./edit-job-modal";
import { useDeleteJob } from "@/hooks";
import { toast } from "sonner";

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
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadAllState, setDownloadAllState] = useState<"idle" | "loading" | "success">("idle");
  const [downloadedApplicants, setDownloadedApplicants] = useState<Record<string, boolean>>({});

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

  const typeStyles: Record<string, string> = {
    "Full Time": "text-[#0A54B1] bg-sky-50 border border-sky-100",
    "Part Time": "text-indigo-600 bg-indigo-50 border border-indigo-100",
    Contract: "text-amber-600 bg-amber-50 border border-amber-100",
  };

  const locationStyles: Record<string, string> = {
    Remote: "text-sky-600 bg-sky-50 border border-sky-100",
    Onsite: "text-slate-600 bg-slate-50 border border-slate-100",
    Hybrid: "text-purple-600 bg-purple-50 border border-purple-100",
  };

  const typeClass = typeStyles[job.jobType] || "text-slate-600 bg-slate-50 border border-slate-100";
  const locationClass = locationStyles[job.location] || "text-sky-600 bg-sky-50 border border-sky-100";
  const displayDate = job.date || (job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Active");
  const logoLetter = job.logoLetter || job.company?.charAt(0)?.toUpperCase() || "C";
  const logoBg = job.logoBg || "bg-[#0A54B1]";

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
            <div className="p-6 border-b border-slate-100 flex items-start justify-between relative bg-slate-50/50">
              <div className="flex items-center gap-4 pr-8">
                {/* Company Logo Letter */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-sm shrink-0",
                    logoBg
                  )}
                >
                  {logoLetter}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 leading-snug tracking-tight">
                    {job.title}
                  </h2>
                  <p className="text-sm font-semibold text-slate-500 mt-0.5">{job.company}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isEmployerOrAdmin && (
                  <div className="flex items-center gap-1.5 mr-8">
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-50 text-[#0A54B1] hover:bg-sky-100 font-bold text-xs border border-sky-100 transition-colors cursor-pointer"
                      title="Edit this job posting"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={handleDeleteJob}
                      disabled={isDeleting}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs border border-rose-100 transition-colors cursor-pointer"
                      title="Delete this job posting"
                    >
                      {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors absolute top-6 right-6 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Badges Bar */}
            <div className="px-6 py-4 flex flex-wrap gap-2 items-center bg-white border-b border-slate-50">
              <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-lg", typeClass)}>
                {job.jobType}
              </span>
              <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-lg", locationClass)}>
                <MapPin className="w-3.5 h-3.5 inline mr-1" />
                {job.location}
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                <DollarSign className="w-3.5 h-3.5 inline mr-1" />
                {job.salary}
              </span>
              <span className="text-xs font-semibold text-rose-500 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-lg">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                Posted {displayDate}
              </span>
            </div>

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
                /* JOB DETAILS TAB */
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      About the Role
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {job.description}
                    </p>
                  </div>

                  {/* Responsibilities */}
                  {job.responsibilities && job.responsibilities.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-primary" /> Key Responsibilities
                      </h3>
                      <ul className="space-y-2.5">
                        {job.responsibilities.map((resp, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Requirements */}
                  {job.requirements && job.requirements.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#0A54B1]" /> Requirements
                      </h3>
                      <ul className="space-y-2.5">
                        {job.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                            <CheckCircle2 className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Nice To Have */}
                  {job.niceToHave && job.niceToHave.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" /> Nice to Have
                      </h3>
                      <ul className="space-y-2.5">
                        {job.niceToHave.map((nth, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 mt-1 shrink-0" />
                            <span>{nth}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Perks & Benefits */}
                  {job.perks && job.perks.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                        Perks & Benefits
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {job.perks.map((perk, i) => (
                          <span
                            key={i}
                            className="text-xs font-semibold px-3 py-1.5 bg-sky-50 text-sky-600 rounded-full border border-sky-100"
                          >
                            {perk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* APPLICANTS TAB */
                <div className="space-y-6">
                  {applicants.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                      <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
                        <FileText className="w-8 h-8" />
                      </div>
                      <p className="text-sm text-slate-500 font-medium">No applications yet for this role.</p>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
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
