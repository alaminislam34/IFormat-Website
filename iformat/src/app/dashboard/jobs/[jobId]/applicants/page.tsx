"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, User, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/use-auth-store";
import { jobsService } from "@/services/jobs.service";
import { screeningService } from "@/services/screening.service";
import { ApplicationStatus, JobApplicantDTO, JobDTO } from "@/types/api";

import { ApplicantsHeader } from "@/features/applicants/components/applicants-header";
import { ApplicantsFilterToolbar } from "@/features/applicants/components/applicants-filter-toolbar";
import { ApplicantCardRow } from "@/features/applicants/components/applicant-card-row";
import { ApplicantScreeningModal } from "@/features/applicants/components/applicant-screening-modal";

export default function JobApplicantsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const jobId = params?.jobId as string;

  const [job, setJob] = React.useState<JobDTO | null>(null);
  const [applicants, setApplicants] = React.useState<JobApplicantDTO[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState<ApplicationStatus | "ALL">("ALL");
  const [selectedApplicantForDrawer, setSelectedApplicantForDrawer] = React.useState<JobApplicantDTO | null>(null);

  const [isRerunning, setIsRerunning] = React.useState<Record<string, boolean>>({});
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState<Record<string, boolean>>({});

  const loadData = React.useCallback(async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      setError(null);

      const [jobData, applicantsData] = await Promise.all([
        jobsService.getJobById(jobId).catch(() => null),
        jobsService.getJobApplicants(jobId),
      ]);

      if (jobData) setJob(jobData);
      setApplicants(Array.isArray(applicantsData) ? applicantsData : (applicantsData as any)?.applications || []);
    } catch (err: any) {
      const msg = err?.message || "Failed to load job applicants. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const isEmployerOrAdmin =
    user?.role === "employer" ||
    user?.role === "EMPLOYER" ||
    user?.role === "admin" ||
    user?.role === "ADMIN";

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/dashboard/jobs/${jobId}/applicants`)}`);
      return;
    }
    if (!isEmployerOrAdmin) {
      toast.error("Applicant management is restricted to employers and hiring managers.");
      router.replace("/dashboard");
      return;
    }
    loadData();
  }, [isAuthenticated, isEmployerOrAdmin, jobId, loadData, router]);

  const handleRerunScreening = async (applicationId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setIsRerunning((prev) => ({ ...prev, [applicationId]: true }));
      const result = await screeningService.rerunScreening(applicationId);

      setApplicants((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status: "SCREENED", screeningResult: result } : app))
      );

      if (selectedApplicantForDrawer?.id === applicationId) {
        setSelectedApplicantForDrawer((prev) =>
          prev ? { ...prev, status: "SCREENED", screeningResult: result } : null
        );
      }

      toast.success("AI screening evaluated successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to run AI candidate screening.");
    } finally {
      setIsRerunning((prev) => ({ ...prev, [applicationId]: false }));
    }
  };

  const handleUpdateStatus = async (
    applicationId: string,
    newStatus: ApplicationStatus,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    try {
      setIsUpdatingStatus((prev) => ({ ...prev, [applicationId]: true }));
      await jobsService.updateApplicationStatus({
        applicationId,
        status: newStatus,
      });

      setApplicants((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
      );

      if (selectedApplicantForDrawer?.id === applicationId) {
        setSelectedApplicantForDrawer((prev) =>
          prev ? { ...prev, status: newStatus } : null
        );
      }

      toast.success(`Application updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err?.message || `Failed to update status to ${newStatus}`);
    } finally {
      setIsUpdatingStatus((prev) => ({ ...prev, [applicationId]: false }));
    }
  };

  const filteredApplicants = applicants.filter((app) => {
    const candidateName = app.candidateName || app.candidate?.name || "";
    const candidateEmail = app.candidateEmail || app.candidate?.email || "";
    const matchesSearch =
      candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidateEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "ALL" ? true : app.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <section className="min-h-screen bg-slate-950 text-slate-100 py-8 p-6 relative selection:bg-sky-100 selection:text-sky-900">
      <div className="space-y-8 relative z-10">
        <ApplicantsHeader
          job={job}
          userCompanyName={user?.companyName}
          totalApplicants={applicants.length}
          loading={loading}
          onRefresh={loadData}
        />

        {error && (
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-white">Could not retrieve applicants</h4>
                <p className="text-xs text-rose-300/80 mt-0.5">{error}</p>
              </div>
            </div>
            <Button
              onClick={loadData}
              variant="outline"
              size="sm"
              className="border-rose-700 bg-rose-900/40 hover:bg-rose-800 text-rose-100 text-xs shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
            </Button>
          </div>
        )}

        <ApplicantsFilterToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 shrink-0" />
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-36 bg-slate-800 rounded-md" />
                      <div className="h-5 w-20 bg-slate-800/60 rounded-full" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-3.5 w-48 bg-slate-800/70 rounded-md" />
                      <div className="h-3.5 w-28 bg-slate-800/50 rounded-md" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800/60">
                  <div className="h-9 w-28 bg-slate-800 rounded-xl" />
                  <div className="h-9 w-24 bg-slate-800/60 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-slate-900/30 rounded-3xl border border-slate-800/80 p-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <User className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No applicants found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery || selectedStatus !== "ALL"
                  ? "No candidates match your active filters. Try clearing your search."
                  : "No candidates have applied to this position yet. Check back soon!"}
              </p>
            </div>
            {(searchQuery || selectedStatus !== "ALL") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("ALL");
                }}
                className="border-slate-700 text-xs cursor-pointer"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplicants.map((app) => (
              <ApplicantCardRow
                key={app.id}
                app={app}
                isRerunning={isRerunning[app.id || ""] || false}
                isUpdating={isUpdatingStatus[app.id || ""] || false}
                onOpenDrawer={(a) => setSelectedApplicantForDrawer(a)}
                onRerunScreening={handleRerunScreening}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        )}
      </div>

      <ApplicantScreeningModal
        applicant={selectedApplicantForDrawer}
        isRerunning={isRerunning[selectedApplicantForDrawer?.id || ""] || false}
        onClose={() => setSelectedApplicantForDrawer(null)}
        onRerunScreening={handleRerunScreening}
        onUpdateStatus={handleUpdateStatus}
      />
    </section>
  );
}
