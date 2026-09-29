"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminService, AdminJobItemDTO } from "@/services/admin.service";
import { AdminPageHeader } from "@/features/admin/components/shared/admin-page-header";
import { ToastBanner } from "@/features/admin/components/shared/toast-banner";
import { JobFilterBar } from "@/features/admin/components/jobs/job-filter-bar";
import { JobTable } from "@/features/admin/components/jobs/job-table";
import { Pagination } from "@/components/ui/table";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<AdminJobItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const params: any = {
        includeDeleted,
        page,
        limit: pageSize,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "ALL") params.status = statusFilter;

      const res = await adminService.listJobs(params);
      if (res) {
        setJobs(Array.isArray(res) ? res : res.jobs || []);
        if (res.meta?.total !== undefined) {
          setTotalCount(res.meta.total);
        }
      }
    } catch (err: any) {
      console.warn("Could not load jobs:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [page, pageSize, statusFilter, includeDeleted]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
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
          className={`rounded-xl text-xs font-semibold h-10 px-4 transition-all shadow-xs ${
            includeDeleted
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
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

      <Pagination
        card
        currentPage={page}
        pageSize={pageSize}
        totalCount={totalCount}
        loading={loading}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
      />
    </div>
  );
}
