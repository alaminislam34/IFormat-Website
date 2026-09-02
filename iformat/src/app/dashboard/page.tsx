"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/use-auth-store";
import { jobsService } from "@/services/jobs.service";
import { JobApplicantDTO, JobDTO } from "@/types/api";
import { EditJobModal } from "@/features/jobs/components/edit-job-modal";
import { AddJobModal } from "@/features/jobs/components/add-job-modal";

import { DashboardWelcomeHeader } from "@/features/dashboard/components/dashboard-welcome-header";
import { DashboardStatsGrid } from "@/features/dashboard/components/dashboard-stats-grid";
import { EmployerJobsList } from "@/features/dashboard/components/employer-jobs-list";
import { CandidateApplicationsList } from "@/features/dashboard/components/candidate-applications-list";
import { DashboardSidebarShortcuts } from "@/features/dashboard/components/dashboard-sidebar-shortcuts";

export default function UserDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [applications, setApplications] = React.useState<JobApplicantDTO[]>([]);
  const [employerJobs, setEmployerJobs] = React.useState<JobDTO[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isAddJobModalOpen, setIsAddJobModalOpen] = React.useState(false);
  const [editingJob, setEditingJob] = React.useState<JobDTO | null>(null);
  const [deletingJobId, setDeletingJobId] = React.useState<string | null>(null);

  const isEmployer = user?.role === "employer" || user?.role === "EMPLOYER";

  const loadDashboardData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (isEmployer) {
        const jobs = await jobsService.getEmployerJobs();
        setEmployerJobs(jobs || []);
      } else {
        const apps = await jobsService.getCandidateApplications();
        setApplications(apps || []);
      }
    } catch (err: any) {
      const errMsg = err?.message || "Failed to load dashboard data. Please check your connection.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [isEmployer]);

  const handleAddJob = async (jobData: any) => {
    try {
      await jobsService.createJob(jobData);
      toast.success("Job posting created successfully!");
      setIsAddJobModalOpen(false);
      loadDashboardData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create job posting.");
    }
  };

  const handleDeleteJob = async (jobId: string, title: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the job posting "${title}"? This will archive the posting and remove it from the active portal.`
      )
    ) {
      return;
    }
    try {
      setDeletingJobId(jobId);
      await jobsService.deleteJob(jobId);
      toast.success(`Job "${title}" deleted successfully.`);
      setEmployerJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete job.");
    } finally {
      setDeletingJobId(null);
    }
  };

  const handleJobUpdated = (updated: JobDTO) => {
    setEmployerJobs((prev) => prev.map((j) => (j.id === updated.id ? { ...j, ...updated } : j)));
  };

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    loadDashboardData();
  }, [isAuthenticated, loadDashboardData, router]);

  return (
    <div className="text-slate-900 py-8 ">
      <div className="w-11/12 mx-auto space-y-8">
        <DashboardWelcomeHeader
          userName={user?.name}
          isEmployer={isEmployer}
          emailVerified={user?.emailVerified}
          onPostJobClick={() => setIsAddJobModalOpen(true)}
        />

        {error && (
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Couldn&apos;t load your dashboard data</h4>
                <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold shrink-0 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 inline mr-1.5 ${loading ? "animate-spin" : ""}`} /> Retry
            </button>
          </div>
        )}

        <DashboardStatsGrid
          isEmployer={isEmployer}
          employerJobs={employerJobs}
          applications={applications}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    {isEmployer ? "Active Job Postings" : "Recent Applications"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isEmployer
                      ? "Manage and review candidates across your active vacancies."
                      : "Overview of your applied positions and recruitment milestones."}
                  </p>
                </div>
                {isEmployer ? (
                  <button
                    onClick={() => setIsAddJobModalOpen(true)}
                    className="text-xs font-extrabold text-[#0A54B1] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Post A Job</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Link
                    href="/job-portal"
                    className="text-xs font-extrabold text-[#0A54B1] hover:underline flex items-center gap-1"
                  >
                    <span>Explore More Jobs</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {isEmployer ? (
                <EmployerJobsList
                  employerJobs={employerJobs}
                  loading={loading}
                  deletingJobId={deletingJobId}
                  onEditJob={(job) => setEditingJob(job)}
                  onDeleteJob={handleDeleteJob}
                  onPostJobClick={() => setIsAddJobModalOpen(true)}
                />
              ) : (
                <CandidateApplicationsList
                  applications={applications}
                  loading={loading}
                />
              )}
            </div>
          </div>

          <div className="space-y-6">
            <DashboardSidebarShortcuts />
          </div>
        </div>
      </div>

      {isAddJobModalOpen && (
        <AddJobModal
          isOpen={isAddJobModalOpen}
          onClose={() => setIsAddJobModalOpen(false)}
          onSubmit={handleAddJob}
        />
      )}

      {editingJob && (
        <EditJobModal
          job={editingJob as any}
          isOpen={!!editingJob}
          onClose={() => setEditingJob(null)}
          onUpdated={() => {
            setEditingJob(null);
            loadDashboardData();
          }}
        />
      )}
    </div>
  );
}
