"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Filter,
  Flame,
  Loader2,
  Mail,
  MoreVertical,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  X,
  AlertCircle,
  TrendingUp,
  FileText,
  Check,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/use-auth-store";
import { jobsService } from "@/services/jobs.service";
import { screeningService } from "@/services/screening.service";
import {
  ApplicationStatus,
  JobApplicantDTO,
  JobDTO,
  ScreeningResultDTO,
} from "@/types/api";

const STATUS_FILTERS: Array<{ label: string; value: ApplicationStatus | "ALL" }> = [
  { label: "All Applicants", value: "ALL" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Screened", value: "SCREENED" },
  { label: "Shortlisted", value: "SHORTLISTED" },
  { label: "Interviewing", value: "INTERVIEWING" },
  { label: "Offered", value: "OFFERED" },
  { label: "Hired", value: "HIRED" },
  { label: "Rejected", value: "REJECTED" },
];

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

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/dashboard/jobs/${jobId}/applicants`)}`);
      return;
    }
    loadData();
  }, [isAuthenticated, jobId, loadData, router]);

  // Trigger or re-run AI screening
  const handleRerunScreening = async (applicationId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setIsRerunning((prev) => ({ ...prev, [applicationId]: true }));
      const result = await screeningService.rerunScreening(applicationId);

      // Update state locally
      setApplicants((prev) =>
        prev.map((app) => {
          if (app.id === applicationId) {
            return {
              ...app,
              status: "SCREENED",
              screeningResult: result,
            };
          }
          return app;
        })
      );

      // If drawer is currently viewing this applicant, update drawer state
      if (selectedApplicantForDrawer?.id === applicationId) {
        setSelectedApplicantForDrawer((prev) =>
          prev
            ? {
                ...prev,
                status: "SCREENED",
                screeningResult: result,
              }
            : null
        );
      }

      toast.success("AI screening evaluated successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to run AI candidate screening.");
    } finally {
      setIsRerunning((prev) => ({ ...prev, [applicationId]: false }));
    }
  };

  // Change applicant status
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

  // Filtered applicants
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
    <main className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs rounded-xl"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Dashboard
            </Button>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-xs text-slate-400 font-medium">Job Postings</span>
          <span className="text-slate-600">/</span>
          <span className="text-xs text-white font-semibold">Applicants & AI Screening</span>
        </div>

        {/* Job Header Card */}
        <div className="bg-linear-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {job?.category || "Job Listing"}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                {(job?.status || "PUBLISHED").toLowerCase()}
              </span>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                {job?.company || user?.companyName || "Your Company"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {job?.title || "Job Applicants"}
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-4 flex-wrap">
              <span>Location: {job?.location || "Remote"}</span>
              <span>•</span>
              <span>Type: {job?.jobType || "Full Time"}</span>
              <span>•</span>
              <span>Total Applicants: <strong className="text-white font-semibold">{applicants.length}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={loadData}
              variant="outline"
              disabled={loading}
              className="border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs h-10 px-4 rounded-xl"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh Data
            </Button>
          </div>
        </div>

        {/* Error Banner */}
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
              className="border-rose-700 bg-rose-900/40 hover:bg-rose-800 text-rose-100 text-xs shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
            </Button>
          </div>
        )}

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by candidate name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setSelectedStatus(f.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedStatus === f.value
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-slate-950/40 text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Applicants List */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3 bg-slate-900/40 rounded-3xl border border-slate-800">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Fetching candidate applications & AI evaluation reports...</p>
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
                className="border-slate-700 text-xs"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplicants.map((app) => {
              const name = app.candidateName || app.candidate?.name || "Candidate";
              const email = app.candidateEmail || app.candidate?.email || "No email available";
              const score = app.screeningResult?.score;
              const hasScreening = typeof score === "number";
              const recommendation = app.screeningResult?.recommendation || "RECOMMEND";
              const appId = app.id || "";
              const rerunning = isRerunning[appId] || false;
              const updating = isUpdatingStatus[appId] || false;

              return (
                <div
                  key={app.id}
                  onClick={() => hasScreening && setSelectedApplicantForDrawer(app)}
                  className={`bg-slate-900/80 border rounded-3xl p-5 sm:p-6 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
                    hasScreening
                      ? "hover:border-slate-700 cursor-pointer border-slate-800/90"
                      : "border-slate-800/80"
                  }`}
                >
                  {/* Left: Candidate Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-base shrink-0">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-base font-bold text-white">{name}</h3>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            app.status === "SHORTLISTED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : app.status === "SCREENED"
                              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                              : app.status === "INTERVIEWING"
                              ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                              : app.status === "OFFERED" || app.status === "HIRED"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : app.status === "REJECTED"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {app.status || "SUBMITTED"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-500" /> {email}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          Applied {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "Recently"}
                        </span>
                      </div>
                      {app.coverNote && (
                        <p className="text-xs text-slate-400/90 line-clamp-1 italic mt-1 max-w-xl">
                          &ldquo;{app.coverNote}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Middle: AI Screening Score Badge */}
                  <div className="flex items-center gap-4 flex-wrap lg:flex-nowrap">
                    {hasScreening ? (
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                            score! >= 80
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : score! >= 60
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {score}%
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-xs font-bold text-white">
                              {recommendation === "RECOMMEND" || recommendation === "STRONG_MATCH"
                                ? "Strong Fit"
                                : recommendation === "CONSIDER"
                                ? "Moderate Match"
                                : "Low Alignment"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate max-w-50">
                            {app.screeningResult?.summary || "Screening score calculated by AI engine."}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
                        <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>Not screened yet</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {hasScreening ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApplicantForDrawer(app)}
                          className="border-slate-800 bg-slate-950/40 hover:bg-slate-800 text-slate-300 text-xs h-9 rounded-xl font-medium"
                        >
                          View Evaluation
                        </Button>
                      ) : null}

                      <Button
                        size="sm"
                        disabled={rerunning}
                        onClick={(e) => handleRerunScreening(appId, e)}
                        className={`text-xs h-9 rounded-xl font-semibold transition-all ${
                          hasScreening
                            ? "border border-slate-800 bg-slate-950/40 hover:bg-slate-800 text-slate-300"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
                        }`}
                      >
                        {rerunning ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Screening...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                            {hasScreening ? "Re-run" : "Run AI Screen"}
                          </>
                        )}
                      </Button>

                      {/* Status Dropdown */}
                      <select
                        value={app.status || "SUBMITTED"}
                        disabled={updating}
                        onChange={(e) =>
                          handleUpdateStatus(appId, e.target.value as ApplicationStatus)
                        }
                        className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="SUBMITTED">Submitted</option>
                        <option value="SCREENED">Screened</option>
                        <option value="SHORTLISTED">Shortlisted</option>
                        <option value="INTERVIEWING">Interviewing</option>
                        <option value="OFFERED">Offered</option>
                        <option value="HIRED">Hired</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Evaluation Drawer / Modal */}
      {selectedApplicantForDrawer && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    AI Screening Report
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Model: {selectedApplicantForDrawer.screeningResult?.modelUsed || "gpt-4o-mini"}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white">
                  {selectedApplicantForDrawer.candidateName || selectedApplicantForDrawer.candidate?.name || "Candidate Evaluation"}
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedApplicantForDrawer.candidateEmail || selectedApplicantForDrawer.candidate?.email}
                </p>
              </div>

              <button
                onClick={() => setSelectedApplicantForDrawer(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Score & Recommendation Banner */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-2xl ${
                    (selectedApplicantForDrawer.screeningResult?.score || 0) >= 80
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : (selectedApplicantForDrawer.screeningResult?.score || 0) >= 60
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {selectedApplicantForDrawer.screeningResult?.score || 0}%
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Overall ATS Alignment</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Recommendation:{" "}
                    <strong className="text-indigo-400 uppercase font-semibold">
                      {selectedApplicantForDrawer.screeningResult?.recommendation || "RECOMMEND"}
                    </strong>
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                disabled={isRerunning[selectedApplicantForDrawer.id || ""]}
                onClick={() => handleRerunScreening(selectedApplicantForDrawer.id || "")}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 rounded-xl font-semibold shadow-md"
              >
                {isRerunning[selectedApplicantForDrawer.id || ""] ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                )}
                Re-evaluate
              </Button>
            </div>

            {/* AI Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Evaluation Executive Summary</h4>
              <p className="text-xs text-slate-300 leading-relaxed p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                {selectedApplicantForDrawer.screeningResult?.summary || "No executive summary provided."}
              </p>
            </div>

            {/* Breakdown Bars (if available in raw response) */}
            {selectedApplicantForDrawer.screeningResult?.rawAiResponse?.scoreBreakdown && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Category Score Breakdown</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(
                    selectedApplicantForDrawer.screeningResult.rawAiResponse.scoreBreakdown
                  ).map(([cat, val]) => (
                    <div key={cat} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                      <div className="text-lg font-bold text-indigo-400">{val}%</div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                        {cat.replace(/([A-Z])/g, " $1")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths & Gaps Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="space-y-2 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Core Candidate Strengths
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  {selectedApplicantForDrawer.screeningResult?.strengths?.length ? (
                    selectedApplicantForDrawer.screeningResult.strengths.map((str, i) => (
                      <li key={i} className="leading-tight">{str}</li>
                    ))
                  ) : (
                    <li className="text-slate-500 italic list-none">No specific strengths highlighted</li>
                  )}
                </ul>
              </div>

              {/* Gaps / Areas to Probe */}
              <div className="space-y-2 p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Areas to Probe in Interview
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  {selectedApplicantForDrawer.screeningResult?.gaps?.length ? (
                    selectedApplicantForDrawer.screeningResult.gaps.map((gap, i) => (
                      <li key={i} className="leading-tight">{gap}</li>
                    ))
                  ) : (
                    <li className="text-slate-500 italic list-none">No major gaps identified</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Quick Status Action Footer */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800 gap-3 flex-wrap">
              <span className="text-xs text-slate-400 font-medium">Quick Status Transition:</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleUpdateStatus(selectedApplicantForDrawer.id || "", "SHORTLISTED")
                  }
                  className="border-emerald-700/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 text-xs h-8 rounded-lg"
                >
                  Shortlist Candidate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleUpdateStatus(selectedApplicantForDrawer.id || "", "INTERVIEWING")
                  }
                  className="border-sky-700/60 bg-sky-950/40 text-sky-300 hover:bg-sky-900/60 text-xs h-8 rounded-lg"
                >
                  Invite to Interview
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleUpdateStatus(selectedApplicantForDrawer.id || "", "REJECTED")
                  }
                  className="border-rose-700/60 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 text-xs h-8 rounded-lg"
                >
                  Decline
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
