"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, FileText, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Footer } from "@/components/layout/footer";
import { ResumeBuilder } from "@/features/job-assistant/components/resume-builder";
import { CoverLetterGenerator } from "@/features/job-assistant/components/cover-letter-generator";
import { EmailGenerator } from "@/features/job-assistant/components/email-generator";

type TabType = "cv" | "cover-letter" | "email";

export default function JobAssistantPage() {
  const [activeTab, setActiveTab] = React.useState<TabType>("cv");

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between pt-16">
      <div className="w-full flex-1 flex flex-col">

        <div className="bg-white border-b border-slate-200/80 py-3.5 px-6 w-full shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-x-auto scrollbar-none">
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
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
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
