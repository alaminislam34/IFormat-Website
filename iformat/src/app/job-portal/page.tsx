"use client";

import * as React from "react";
import { Loader2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useJobs, useCreateJob } from "@/hooks";
import { useJobFilterStore } from "@/stores/use-job-filter-store";
import { useAuthStore } from "@/stores/use-auth-store";

import { Footer } from "@/components/layout/footer";
import { JobFilters } from "@/features/jobs/components/job-filters";
import { Job } from "@/features/jobs/components/job-card";
import { JobDetailsSheet } from "@/features/jobs/components/job-details-sheet";
import { AddJobModal } from "@/features/jobs/components/add-job-modal";
import { JobPortalHeader } from "@/features/jobs/components/portal/job-portal-header";
import { JobPortalGrid } from "@/features/jobs/components/portal/job-portal-grid";

const INDUSTRIES = [
  { name: "All Industries", icon: "📚" },
  { name: "Technology & Engineering", icon: "⚙️" },
  { name: "Design & Creative", icon: "🎨" },
  { name: "Business & Marketing", icon: "📈" },
  { name: "Data & AI", icon: "🧠" },
];

function JobPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const userRole = user?.role?.toUpperCase();
  const isEmployer = userRole === "EMPLOYER";
  const isAdmin = userRole === "ADMIN";
  const isEmployerOrAdmin = isEmployer || isAdmin;

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

    // If a URL param is present, apply it; if absent, clear any stale store value
    // so navigating back to /job-portal never shows ghost filters from a previous session.
    if (search !== null) {
      setSearchQuery(search);
    } else {
      // No ?search= in URL — clear any leftover query from previous visits
      setSearchQuery("");
    }

    if (category !== null) {
      setSelectedCategory(category);
    } else if (!isEmployer) {
      // Only reset to default when not employer (employer has its own auto-switch below)
      setSelectedCategory("All Industries");
    }

    if (location !== null) {
      setSelectedLocation(location);
    } else {
      setSelectedLocation("All");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const [visibleJobsCount, setVisibleJobsCount] = React.useState(8);
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [isAddJobOpen, setIsAddJobOpen] = React.useState(false);
  const [appliedJobIds, setAppliedJobIds] = React.useState<Set<string>>(new Set());
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);

  const handleJobApplied = (jobId: string) => {
    setAppliedJobIds((prev) => new Set(prev).add(jobId));
  };

  // TanStack Query - Fetch full published catalog
  const { data: allFetchedJobs, isLoading } = useJobs({});
  const allJobs: Job[] = (allFetchedJobs || []) as Job[];

  const createJobMutation = useCreateJob();

  // Reset pagination whenever category or search query changes
  React.useEffect(() => {
    setVisibleJobsCount(8);
  }, [selectedCategory, searchQuery]);

  // Identify jobs belonging to the current user/company
  const myCompanyJobs = React.useMemo(() => {
    if (!user) return [];
    return allJobs.filter((j) => {
      const isOwnerById = Boolean(user.id && (j.employerId === user.id || j.employer?.id === user.id));
      const isOwnerByCompany = Boolean(
        user.companyName &&
        j.company &&
        user.companyName.trim().toLowerCase() === j.company.trim().toLowerCase()
      );
      return isOwnerById || isOwnerByCompany;
    });
  }, [allJobs, user]);

  // Base pool of jobs:
  // - For employers: Show ONLY their own company's posted jobs!
  // - For candidates & visitors: Show all published platform jobs.
  const baseJobs = React.useMemo(() => {
    if (isEmployer) {
      return myCompanyJobs;
    }
    return allJobs;
  }, [isEmployer, myCompanyJobs, allJobs]);

  const defaultCategoryLabel = isEmployer ? "All Postings" : "All Industries";

  // If employer is active and category is still "All Industries", auto-switch to "All Postings"
  React.useEffect(() => {
    if (isEmployer && (selectedCategory === "All Industries" || selectedCategory === "My Postings")) {
      setSelectedCategory("All Postings");
    }
  }, [isEmployer, selectedCategory, setSelectedCategory]);

  // Auto-open job details when returning from login redirect (?job=ID)
  React.useEffect(() => {
    const jobId = searchParams.get("job");
    if (jobId && baseJobs.length > 0 && !selectedJob) {
      const targetJob = baseJobs.find((j) => j.id === jobId);
      if (targetJob) {
        setSelectedJob(targetJob);
        setIsDetailsOpen(true);
      }
    }
  }, [searchParams, baseJobs, selectedJob]);

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

  const handleAddJob = async (newJobData: any) => {
    if (!isAuthenticated) {
      toast.error("Please login as an employer or admin to post a job.");
      router.push("/login?redirect=/job-portal");
      throw new Error("Authentication required");
    }

    await createJobMutation.mutateAsync(newJobData);
  };

  // Perform responsive, zero-latency client filtering over the base jobs
  const filteredJobs = React.useMemo(() => {
    let result = baseJobs;

    // 1. Filter by Category
    if (
      selectedCategory &&
      selectedCategory !== "All Industries" &&
      selectedCategory !== "All Postings" &&
      !selectedCategory.startsWith("All")
    ) {
      result = result.filter((j) =>
        j.category && j.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // 2. Filter by search query (Title, Company, Location, Description)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((j) =>
        j.title?.toLowerCase().includes(q) ||
        j.company?.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [baseJobs, selectedCategory, searchQuery]);

  const visibleJobs = React.useMemo(() => {
    return filteredJobs.slice(0, visibleJobsCount);
  }, [filteredJobs, visibleJobsCount]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleJobsCount((prev) => prev + 4);
      setIsLoadingMore(false);
    }, 300);
  };

  // Category counts stay permanently stable and reflect the active pool
  const industryCounts = React.useMemo(() => {
    const allLabel = isEmployer ? "All Postings" : "All Industries";
    const list = [
      { name: allLabel, icon: isEmployer ? "🏢" : "📚" },
      ...INDUSTRIES.slice(1),
    ];

    return list.map((ind) => {
      let count = 0;
      if (ind.name === allLabel) {
        count = baseJobs.length;
      } else {
        count = baseJobs.filter((j) =>
          j.category && j.category.toLowerCase().includes(ind.name.toLowerCase())
        ).length;
      }

      return {
        name: ind.name,
        icon: ind.icon,
        count,
      };
    });
  }, [baseJobs, isEmployer]);

  return (
    <main className="min-h-screen bg-white flex flex-col pt-24 sm:pt-28">
      <div className="flex-1 max-w-360 w-11/12 mx-auto py-10 space-y-10">
        <JobPortalHeader
          searchQuery={searchQuery}
          isEmployerOrAdmin={isEmployerOrAdmin}
          companyName={user?.companyName}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          onClearSearch={() => setSearchQuery("")}
          onPostJobClick={handlePostJobClick}
        />

        {/* Categories Bar */}
        <div className="border-y border-slate-100 py-6">
          <JobFilters
            categories={industryCounts}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Results Counter and Active Filter Tags */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Showing <span className="text-slate-800">{visibleJobs.length}</span> of{" "}
            <span className="text-slate-800">{filteredJobs.length}</span> jobs
            {filteredJobs.length !== baseJobs.length && (
              <span className="text-slate-400 font-medium normal-case ml-1.5">
                (filtered from {baseJobs.length} {isEmployer ? "company " : ""}total)
              </span>
            )}
          </p>

          {/* Active Filter Chips with 1-click removal */}
          {((isEmployer ? selectedCategory !== "All Postings" : selectedCategory !== "All Industries") ||
            searchQuery.trim()) && (
            <div className="flex items-center gap-2 flex-wrap">
              {((isEmployer && selectedCategory !== "All Postings") ||
                (!isEmployer && selectedCategory !== "All Industries")) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-sky-50 text-[#0A54B1] border border-sky-100">
                  <span>{selectedCategory}</span>
                  <button
                    onClick={() => setSelectedCategory(defaultCategoryLabel)}
                    className="hover:text-sky-950 cursor-pointer"
                    title="Remove filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <span>&ldquo;{searchQuery}&rdquo;</span>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:text-slate-950 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedCategory(defaultCategoryLabel);
                  setSearchQuery("");
                }}
                className="text-xs font-bold text-[#0A54B1] hover:underline cursor-pointer ml-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <JobPortalGrid
          jobs={filteredJobs}
          visibleJobs={visibleJobs}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          appliedJobIds={appliedJobIds}
          visibleJobsCount={visibleJobsCount}
          isEmployer={isEmployer}
          hasActiveFilters={Boolean(
            searchQuery.trim() ||
              (isEmployer
                ? selectedCategory !== "All Postings"
                : selectedCategory !== "All Industries")
          )}
          totalCompanyJobsCount={baseJobs.length}
          onPostJobClick={handlePostJobClick}
          onSelectJob={(job) => {
            setSelectedJob(job);
            setIsDetailsOpen(true);
          }}
          onLoadMore={handleLoadMore}
          onResetFilters={() => {
            setSearchQuery("");
            setSelectedCategory(defaultCategoryLabel);
          }}
        />
      </div>

      <Footer />

      <JobDetailsSheet
        job={selectedJob}
        isOpen={isDetailsOpen}
        isApplied={selectedJob ? appliedJobIds.has(selectedJob.id) : false}
        onApplied={handleJobApplied}
        onClose={() => {
          setIsDetailsOpen(false);
          setTimeout(() => setSelectedJob(null), 300);
        }}
      />

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
