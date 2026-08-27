"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Briefcase, Plus, Menu, X, Loader2, ChevronDown, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Footer } from "@/components/layout/footer";
import { JobFilters } from "@/features/jobs/components/job-filters";
import { JobCard, Job } from "@/features/jobs/components/job-card";
import { JobDetailsSheet } from "@/features/jobs/components/job-details-sheet";
import { AddJobModal } from "@/features/jobs/components/add-job-modal";

const INDUSTRIES = [
  { name: "All Industries", icon: "📚" },
  { name: "Technology & Engineering", icon: "⚙️" },
  { name: "Design & Creative", icon: "🎨" },
  { name: "Business & Marketing", icon: "📈" },
  { name: "Data & AI", icon: "🧠" },
];

import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useJobs, useCreateJob } from "@/hooks";
import { useJobFilterStore } from "@/stores/use-job-filter-store";
import { useAuthStore } from "@/stores/use-auth-store";

function JobPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const userRole = user?.role?.toUpperCase();
  const isEmployerOrAdmin = userRole === "EMPLOYER" || userRole === "ADMIN";

  const {
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    setSelectedLocation,
  } = useJobFilterStore();

  React.useEffect(() => {
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const location = searchParams.get("location");

    if (search !== null) setSearchQuery(search);
    if (category !== null) setSelectedCategory(category);
    if (location !== null) setSelectedLocation(location);
  }, [searchParams, setSearchQuery, setSelectedCategory, setSelectedLocation]);

  const [visibleJobsCount, setVisibleJobsCount] = React.useState(8);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Modal / Drawer states
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [isAddJobOpen, setIsAddJobOpen] = React.useState(false);
  // Track applied jobs locally for instant UI feedback
  const [appliedJobIds, setAppliedJobIds] = React.useState<Set<string>>(new Set());

  const handleJobApplied = (jobId: string) => {
    setAppliedJobIds((prev) => new Set(prev).add(jobId));
  };

  // TanStack Query - Fetch real published jobs from backend
  const { data: fetchedJobs, isLoading } = useJobs({
    category: selectedCategory,
    search: searchQuery,
  });

  const createJobMutation = useCreateJob();
  const jobs: Job[] = (fetchedJobs || []) as Job[];

  // Auto-open job details when returning from login redirect (?job=ID)
  React.useEffect(() => {
    const jobId = searchParams.get("job");
    if (jobId && jobs.length > 0 && !selectedJob) {
      const targetJob = jobs.find((j) => j.id === jobId);
      if (targetJob) {
        setSelectedJob(targetJob);
        setIsDetailsOpen(true);
      }
    }
  }, [searchParams, jobs, selectedJob]);

  const handlePostJobClick = () => {
    if (!isAuthenticated) {
      toast.info("Please log in with an employer account to post a job.");
      router.push("/login?redirect=/job-portal");
      return;
    }

    if (userRole === "CANDIDATE") {
      toast.error("Job posting is available for employer accounts. Please switch to or sign in with an employer account.");
      return;
    }

    setIsAddJobOpen(true);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Add Job handler via React Query Mutation
  const handleAddJob = async (newJobData: any) => {
    if (!isAuthenticated) {
      toast.error("Please login as an employer or admin to post a job.");
      router.push("/login?redirect=/job-portal");
      throw new Error("Authentication required");
    }

    await createJobMutation.mutateAsync(newJobData);
  };

  // Paginated/visible jobs
  const visibleJobs = React.useMemo(() => {
    return jobs.slice(0, visibleJobsCount);
  }, [jobs, visibleJobsCount]);

  // Load more handler
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleJobsCount((prev) => prev + 4);
      setIsLoadingMore(false);
    }, 400);
  };

  // Prepare industry counts
  const industryCounts = React.useMemo(() => {
    return INDUSTRIES.map((ind) => {
      const count =
        ind.name === "All Industries"
          ? jobs.length
          : jobs.filter((j) => j.category === ind.name).length;
      return {
        name: ind.name,
        icon: ind.icon,
        count,
      };
    });
  }, [jobs]);

  return (
    <main className="min-h-screen bg-white flex flex-col pt-16">
      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 space-y-10">
        
        {/* Title Section */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-sky-50/70 text-[#0ea5e9] rounded-2xl flex items-center justify-center mx-auto border border-sky-100">
            <Briefcase className="w-6 h-6" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Find Your Dream Job
          </h1>
          <p className="text-slate-500 font-semibold text-sm max-w-md mx-auto">
            Explore opportunities across industries, tailored to your skills
          </p>
        </div>

        {/* Search and Add Job Row */}
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input Container */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search job title or company..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 shadow-xs transition-all placeholder:text-slate-400 font-medium"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Add Job Button (Visible to Employers/Admins) */}
          {isEmployerOrAdmin && (
            <button
              onClick={handlePostJobClick}
              className="h-12 px-6 rounded-xl bg-[#0A54B1] hover:bg-[#0A54B1]/90 text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>Post a Job</span>
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div className="border-y border-slate-100 py-6">
          <JobFilters
            categories={industryCounts}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryChange}
          />
        </div>

        {/* Results Counter */}
        <div className="max-w-7xl mx-auto flex items-center justify-between pb-2 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Showing <span className="text-slate-800">{visibleJobs.length}</span> of{" "}
            <span className="text-slate-800">{jobs.length}</span> jobs
          </p>
        </div>

        {/* Jobs Grid Section */}
        {isLoading ? (
          /* SKELETON LOADING GRID */
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between h-64 shadow-xs"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="h-5 w-16 bg-slate-100 rounded-full" />
                  <div className="h-5 w-20 bg-slate-100 rounded-full" />
                </div>
                <div className="space-y-3 mb-6">
                  <div className="h-6 w-3/4 bg-slate-100 rounded-md" />
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100" />
                    <div className="h-4 w-1/3 bg-slate-100 rounded-md" />
                  </div>
                </div>
                <div className="space-y-2 pt-3 border-t border-slate-50">
                  <div className="h-5 w-20 bg-slate-100 rounded-md" />
                  <div className="h-5 w-28 bg-slate-100 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          /* EMPTY STATE */
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-xl mx-auto space-y-4 p-8">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No jobs found</h3>
            <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
              We couldn&apos;t find any job match for your search criteria. Try modifying your filters or search query.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Industries");
              }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* JOBS GRID */
          <div className="space-y-10">
            <motion.div
              layout
              className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {visibleJobs.map((job) => (
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
              </AnimatePresence>
            </motion.div>

            {/* Load More Button */}
            {jobs.length > visibleJobsCount && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-6 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer focus:outline-none"
                >
                  {isLoadingMore ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                  ) : (
                    <>
                      <span>Load More</span>
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />

      {/* Side Details Drawer Sheet */}
      <JobDetailsSheet
        job={selectedJob}
        isOpen={isDetailsOpen}
        isApplied={selectedJob ? appliedJobIds.has(selectedJob.id) : false}
        onApplied={handleJobApplied}
        onClose={() => {
          setIsDetailsOpen(false);
          // Wait for animation to finish before clearing job to prevent jumpiness
          setTimeout(() => setSelectedJob(null), 300);
        }}
      />

      {/* Add Job Dialog Modal */}
      <AddJobModal
        isOpen={isAddJobOpen}
        onClose={() => setIsAddJobOpen(false)}
        onSubmit={handleAddJob}
      />
    </main>
  );
}

export default function JobPortalPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center pt-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#0A54B1]" />
        </div>
      }
    >
      <JobPortalContent />
    </React.Suspense>
  );
}
