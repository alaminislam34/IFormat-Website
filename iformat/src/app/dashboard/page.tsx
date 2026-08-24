"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  FileText,
  Sparkles,
  CreditCard,
  PlusCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/use-auth-store";
import { jobsService } from "@/services/jobs.service";
import { JobApplicantDTO, JobDTO } from "@/types/api";

export default function UserDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [applications, setApplications] = React.useState<JobApplicantDTO[]>([]);
  const [employerJobs, setEmployerJobs] = React.useState<JobDTO[]>([]);
  const [loading, setLoading] = React.useState(true);

  const isEmployer = user?.role === "employer" || user?.role === "EMPLOYER";

  React.useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        if (isEmployer) {
          const jobs = await jobsService.getEmployerJobs();
          setEmployerJobs(jobs || []);
        } else {
          const apps = await jobsService.getCandidateApplications();
          setApplications(apps || []);
        }
      } catch (err) {
        console.warn("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isAuthenticated, isEmployer, router]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {isEmployer ? "Employer Workspace" : "Candidate Hub"}
              </span>
              {user?.emailVerified && (
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, {user?.name || "Professional"}!
            </h1>
            <p className="text-sm text-slate-400">
              {isEmployer
                ? "Manage your active job postings, review top candidates, and screen talent with AI."
                : "Track your job applications, enhance your CV, and generate tailored cover letters."}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {isEmployer ? (
              <Link href="/company-details">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/20">
                  <PlusCircle className="w-4 h-4 mr-2" /> Post New Job
                </Button>
              </Link>
            ) : (
              <Link href="/job-assistant">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/20">
                  <Sparkles className="w-4 h-4 mr-2" /> AI Career Assistant
                </Button>
              </Link>
            )}
            <Link href="/dashboard/billing">
              <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-200">
                <CreditCard className="w-4 h-4 mr-2" /> Billing & Plan
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isEmployer ? (
            <>
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{employerJobs.length}</div>
                  <div className="text-xs text-slate-400">Active Job Postings</div>
                </div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {employerJobs.reduce(
                      (acc, job) => acc + (job._count?.applications || job.applicants?.length || 0),
                      0
                    )}
                  </div>
                  <div className="text-xs text-slate-400">Total Applicants</div>
                </div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">AI Active</div>
                  <div className="text-xs text-slate-400">Candidate Screening</div>
                </div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">98.4%</div>
                  <div className="text-xs text-slate-400">Candidate Match Rate</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{applications.length}</div>
                  <div className="text-xs text-slate-400">Jobs Applied</div>
                </div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {applications.filter((a) => a.status === "SCREENED" || a.status === "SHORTLISTED").length}
                  </div>
                  <div className="text-xs text-slate-400">AI Screened / Shortlisted</div>
                </div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {applications.filter((a) => a.status === "SUBMITTED" || a.status === "INTERVIEWING").length}
                  </div>
                  <div className="text-xs text-slate-400">In Review</div>
                </div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">Ready</div>
                  <div className="text-xs text-slate-400">ATS Optimized CV</div>
                </div>
              </div>
            </>
          )}
        </div>

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
                    <Button variant="ghost" size="sm" className="text-xs text-indigo-400 hover:text-indigo-300">
                      Manage Jobs <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/job-portal">
                    <Button variant="ghost" size="sm" className="text-xs text-indigo-400 hover:text-indigo-300">
                      Explore More Jobs <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-400 text-sm animate-pulse">
                  Loading dashboard data...
                </div>
              ) : isEmployer ? (
                employerJobs.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <Building className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-slate-400 text-sm">No job postings created yet.</p>
                    <Link href="/company-details">
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white">
                        Create Your First Job Posting
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {employerJobs.map((job) => (
                      <div key={job.id} className="py-4 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-medium text-white text-sm hover:text-indigo-400 transition-colors">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span>{job.category}</span>
                            <span>•</span>
                            <span>{job.location}</span>
                            <span>•</span>
                            <span className="capitalize text-emerald-400">
                              {(job.status || "PUBLISHED").toLowerCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-indigo-400 border border-slate-700">
                            {job._count?.applications || job.applicants?.length || 0} applicants
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : applications.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Search className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-slate-400 text-sm">You haven&apos;t applied to any jobs yet.</p>
                  <Link href="/job-portal">
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white">
                      Browse Open Roles
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {applications.map((app, idx) => (
                    <div key={app.id || idx} className="py-4 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-medium text-white text-sm">
                          {app.candidateName || "Application Submission"}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>{app.candidateEmail || "Candidate"}</span>
                          <span>•</span>
                          <span>
                            Applied on{" "}
                            {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "Recently"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                            app.status === "SHORTLISTED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : app.status === "SCREENED"
                              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                              : app.status === "REJECTED"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {app.status || "SUBMITTED"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right / Shortcut Column (1 col) */}
          <div className="space-y-6">
            {/* AI Assistant Quick Launcher */}
            <div className="bg-linear-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-600/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">AI Career Suite</h3>
                  <p className="text-xs text-slate-400">Powered by OpenAI GPT-4o</p>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href="/job-assistant"
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors border border-slate-700/50 group"
                >
                  <span className="text-xs font-medium text-slate-200 group-hover:text-white">
                    Generate Cover Letter
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400" />
                </Link>
                <Link
                  href="/job-assistant"
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors border border-slate-700/50 group"
                >
                  <span className="text-xs font-medium text-slate-200 group-hover:text-white">
                    Cold Outreach Email Generator
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400" />
                </Link>
                <Link
                  href="/job-assistant"
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors border border-slate-700/50 group"
                >
                  <span className="text-xs font-medium text-slate-200 group-hover:text-white">
                    ATS Resume Optimizer & Builder
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400" />
                </Link>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-white text-sm">Quick Navigation</h3>
              <div className="space-y-2 text-xs">
                <Link
                  href="/job-portal"
                  className="flex items-center gap-2 text-slate-300 hover:text-white py-1.5 transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-indigo-400" /> Browse Available Jobs
                </Link>
                <Link
                  href="/services"
                  className="flex items-center gap-2 text-slate-300 hover:text-white py-1.5 transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-emerald-400" /> Professional Consultations
                </Link>
                <Link
                  href="/about"
                  className="flex items-center gap-2 text-slate-300 hover:text-white py-1.5 transition-colors"
                >
                  <Building className="w-4 h-4 text-amber-400" /> About iFormat Platform
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
