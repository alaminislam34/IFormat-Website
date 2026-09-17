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
  Sparkles,
  Users,
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
          // Fallback: try fetching jobs with search=companyName
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
              setIsLoading(false);
            });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [companyName]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Company profile link copied to clipboard!");
    }
  };

  const company = profileData?.company;
  const jobs = profileData?.jobs || [];

  // Filter jobs by search and job type
  const filteredJobs = React.useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        !roleSearch.trim() ||
        job.title.toLowerCase().includes(roleSearch.toLowerCase()) ||
        job.description?.toLowerCase().includes(roleSearch.toLowerCase()) ||
        job.location?.toLowerCase().includes(roleSearch.toLowerCase());

      const matchesType =
        selectedType === "ALL" ||
        job.jobType?.toUpperCase() === selectedType.toUpperCase() ||
        job.location?.toUpperCase() === selectedType.toUpperCase();

      return matchesSearch && matchesType;
    });
  }, [jobs, roleSearch, selectedType]);

  const logoLetter = company?.name?.charAt(0)?.toUpperCase() || "C";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-9 h-9 animate-spin text-[#0A54B1]" />
          <p className="text-sm font-semibold text-slate-500">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between pt-24">
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200 shadow-xs">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Company Not Found</h1>
          <p className="text-sm text-slate-600 mb-6">
            We couldn&apos;t find an active company profile for &ldquo;{companyName}&rdquo;. The company may not have posted any active jobs yet.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/job-portal"
              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold h-10 px-5 py-2 bg-[#0A54B1] hover:bg-[#08428C] text-white rounded-xl shadow-md shadow-blue-500/15 active:scale-[0.98] transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse All Jobs
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-100 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link
              href="/job-portal"
              className="flex items-center gap-1 hover:text-[#0A54B1] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Job Portal
            </Link>
            <span>/</span>
            <span className="text-slate-400">Companies</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">{company.name}</span>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-[#0A54B1] hover:border-sky-200 hover:bg-sky-50 transition-all cursor-pointer"
            title="Share Company Profile"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share Profile
          </button>
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="relative bg-white border-b border-slate-100 overflow-hidden">
        {/* Subtle Decorative Gradient */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-linear-to-r from-[#0A54B1]/10 via-indigo-100/40 to-sky-100/30" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            {/* Logo & Main Identity */}
            <div className="flex items-start md:items-end gap-5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden shrink-0">
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
                  <div className="w-full h-full bg-[#0A54B1] text-white font-black text-3xl sm:text-4xl flex items-center justify-center">
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

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <a
                href="#open-roles"
                className="px-5 py-2.5 rounded-2xl bg-[#0A54B1] hover:bg-[#08448f] text-white text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
              >
                <span>View {jobs.length} Jobs</span>
                <Briefcase className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body: Content & Jobs */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        {/* Company Overview & Culture Video Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* About Bio */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#0A54B1]" />
              About {company.name}
            </h2>
            <div className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {company.description ||
                `${company.name} is a premier hiring partner on iFormat. We are actively expanding our teams and looking for top-tier talent to drive impactful projects forward.`}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
              <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0A54B1] mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Screening
                </div>
                <p className="text-xs text-slate-600 font-medium">Instant resume match score with Bedrock AI</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Employer
                </div>
                <p className="text-xs text-slate-600 font-medium">Direct communication with hiring managers</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 mb-1">
                  <Users className="w-3.5 h-3.5" />
                  Fast Scheduling
                </div>
                <p className="text-xs text-slate-600 font-medium">Direct video & on-site interview invitations</p>
              </div>
            </div>
          </div>

          {/* Company Video Reel / Highlights Card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-3">
                <Play className="w-4 h-4 text-rose-500 fill-rose-500" />
                Company Culture & Video
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Get an insider glimpse of life at {company.name}, team dynamics, and our day-to-day workflow.
              </p>

              {company.videoUrl ? (
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video shadow-sm group">
                  <video
                    src={company.videoUrl}
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
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Play className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-slate-600">Culture Video Coming Soon</p>
                  <p className="text-[11px] text-slate-400">
                    {company.name} is preparing a culture showcase video.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Hiring Partner:</span> iFormat Verified Platform
            </div>
          </div>
        </div>

        {/* Open Job Openings Section */}
        <section id="open-roles" className="space-y-6 pt-4">
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
            <div className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <div className="relative min-w-55">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                  placeholder="Filter roles by keyword..."
                  className="pl-9 h-10 text-xs rounded-xl bg-white border-slate-200 focus:ring-[#0A54B1]"
                />
              </div>

              {/* Type pills */}
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
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No matching positions found</h3>
              <p className="text-xs text-slate-500">
                Try adjusting your search keyword or filters to view available roles at {company.name}.
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

      {/* Footer */}
      <Footer />

      {/* Job Details Sheet Modal */}
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
