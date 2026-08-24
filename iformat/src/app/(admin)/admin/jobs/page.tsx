"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminService, AdminJobItemDTO } from "@/services/admin.service";
import { AdminPageHeader } from "@/features/admin/components/shared/admin-page-header";
import { ToastBanner } from "@/features/admin/components/shared/toast-banner";
import { JobFilterBar } from "@/features/admin/components/jobs/job-filter-bar";
import { JobTable } from "@/features/admin/components/jobs/job-table";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<AdminJobItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const params: any = { includeDeleted };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "ALL") params.status = statusFilter;

      const res = await adminService.listJobs(params);
      if (res?.jobs) setJobs(res.jobs);
    } catch (err: any) {
      console.warn("Could not load jobs:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [statusFilter, includeDeleted]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs();
  };

  const handleUpdateStatus = async (jobId: string, newStatus: string) => {
    try {
      await adminService.updateJobStatus(jobId, newStatus);
      setToastMessage(`Job status updated to ${newStatus}.`);
      loadJobs();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const handleSoftDelete = async (job: AdminJobItemDTO) => {
    if (!confirm(`Are you sure you want to soft-delete "${job.title}"?`)) return;
    try {
      await adminService.softDeleteJob(job.id);
      setToastMessage(`Job "${job.title}" soft-deleted.`);
      loadJobs();
    } catch (err: any) {
      alert(err.message || "Failed to soft delete job");
    }
  };

  const handleRestore = async (job: AdminJobItemDTO) => {
    try {
      await adminService.restoreJob(job.id);
      setToastMessage(`Job "${job.title}" restored.`);
      loadJobs();
    } catch (err: any) {
      alert(err.message || "Failed to restore job");
    }
  };

  return (
    <div className="space-y-6">
      <ToastBanner message={toastMessage} onClose={() => setToastMessage(null)} />

      <AdminPageHeader
        title="Job Moderation Queue"
        description="Review live postings, override job statuses, and manage soft-deleted listings."
      >
        <Button
          onClick={() => setIncludeDeleted(!includeDeleted)}
          variant="outline"
          className={`rounded-xl text-xs font-bold h-10 px-4 transition-all ${
            includeDeleted
              ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <Trash2 className="w-3.5 h-3.5 mr-2" />
          {includeDeleted ? "Showing Soft-Deleted" : "Show Soft-Deleted (Trash)"}
        </Button>
      </AdminPageHeader>

      <JobFilterBar
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        search={search}
        setSearch={setSearch}
        onSearchSubmit={handleSearchSubmit}
      />

      <JobTable
        jobs={jobs}
        loading={loading}
        onUpdateStatus={handleUpdateStatus}
        onSoftDelete={handleSoftDelete}
        onRestore={handleRestore}
      />
    </div>
  );
}
