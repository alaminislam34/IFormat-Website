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
    <main className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <DashboardWelcomeHeader
          userName={user?.name}
          isEmployer={isEmployer}
          emailVerified={user?.emailVerified}
        />

        {/* Error Banner */}
        {error && (
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-white">Couldn&apos;t load your dashboard data</h4>
                <p className="text-xs text-rose-300/80 mt-0.5">{error}</p>
              </div>
            </div>
            <Button
              onClick={loadDashboardData}
              disabled={loading}
              variant="outline"
              size="sm"
              className="border-rose-700 bg-rose-900/40 hover:bg-rose-800 text-rose-100 text-xs shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Retry
            </Button>
          </div>
        )}

        {/* Quick Stats Grid */}
        <DashboardStatsGrid
          isEmployer={isEmployer}
          employerJobs={employerJobs}
          applications={applications}
        />

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Primary Column (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {isEmployer ? "My Job Listings" : "Recent Applications"}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {isEmployer
                      ? "Manage your company job posts and evaluate submissions."
                      : "Real-time status updates of your submitted applications."}
                  </p>
                </div>
                {isEmployer ? (
                  <Link href="/company-details">
                    <Button variant="ghost" size="sm" className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">
                      Manage Jobs <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/job-portal">
                    <Button variant="ghost" size="sm" className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">
                      Explore More Jobs <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>

              {isEmployer ? (
                <EmployerJobsList
                  employerJobs={employerJobs}
                  loading={loading}
                  deletingJobId={deletingJobId}
                  onEditJob={setEditingJob}
                  onDeleteJob={handleDeleteJob}
                />
              ) : (
                <CandidateApplicationsList
                  applications={applications}
                  loading={loading}
                />
              )}
            </div>
          </div>

          {/* Right / Shortcut Column (1 col) */}
          <DashboardSidebarShortcuts />
        </div>
      </div>

      {/* Edit Job Modal */}
      {editingJob && (
        <EditJobModal
          job={editingJob}
          isOpen={!!editingJob}
          onClose={() => setEditingJob(null)}
          onUpdated={handleJobUpdated}
        />
      )}
    </main>
  );
}
