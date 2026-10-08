"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Film, Users, ExternalLink } from "lucide-react";
import { AdminPageHeader } from "@/features/admin/components/shared/admin-page-header";
import { useLandingContentStore } from "@/stores/use-landing-content-store";
import { PromotionalVideoSection } from "@/features/admin/components/homepage/promotional-video-section";
import { LeadershipTeamSection } from "@/features/admin/components/homepage/leadership-team-section";

export default function AdminHomepageContentPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const { leadersSettings, syncWithBackend } = useLandingContentStore();
  const [activeTab, setActiveTab] = useState<"video" | "leaders">(
    tabParam === "leaders" ? "leaders" : "video"
  );

  useEffect(() => {
    if (tabParam === "leaders" || tabParam === "video") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  return (
    <div className="space-y-8 w-full pb-20">
      <AdminPageHeader
        title="Homepage Content & Media"
        description="Edit the landing page promotional vision video, headlines, and leadership team profiles in real time."
      >
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-sky-600 hover:bg-sky-50 shadow-2xs transition-colors cursor-pointer"
          >
            <span>View Public Landing Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </AdminPageHeader>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("video")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "video"
              ? "bg-[#0A54B1] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Promotional Vision Video</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("leaders")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "leaders"
              ? "bg-[#0A54B1] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Executive Leadership Team ({leadersSettings.members.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "video" && <PromotionalVideoSection />}
      {activeTab === "leaders" && <LeadershipTeamSection />}
    </div>
  );
}
