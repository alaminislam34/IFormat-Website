"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, FileText, Mail, LogIn, UserPlus, ShieldAlert, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Footer } from "@/components/layout/footer";
import { ResumeBuilder } from "@/features/job-assistant/components/resume-builder";
import { CoverLetterGenerator } from "@/features/job-assistant/components/cover-letter-generator";
import { EmailGenerator } from "@/features/job-assistant/components/email-generator";
import { useAuthStore } from "@/stores/use-auth-store";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/ui/upgrade-modal";

type TabType = "cv" | "cover-letter" | "email";

export default function JobAssistantPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState<TabType>("cv");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = React.useState(false);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between pt-16">
      <div className="w-full flex-1 flex flex-col">
        {/* Navigation Tabs */}
        <div className="bg-white border-b mt-4 border-b-slate-200/80 py-3.5 px-6 w-full shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab("cv")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "cv"
                    ? "bg-[#0A54B1] text-white shadow-md shadow-blue-500/15"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI CV & Resume Builder
              </button>
              <button
                onClick={() => setActiveTab("cover-letter")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "cover-letter"
                    ? "bg-[#0A54B1] text-white shadow-md shadow-blue-500/15"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                AI Cover Letter Generator
              </button>
              <button
                onClick={() => setActiveTab("email")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "email"
                    ? "bg-[#0A54B1] text-white shadow-md shadow-blue-500/15"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                AI Cold Email Generator
              </button>
            </div>

            {/* Account Status Pill */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">
                  Signed in as <strong className="text-slate-800">{user?.name || user?.email}</strong>
                </span>
                <Link
                  href="/dashboard/billing"
                  className="px-3 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg text-[11px] font-extrabold transition-colors"
                >
                  Manage Pro
                </Link>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login?redirect=/job-assistant">
                  <Button variant="outline" size="sm" className="text-xs font-bold rounded-xl h-8">
                    <LogIn className="w-3.5 h-3.5 mr-1.5" /> Sign In
                  </Button>
                </Link>
                <Link href="/signup?redirect=/job-assistant">
                  <Button size="sm" className="bg-[#0A54B1] hover:bg-[#08428C] text-white text-xs font-bold rounded-xl h-8">
                    <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Register Free
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
          {!isAuthenticated ? (
            /* Logged Out Protection Banner */
            <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-xl shadow-slate-100 text-center max-w-2xl mx-auto space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#0A54B1] flex items-center justify-center mx-auto shadow-sm">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Sign In to Access AI Career Tools
                </h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  Log in or create a free account to generate AI-optimized CVs, custom cover letters, and recruiter outreach emails with your 5 free monthly generations.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link href="/login?redirect=/job-assistant" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto px-6 h-11 rounded-xl bg-[#0A54B1] hover:bg-[#08428C] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20">
                    <LogIn className="w-4 h-4" /> Sign In with Email
                  </Button>
                </Link>
                <Link href="/signup?redirect=/job-assistant" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto px-6 h-11 rounded-xl border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer">
                    <UserPlus className="w-4 h-4" /> Create Free Account
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </div>

      <Footer />

      {/* Upgrade Modal */}
      {isUpgradeModalOpen && (
        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
        />
      )}
    </main>
  );
}
