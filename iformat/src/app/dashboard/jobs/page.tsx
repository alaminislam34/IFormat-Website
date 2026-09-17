"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Plus,
  Search,
  Users,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/use-auth-store";
import { jobsService } from "@/services/jobs.service";
import { JobDTO } from "@/types/api";
import { EmployerJobsList } from "@/features/dashboard/components/employer-jobs-list";
import { AddJobModal } from "@/features/jobs/components/add-job-modal";
import { EditJobModal } from "@/features/jobs/components/edit-job-modal";

export default function EmployerJobsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [jobs, setJobs] = React.useState<JobDTO[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Modals state
  const [isAddJobModalOpen, setIsAddJobModalOpen] = React.useState(false);
  const [editingJob, setEditingJob] = React.useState<JobDTO | null>(null);
  const [deletingJobId, setDeletingJobId] = React.useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState<"ALL" | "PUBLISHED" | "ARCHIVED">("ALL");

  const isEmployer = user?.role === "employer" || user?.role === "EMPLOYER";

  const fetchJobs = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await jobsService.getEmployerJobs();
      setJobs(data || []);
    } catch (err: any) {
      const msg = err?.message || "Failed to load job postings.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/dashboard/jobs");
      return;
    }
    // If candidate, redirect to candidate applications
    if (user && !isEmployer) {
      router.push("/dashboard/applications");
      return;
    }
    fetchJobs();
  }, [isAuthenticated, isEmployer, user, router, fetchJobs]);

  const handleAddJob = async (jobData: any) => {
    try {
      await jobsService.createJob(jobData);
      toast.success("Job posting created successfully!");
      setIsAddJobModalOpen(false);
      fetchJobs();
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeleteJob = async (jobId: string, title: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${title}"? This will archive the posting and remove it from public search.`
      )
    ) {
      return;
    }

    try {
      setDeletingJobId(jobId);
      await jobsService.deleteJob(jobId);
      toast.success(`Job "${title}" deleted successfully.`);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete job posting.");
    } finally {
      setDeletingJobId(null);
    }
  };

  const handleJobUpdated = (updated: JobDTO) => {
    setJobs((prev) => prev.map((j) => (j.id === updated.id ? { ...j, ...updated } : j)));
  };

  // Filtered jobs list
  const filteredJobs = React.useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        !searchQuery.trim() ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "PUBLISHED" && (!job.status || job.status === "PUBLISHED")) ||
        (selectedStatus === "ARCHIVED" && (job.status === "ARCHIVED" || job.status === "CLOSED"));

      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchQuery, selectedStatus]);

  // Aggregate stats
  const totalApplicants = React.useMemo(() => {
    return jobs.reduce((acc, j) => acc + (j._count?.applications || j.applicants?.length || 0), 0);
  }, [jobs]);

  return (
    <div className="text-slate-900 py-8 p-6 relative selection:bg-sky-100 selection:text-sky-900 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0A54B1] flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Job Postings & Hiring
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Publish openings, manage vacancies, and review applicants with AI screening.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsAddJobModalOpen(true)}
            className="h-10 px-5 rounded-xl bg-[#0A54B1] hover:bg-[#08448f] text-white font-bold text-xs shadow-md shadow-blue-500/15 flex items-center gap-2 cursor-pointer active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Post A New Job</span>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#0A54B1] flex items-center justify-center font-black">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Postings</p>
            <p className="text-2xl font-black text-slate-900">{jobs.length}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Active Vacancies</p>
            <p className="text-2xl font-black text-slate-900">
              {jobs.filter((j) => !j.status || j.status === "PUBLISHED").length}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Candidates</p>
            <p className="text-2xl font-black text-slate-900">{totalApplicants}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 sm:p-8 space-y-6">
        {/* Search & Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title, category, or location..."
              className="pl-10 h-10 text-xs rounded-xl bg-slate-50/70 border-slate-200 focus:bg-white focus:ring-[#0A54B1]"
            />
          </div>

          <div className="flex items-center gap-2">
            {(["ALL", "PUBLISHED", "ARCHIVED"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === status
                    ? "bg-[#0A54B1] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status === "ALL" ? "All Postings" : status === "PUBLISHED" ? "Active" : "Archived"}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchJobs}
              className="px-3 py-1 bg-white rounded-lg border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}

        {/* Jobs List */}
        <EmployerJobsList
          employerJobs={filteredJobs}
          loading={loading}
          deletingJobId={deletingJobId}
          onEditJob={(job) => setEditingJob(job)}
          onDeleteJob={handleDeleteJob}
          onPostJobClick={() => setIsAddJobModalOpen(true)}
        />
      </div>

      {/* Add Job Modal */}
      {isAddJobModalOpen && (
        <AddJobModal
          isOpen={isAddJobModalOpen}
          onClose={() => setIsAddJobModalOpen(false)}
          onSubmit={handleAddJob}
        />
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <EditJobModal
          isOpen={!!editingJob}
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onUpdated={handleJobUpdated}
        />
      )}
    </div>
  );
}
