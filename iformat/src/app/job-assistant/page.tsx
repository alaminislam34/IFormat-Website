"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, FileText, Mail, Bot, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Footer } from "@/components/layout/footer";
import { ResumeBuilder } from "@/features/job-assistant/components/resume-builder";
import { CoverLetterGenerator } from "@/features/job-assistant/components/cover-letter-generator";
import { EmailGenerator } from "@/features/job-assistant/components/email-generator";
import { useAuthStore } from "@/stores/use-auth-store";
import { toast } from "sonner";

type TabType = "cv" | "cover-letter" | "email";

function JobAssistantContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const isEmployer = isAuthenticated && (user?.role === "employer" || user?.role === "EMPLOYER");

  const tabParam = searchParams.get("tab") as TabType | null;
  const [activeTab, setActiveTab] = React.useState<TabType>(
    tabParam === "cover-letter" || tabParam === "email" ? tabParam : "cv"
  );

  React.useEffect(() => {
    if (tabParam && (tabParam === "cv" || tabParam === "cover-letter" || tabParam === "email")) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  React.useEffect(() => {
    if (isAuthenticated && isEmployer) {
      toast.info("The AI Career Assistant is reserved for job seekers. Redirecting to your Employer Hub.");
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isEmployer, router]);

  if (isEmployer) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 pt-24">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-sky-50 text-[#0A54B1] rounded-2xl flex items-center justify-center mx-auto border border-sky-100">
            <Bot className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">Redirecting to Employer Hub</h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            The AI Career Assistant is designed for candidate job applications. As an employer, you are being automatically redirected to your hiring and ATS workspace.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A54B1] hover:bg-[#0A54B1]/90 text-white font-bold text-xs shadow-md shadow-blue-500/15 transition-all cursor-pointer"
            >
              <span>Go to Employer Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between print:p-0 print:m-0 print:bg-white print:min-h-0">
      <div className="w-full flex-1 flex flex-col print:p-0 print:m-0">
        {/* Unified AI Suite Header Bar */}
        <div className="bg-white border-b border-slate-200/80 pt-24 sm:pt-28 pb-6 px-4 sm:px-8 w-full shadow-xs print:hidden no-print">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-[#0A54B1] border border-sky-100">
                <Sparkles className="w-3.5 h-3.5 text-[#52CEDE]" />
                <span>iFormat AI Career Suite</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                AI Career Assistant
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg">
                Build ATS-tailored resumes, compelling cover letters, and outreach emails in seconds.
              </p>
            </div>

            {/* Segmented Tool Switcher */}
            <div className="bg-slate-100 p-1.5 rounded-2xl inline-flex flex-wrap sm:flex-nowrap items-center gap-1.5 border border-slate-200/60 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab("cv")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "cv"
                    ? "bg-[#0A54B1] text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Resume Builder</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("cover-letter")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "cover-letter"
                    ? "bg-[#0A54B1] text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Cover Letter Generator</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("email")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "email"
                    ? "bg-[#0A54B1] text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Outreach Email</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area - Always Interactive */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 print:p-0 print:m-0 print:max-w-none print:w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {activeTab === "cv" && <ResumeBuilder />}
              {activeTab === "cover-letter" && <CoverLetterGenerator />}
              {activeTab === "email" && <EmailGenerator />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function JobAssistantPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0A54B1]" />
        </div>
      }
    >
      <JobAssistantContent />
    </React.Suspense>
  );
}
