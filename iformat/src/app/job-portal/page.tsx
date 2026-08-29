"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
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
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [isAddJobOpen, setIsAddJobOpen] = React.useState(false);
  const [appliedJobIds, setAppliedJobIds] = React.useState<Set<string>>(new Set());
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);

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

  const handleAddJob = async (newJobData: any) => {
    if (!isAuthenticated) {
      toast.error("Please login as an employer or admin to post a job.");
      router.push("/login?redirect=/job-portal");
      throw new Error("Authentication required");
    }

    await createJobMutation.mutateAsync(newJobData);
  };

  const visibleJobs = React.useMemo(() => {
    return jobs.slice(0, visibleJobsCount);
  }, [jobs, visibleJobsCount]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleJobsCount((prev) => prev + 4);
      setIsLoadingMore(false);
    }, 400);
  };

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
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 space-y-10">
        <JobPortalHeader
          searchQuery={searchQuery}
          isEmployerOrAdmin={isEmployerOrAdmin}
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

        {/* Results Counter */}
        <div className="max-w-7xl mx-auto flex items-center justify-between pb-2 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Showing <span className="text-slate-800">{visibleJobs.length}</span> of{" "}
            <span className="text-slate-800">{jobs.length}</span> jobs
          </p>
        </div>

        {/* Jobs Grid */}
        <JobPortalGrid
          jobs={jobs}
          visibleJobs={visibleJobs}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          appliedJobIds={appliedJobIds}
          visibleJobsCount={visibleJobsCount}
          onSelectJob={(job) => {
            setSelectedJob(job);
            setIsDetailsOpen(true);
          }}
          onLoadMore={handleLoadMore}
          onResetFilters={() => {
            setSearchQuery("");
            setSelectedCategory("All Industries");
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
