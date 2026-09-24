"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  ExternalLink,
  Globe,
  Loader2,
  Play,
  Search,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { jobsService } from "@/services/jobs.service";
import { JobDTO, PublicCompanyProfileDTO } from "@/types/api";
import { JobCard } from "@/features/jobs/components/job-card";
import { JobDetailsSheet } from "@/features/jobs/components/job-details-sheet";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PageProps {
  params: Promise<{ companyName: string }>;
}

export default function CompanyProfilePage({ params }: PageProps) {
  const resolvedParams = params && typeof (params as any).then === "function" ? React.use(params) : (params as any);
  const rawCompanyName = resolvedParams?.companyName as string;
  const companyName = rawCompanyName ? decodeURIComponent(rawCompanyName) : "";

  const [profileData, setProfileData] = React.useState<PublicCompanyProfileDTO | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Search & Filter state for company jobs
  const [roleSearch, setRoleSearch] = React.useState("");
  const [selectedType, setSelectedType] = React.useState("ALL");

  // Job Details Sheet state
  const [selectedJob, setSelectedJob] = React.useState<JobDTO | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [appliedJobIds, setAppliedJobIds] = React.useState<Set<string>>(new Set());

  // Video modal state
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);

  React.useEffect(() => {
    if (!companyName) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    jobsService
      .getCompanyProfile(companyName)
      .then((data) => {
        if (isMounted) {
          setProfileData(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          // If public profile endpoint isn't populated, search jobs by company name
          jobsService
            .getJobs({ search: companyName })
            .then((jobs) => {
              const matchedJobs = jobs.filter(
                (j) =>
                  j.company.toLowerCase().includes(companyName.toLowerCase()) ||
                  j.employer?.companyName?.toLowerCase().includes(companyName.toLowerCase())
              );
              if (matchedJobs.length > 0) {
                const first = matchedJobs[0];
                setProfileData({
                  company: {
                    name: first.employer?.companyName || first.company || companyName,
                    logoUrl: first.employer?.companyLogoUrl || null,
                    videoUrl: first.employer?.companyVideoUrl || null,
                    website: first.employer?.companyWebsite || null,
                    description: first.employer?.companyDescription || null,
                    isVerified: false,
                  },
                  jobs: matchedJobs,
                  totalJobs: matchedJobs.length,
                });
              } else {
                setError(err?.message || "Company profile not found.");
              }
            })
            .catch(() => {
              setError("Company not found or no published jobs available.");
            })
            .finally(() => {
              if (isMounted) setIsLoading(false);
            });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [companyName]);

  const company = profileData?.company;
  const jobs = profileData?.jobs || [];

  // Filter jobs by keyword & type
  const filteredJobs = React.useMemo(() => {
    return jobs.filter((job) => {
      const matchesKeyword =
        !roleSearch.trim() ||
        job.title.toLowerCase().includes(roleSearch.toLowerCase()) ||
        job.location.toLowerCase().includes(roleSearch.toLowerCase()) ||
        job.description.toLowerCase().includes(roleSearch.toLowerCase());

      const matchesType =
        selectedType === "ALL" ||
        job.jobType.toLowerCase().replace(/[\s-]/g, "") ===
          selectedType.toLowerCase().replace(/[\s-]/g, "");

      return matchesKeyword && matchesType;
    });
  }, [jobs, roleSearch, selectedType]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Company profile link copied to clipboard!");
    }
  };

  const logoLetter = company?.name?.trim().charAt(0).toUpperCase() || "I";
  const hasDescription = Boolean(company?.description && company.description.trim().length > 0);
  const hasVideo = Boolean(company?.videoUrl && company.videoUrl.trim().length > 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col pt-24 sm:pt-28">
        <div className="flex-1 max-w-360 w-11/12 mx-auto py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-[#0A54B1] animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading company profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-white flex flex-col pt-24 sm:pt-28">
        <div className="flex-1 max-w-360 w-11/12 mx-auto py-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Company Not Found</h2>
          <p className="text-sm text-slate-500 max-w-md">
            {error || "We could not find active details for this company."}
          </p>
          <Link
            href="/job-portal"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A54B1] text-white text-xs font-bold shadow-md hover:bg-[#08428c] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Job Board
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Unified Hero Cover Header */}
      <div className="relative bg-linear-to-r from-[#061e47] via-[#0A54B1] to-[#0284c7] text-white pt-24 sm:pt-28 pb-20 sm:pb-24 overflow-hidden">
        {/* Soft Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#52CEDE]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-360 w-11/12 mx-auto relative z-10">
          {/* Breadcrumb & Actions Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
              <Link
                href="/job-portal"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Job Portal</span>
              </Link>
              <span className="text-white/40">/</span>
              <span className="text-white/60">Companies</span>
              <span className="text-white/40">/</span>
              <span className="text-white font-bold">{company.name}</span>
            </div>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-xs font-semibold text-white hover:bg-white/20 transition-all cursor-pointer"
              title="Share Company Profile"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Elevated Company Identity Card */}
      <div className="max-w-360 w-11/12 mx-auto -mt-12 sm:-mt-16 relative z-20">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Logo & Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-2 border-slate-100 shadow-md flex items-center justify-center overflow-hidden shrink-0">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={`${company.name} logo`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-[#0A54B1] text-white font-black text-3xl flex items-center justify-center">
                  {logoLetter}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {company.name}
                </h1>
                {company.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Partner
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-medium text-slate-500">
                {company.website && (
                  <a
                    href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#0A54B1] hover:underline font-semibold"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {company.website.replace(/^https?:\/\//, "")}
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                )}

                <span className="flex items-center gap-1 text-slate-600">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  {jobs.length} Active {jobs.length === 1 ? "Opening" : "Openings"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          {jobs.length > 0 && (
            <div className="flex items-center gap-3 shrink-0">
              <a
                href="#open-roles"
                className="px-6 py-3 rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                <span>View {jobs.length} Open {jobs.length === 1 ? "Job" : "Jobs"}</span>
                <Briefcase className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Main Body */}
      <main className="max-w-360 w-11/12 mx-auto py-10 flex-1 space-y-10">
        {/* Dynamic Overview & Video Section - only rendered if data exists */}
        {(hasDescription || hasVideo) && (
          <div className={`grid grid-cols-1 ${hasDescription && hasVideo ? "lg:grid-cols-3" : "lg:grid-cols-1"} gap-8`}>
            {hasDescription && (
              <div className={`${hasVideo ? "lg:col-span-2" : "w-full"} bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4`}>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#0A54B1]" />
                  About {company.name}
                </h2>
                <div className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {company.description}
                </div>
              </div>
            )}

            {hasVideo && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-3">
                    <Play className="w-4 h-4 text-rose-500 fill-rose-500" />
                    Company Culture
                  </h2>
                  <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video shadow-sm group">
                    <video
                      src={company.videoUrl!}
                      controls={isVideoPlaying}
                      className="w-full h-full object-cover"
                      onPlay={() => setIsVideoPlaying(true)}
                    />
                    {!isVideoPlaying && (
                      <div
                        onClick={() => setIsVideoPlaying(true)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer group-hover:bg-black/30 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full bg-white text-[#0A54B1] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Open Job Openings Section */}
        <section id="open-roles" className="space-y-6 pt-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#0A54B1]" />
                Open Opportunities at {company.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Showing {filteredJobs.length} of {jobs.length} published {jobs.length === 1 ? "position" : "positions"}
              </p>
            </div>

            {/* Filter controls */}
            {jobs.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-55">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                    placeholder="Filter roles by keyword..."
                    className="pl-9 h-10 text-xs rounded-xl bg-white border-slate-200 focus:ring-[#0A54B1]"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {["ALL", "Full Time", "Remote"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedType === type
                          ? "bg-white text-[#0A54B1] shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Job Grid */}
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isApplied={appliedJobIds.has(job.id)}
                  onViewDetails={() => {
                    setSelectedJob(job);
                    setIsDetailsOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No active positions posted</h3>
              <p className="text-xs text-slate-500">
                {company.name} does not have any active listings matching your search at this moment.
              </p>
              {(roleSearch || selectedType !== "ALL") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRoleSearch("");
                    setSelectedType("ALL");
                  }}
                  className="rounded-xl text-xs font-bold text-[#0A54B1]"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />

      <JobDetailsSheet
        job={selectedJob}
        isOpen={isDetailsOpen}
        isApplied={selectedJob ? appliedJobIds.has(selectedJob.id) : false}
        onApplied={(jobId) => setAppliedJobIds((prev) => new Set(prev).add(jobId))}
        onClose={() => {
          setIsDetailsOpen(false);
          setTimeout(() => setSelectedJob(null), 300);
        }}
      />
    </div>
  );
}
