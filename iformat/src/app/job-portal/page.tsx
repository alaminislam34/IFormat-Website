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

// Initial Jobs list representing the screenshot
const INITIAL_JOBS: Job[] = [
  {
    id: "1",
    title: "Senior Full Stack Developer",
    company: "Vercel Inc",
    logoBg: "bg-black",
    logoLetter: "V",
    date: "Jun 10",
    jobType: "Full Time",
    location: "Remote",
    salary: "$120,000 - $150,000",
    category: "Technology & Engineering",
    description: "Vercel is the platform for frontend developers, providing speed and reliability. You'll architect and build full-stack features across our core product and internal tooling.",
    responsibilities: [
      "Design and implement scalable APIs and frontend components",
      "Collaborate with design and product teams on new features",
      "Lead code reviews and mentor junior engineers",
      "Own deployments and participating in on-call rotation",
    ],
    requirements: [
      "5+ years of full-stack engineering experience",
      "Deep expertise in React, Next.js and Node.js",
      "Experience with PostgreSQL and Redis databases",
      "Strong communication and collaborative skills",
    ],
    niceToHave: [
      "Experience with edge computing and serverless technologies",
      "Open-source contributions in the Next.js or React ecosystems",
      "Kubernetes and Docker containerization experience",
    ],
    perks: ["Fully remote", "120k-150k salary", "Equity package", "Unlimited PTO", "Home office budget", "Annual learning stipend"],
    applicants: [
      { name: "Nina Petrov", date: "Jun 12", avatar: "N", color: "bg-pink-500" },
      { name: "Omar Shaikh", date: "Jun 12", avatar: "O", color: "bg-orange-500" },
      { name: "Chen Wei", date: "Jun 11", avatar: "C", color: "bg-blue-500" },
    ],
  },
  {
    id: "2",
    title: "Backend Engineer (Node.js)",
    company: "Stripe",
    logoBg: "bg-indigo-600",
    logoLetter: "S",
    date: "Jun 11",
    jobType: "Full Time",
    location: "Hybrid",
    salary: "$130,000 - $160,000",
    category: "Technology & Engineering",
    description: "Stripe builds financial infrastructure for the internet. Join our core payment platform team to build secure, reliable, and high-performance financial APIs that process millions of transactions.",
    responsibilities: [
      "Design and scale Stripe's core payment processing systems",
      "Improve API response latency and distributed database reliability",
      "Maintain strict security standards and PCI compliance",
      "Build developer tools, software development kits (SDKs), and docs",
    ],
    requirements: [
      "4+ years of backend engineering experience",
      "Expertise in Node.js, TypeScript, and database optimization",
      "Strong understanding of distributed systems and message queues",
      "Experience with security protocols and payment APIs",
    ],
    niceToHave: [
      "Experience with Ruby, Go, or Java",
      "Familiarity with financial tech regulations",
      "Active contributor to open-source systems",
    ],
    perks: ["Hybrid work schedule", "Top tier health insurance", "Learning stipend", "401k matching", "Wellness allowance"],
    applicants: [
      { name: "Sarah Jenkins", date: "Jun 14", avatar: "S", color: "bg-purple-500" },
      { name: "Lucas Silva", date: "Jun 13", avatar: "L", color: "bg-teal-500" },
    ],
  },
  {
    id: "3",
    title: "DevOps / Cloud Architect",
    company: "Amazon AWS",
    logoBg: "bg-orange-500",
    logoLetter: "A",
    date: "Jun 12",
    jobType: "Full Time",
    location: "Onsite",
    salary: "$140,000 - $180,000",
    category: "Data & AI",
    description: "Architect and automate AWS cloud solutions. Work with enterprise clients and internal teams to design highly available, secure, and cost-effective cloud architectures.",
    responsibilities: [
      "Design infrastructure architecture for enterprise workloads",
      "Automate CI/CD pipelines and infrastructure provisioning using code",
      "Optimize cloud spending and database scaling",
      "Conduct security audits and disaster recovery planning",
    ],
    requirements: [
      "AWS Certified Solutions Architect Professional",
      "Experience with Terraform, Docker, and Kubernetes",
      "Proficiency in scripting (Python, Bash)",
      "6+ years of systems and cloud infrastructure experience",
    ],
    niceToHave: [
      "Experience with Multi-cloud environments (Azure/GCP)",
      "Background in security compliance (SOC2/HIPAA)",
      "Familiarity with serverless technologies",
    ],
    perks: ["Onsite dining and gym", "Relocation assistance", "Comprehensive benefits package", "Annual stock options", "Parental leave"],
    applicants: [
      { name: "Vikram Malhotra", date: "Jun 15", avatar: "V", color: "bg-amber-500" },
    ],
  },
  {
    id: "4",
    title: "Mobile Developer (React Native)",
    company: "Shopify",
    logoBg: "bg-green-600",
    logoLetter: "S",
    date: "Jun 13",
    jobType: "Contract",
    location: "Remote",
    salary: "$90,000 - $115,000",
    category: "Technology & Engineering",
    description: "Build next-generation mobile shopping experiences. Contribute directly to Shopify's mobile apps used by millions of merchants worldwide.",
    responsibilities: [
      "Develop and maintain high-performance mobile features in React Native",
      "Optimize mobile application startup time and UI smoothness",
      "Collaborate with mobile UX researchers and designers",
      "Ship clean, tested code following mobile best practices",
    ],
    requirements: [
      "3+ years of experience with React Native",
      "Strong understanding of JavaScript/TypeScript and React",
      "Experience publishing apps to App Store & Google Play",
      "Knowledge of native iOS/Android modules is a plus",
    ],
    niceToHave: [
      "Experience with Swift/Kotlin",
      "Familiarity with GraphQL",
      "Understanding of offline-first app architectures",
    ],
    perks: ["Remote allowance", "Home office budget", "Flexible working hours", "Shopify discount code", "Professional development funds"],
    applicants: [],
  },
  {
    id: "5",
    title: "Product Designer (UI/UX)",
    company: "Figma",
    logoBg: "bg-purple-600",
    logoLetter: "F",
    date: "Jun 10",
    jobType: "Full Time",
    location: "Remote",
    salary: "$100,000 - $130,000",
    category: "Design & Creative",
    description: "Help build the future of design tools. You'll lead design efforts for new collaborative features in Figma, shaping how teams design together.",
    responsibilities: [
      "Conduct user research and translate insights into design solutions",
      "Create wireframes, interactive prototypes, and high-fidelity designs",
      "Maintain and expand Figma's design system tokens",
      "Collaborate closely with product managers and developers",
    ],
    requirements: [
      "Portfolio demonstrating clean typography, layout, and visual systems",
      "4+ years of UI/UX design experience, preferably in SaaS",
      "Mastery of Figma (obviously)",
      "Experience conducting user interviews and usability tests",
    ],
    niceToHave: [
      "Basic understanding of HTML/CSS/JS",
      "Experience designing multiplayer/collaborative tools",
      "Motion design skills",
    ],
    perks: ["Fully remote", "Figma Pro subscription", "Equipment budget", "Health and wellness stipends", "Generous PTO"],
    applicants: [
      { name: "Emma Watson", date: "Jun 11", avatar: "E", color: "bg-red-500" },
      { name: "John Doe", date: "Jun 12", avatar: "J", color: "bg-purple-500" },
    ],
  },
  {
    id: "6",
    title: "Brand & Visual Designer",
    company: "Airbnb",
    logoBg: "bg-rose-500",
    logoLetter: "A",
    date: "Jun 11",
    jobType: "Full Time",
    location: "Onsite",
    salary: "$95,000 - $120,000",
    category: "Design & Creative",
    description: "Shape how Airbnb tells its story to the world. Design brand campaigns, digital assets, and print materials that communicate our mission of belonging.",
    responsibilities: [
      "Design key visual assets for global brand campaigns",
      "Ensure brand consistency across all marketing touchpoints",
      "Create illustrations, iconography, and typographic layouts",
      "Direct photography and video production style guides",
    ],
    requirements: [
      "Degree in Graphic Design or equivalent experience",
      "3+ years of brand design experience in-house or at agencies",
      "Expertise in Adobe Creative Suite and Figma",
      "Strong storytelling and presentation skills",
    ],
    niceToHave: [
      "Experience with 3D design tools",
      "Illustration and sketch abilities",
      "Motion graphics skills",
    ],
    perks: ["Onsite food and drinks", "Travel credits ($2000/year)", "Beautiful office environment", "Comprehensive health plans", "Paid volunteer time"],
    applicants: [],
  },
  {
    id: "7",
    title: "Motion Graphics Designer",
    company: "Netflix",
    logoBg: "bg-red-600",
    logoLetter: "N",
    date: "Jun 12",
    jobType: "Full Time",
    location: "Hybrid",
    salary: "Competitive",
    category: "Design & Creative",
    description: "Create eye-catching title sequences, promotional videos, and micro-animations for Netflix originals and social media channels.",
    responsibilities: [
      "Design and animate title sequences and branding visuals",
      "Create motion graphics for promotional campaigns and ads",
      "Optimize animations for web, social media, and TV platforms",
      "Collaborate with video editors and creative directors",
    ],
    requirements: [
      "Stunning showreel demonstrating motion design excellence",
      "Expertise in After Effects, Cinema 4D, and Premiere Pro",
      "Strong sense of timing, rhythm, and typography",
      "4+ years of motion graphics experience",
    ],
    niceToHave: [
      "Character animation skills",
      "Sound design capabilities",
      "Familiarity with SVG and web animations",
    ],
    perks: ["Competitive salary", "Free Netflix subscription", "Flexible hours", "Full medical/dental cover", "Creative freedom"],
    applicants: [
      { name: "Alex Mercer", date: "Jun 13", avatar: "A", color: "bg-slate-700" },
    ],
  },
  {
    id: "8",
    title: "3D / AR Designer",
    company: "Meta Reality Lab",
    logoBg: "bg-blue-600",
    logoLetter: "M",
    date: "Jun 14",
    jobType: "Full Time",
    location: "Onsite",
    salary: "$110,000 - $145,000",
    category: "Design & Creative",
    description: "Design assets and experiences for Meta's AR and VR platforms, pushing the boundaries of spatial computing and immersive technologies.",
    responsibilities: [
      "Create high-quality 3D assets, textures, and rigs for AR/VR",
      "Design interactive spatial layouts and user interfaces",
      "Optimize assets for real-time engines (Unity/Unreal)",
      "Collaborate with AR developers and researchers",
    ],
    requirements: [
      "Expertise in Maya, Blender, or C4D",
      "Experience with Unity or Unreal Engine",
      "Strong portfolio of 3D modeling and rendering",
      "3+ years of experience in 3D design or game dev",
    ],
    niceToHave: [
      "Experience with Spark AR or Lens Studio",
      "Understanding of spatial UI guidelines",
      "Basic scripting skills (C# or JavaScript)",
    ],
    perks: ["Meta Quest VR headset provided", "Onsite gym and meals", "Generous stock grants", "Flexible spending accounts", "Commuter benefits"],
    applicants: [],
  },
  {
    id: "9",
    title: "Growth Marketing Manager",
    company: "HubSpot",
    logoBg: "bg-orange-600",
    logoLetter: "H",
    date: "Jun 14",
    jobType: "Full Time",
    location: "Remote",
    salary: "$85,000 - $110,000",
    category: "Business & Marketing",
    description: "Drive customer acquisition and engagement. Manage HubSpot's digital advertising channels, paid search campaigns, and conversion rate optimization.",
    responsibilities: [
      "Plan and execute paid marketing campaigns",
      "Analyze funnel conversion and optimize landing pages",
      "Collaborate with content marketing and design teams",
      "Manage monthly marketing budgets and report ROI",
    ],
    requirements: [
      "3+ years of digital marketing experience",
      "Experience with Google Ads, Facebook Ads, and analytics tools",
      "Strong analytical skills and data-driven mindset",
      "Excellent written and verbal communication",
    ],
    niceToHave: [
      "Familiarity with SQL",
      "A/B testing tools experience",
      "Familiarity with CRM systems",
    ],
    perks: ["Fully remote", "Unlimited vacation", "Learning budget", "Health insurance", "Gym membership allowance"],
    applicants: [],
  },
  {
    id: "10",
    title: "Data Scientist (AI/ML)",
    company: "OpenAI",
    logoBg: "bg-emerald-600",
    logoLetter: "O",
    date: "Jun 15",
    jobType: "Full Time",
    location: "Hybrid",
    salary: "$160,000 - $220,000",
    category: "Data & AI",
    description: "Apply advanced statistical models and machine learning to optimize OpenAI's product interfaces and model deployment pipelines.",
    responsibilities: [
      "Develop and deploy machine learning models",
      "Analyze large datasets to guide product roadmap decisions",
      "Design and evaluate A/B experiments on AI features",
      "Publish internal data insights and dashboard visualizations",
    ],
    requirements: [
      "Master's or PhD in Computer Science, Statistics, or Math",
      "Proficiency in Python, SQL, and PyTorch/TensorFlow",
      "3+ years of data science or ML modeling experience",
      "Experience working with large language models",
    ],
    niceToHave: [
      "Publications in ML conferences",
      "Experience with distributed training",
      "Cloud compute architecture knowledge",
    ],
    perks: ["Top-tier health insurance", "Generous equity grants", "Unlimited PTO", "Onsite organic meals", "Continuing education assistance"],
    applicants: [],
  },
];

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

  // TanStack Query
  const { data: fetchedJobs, isLoading } = useJobs({
    category: selectedCategory,
    search: searchQuery,
  });

  const createJobMutation = useCreateJob();
  const jobs = fetchedJobs || INITIAL_JOBS;

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

          {/* Only Employers and Admins can Post Jobs */}
          {isEmployerOrAdmin && (
            <button
              onClick={() => setIsAddJobOpen(true)}
              className="w-full sm:w-auto h-12 px-6 rounded-xl bg-[#0A54B1] hover:bg-[#0A54B1]/90 text-white text-sm font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer shrink-0 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Post a Job</span>
            </button>
          )}
        </div>

        {/* Filter Badges Carousel */}
        <div className="max-w-4xl mx-auto">
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
          /* SKELETON LOADER ANIMATION */
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between h-75 shadow-sm animate-pulse"
              >
                <div className="flex justify-between items-center mb-5">
                  <div className="h-6 w-20 bg-slate-100 rounded-lg" />
                  <div className="h-6 w-16 bg-slate-100 rounded-lg" />
                </div>
                <div className="space-y-3 mb-6">
                  <div className="h-5 w-[85%] bg-slate-100 rounded-md" />
                  <div className="h-5 w-[60%] bg-slate-100 rounded-md" />
                  <div className="flex items-center gap-2 mt-4">
                    <div className="w-7 h-7 rounded-full bg-slate-100" />
                    <div className="h-4 w-24 bg-slate-100 rounded-md" />
                  </div>
                </div>
                <div className="space-y-2 pt-3 border-t border-slate-50">
                  <div className="h-5 w-20 bg-slate-100 rounded-md" />
                  <div className="h-5 w-28 bg-slate-100 rounded-md" />
                </div>
                <div className="h-10 w-full bg-slate-100 rounded-xl mt-5" />
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
