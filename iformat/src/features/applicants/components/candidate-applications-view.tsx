"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Sparkles,
  ChevronRight,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  AlertCircle,
  Loader2,
  Award,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ArrowRight,
  Send,
  SlidersHorizontal,
} from "lucide-react";
import { jobsService } from "@/services/jobs.service";
import { JobApplicantDTO } from "@/types/api/jobs";
import { toast } from "sonner";
import { ApplicantScreeningModal } from "./applicant-screening-modal";

type StatusTab = "ALL" | "ACTIVE" | "SHORTLISTED" | "OFFERS" | "ARCHIVED";

export function CandidateApplicationsView() {
  const [applications, setApplications] = useState<JobApplicantDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [selectedScreeningApp, setSelectedScreeningApp] = useState<JobApplicantDTO | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await jobsService.getCandidateApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load submitted applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const toggleNote = (id: string) => {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter applications by tab and search
  const filteredApplications = applications.filter((app) => {
    const status = app.status || "SUBMITTED";
    const matchesTab = (() => {
      switch (activeTab) {
        case "ACTIVE":
          return ["SUBMITTED", "SCREENED"].includes(status);
        case "SHORTLISTED":
          return ["SHORTLISTED", "INTERVIEWING"].includes(status);
        case "OFFERS":
          return status === "OFFERED";
        case "ARCHIVED":
          return ["REJECTED", "WITHDRAWN"].includes(status);
        default:
          return true;
      }
    })();

    if (!matchesTab) return false;

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const title = app.job?.title?.toLowerCase() || "";
    const company = app.job?.company?.toLowerCase() || "";
    const location = app.job?.location?.toLowerCase() || "";
    return title.includes(query) || company.includes(query) || location.includes(query);
  });

  // Calculate stats
  const totalCount = applications.length;
  const activeCount = applications.filter((a) =>
    ["SUBMITTED", "SCREENED"].includes(a.status || "SUBMITTED")
  ).length;
  const shortlistedCount = applications.filter((a) =>
    ["SHORTLISTED", "INTERVIEWING"].includes(a.status || "")
  ).length;
  const offerCount = applications.filter((a) => a.status === "OFFERED").length;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "SHORTLISTED":
        return {
          label: "Shortlisted",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          icon: CheckCircle2,
          dot: "bg-emerald-500",
        };
      case "INTERVIEWING":
        return {
          label: "Interviewing",
          bg: "bg-amber-50 text-amber-700 border-amber-200/80",
          icon: Calendar,
          dot: "bg-amber-500",
        };
      case "OFFERED":
        return {
          label: "Offer Extended",
          bg: "bg-teal-50 text-teal-800 border-teal-300",
          icon: Award,
          dot: "bg-teal-500",
        };
      case "SCREENED":
        return {
          label: "AI Screened",
          bg: "bg-purple-50 text-purple-700 border-purple-200/80",
          icon: Sparkles,
          dot: "bg-purple-500",
        };
      case "REJECTED":
        return {
          label: "Not Selected",
          bg: "bg-slate-100 text-slate-600 border-slate-200",
          icon: XCircle,
          dot: "bg-slate-400",
        };
      case "WITHDRAWN":
        return {
          label: "Withdrawn",
          bg: "bg-slate-100 text-slate-500 border-slate-200",
          icon: AlertCircle,
          dot: "bg-slate-300",
        };
      case "SUBMITTED":
      default:
        return {
          label: "Application Submitted",
          bg: "bg-sky-50 text-sky-700 border-sky-200/80",
          icon: Clock,
          dot: "bg-sky-500",
        };
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* ================= HEADER & STATS ================= */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Job Applications
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Track submitted positions, employer reviews, and real-time AI match assessments.
            </p>
          </div>

          <Link
            href="/job-portal"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] text-white text-xs font-bold shadow-md shadow-sky-500/20 hover:opacity-95 transition-all self-start sm:self-auto"
          >
            <Search className="w-4 h-4" />
            <span>Explore Jobs</span>
          </Link>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0A54B1] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400">Total Applications</p>
              <h3 className="text-xl font-black text-slate-900">{totalCount}</h3>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400">Under Review</p>
              <h3 className="text-xl font-black text-slate-900">{activeCount}</h3>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400">Shortlisted</p>
              <h3 className="text-xl font-black text-slate-900">{shortlistedCount}</h3>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400">Offers Received</p>
              <h3 className="text-xl font-black text-slate-900">{offerCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FILTER TOOLBAR ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-b border-slate-200/80 pb-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "ALL"
                ? "bg-[#0A54B1] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "ACTIVE"
                ? "bg-[#0A54B1] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Under Review ({activeCount})
          </button>
          <button
            onClick={() => setActiveTab("SHORTLISTED")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "SHORTLISTED"
                ? "bg-[#0A54B1] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Shortlisted ({shortlistedCount})
          </button>
          <button
            onClick={() => setActiveTab("OFFERS")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "OFFERS"
                ? "bg-[#0A54B1] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Offers ({offerCount})
          </button>
          <button
            onClick={() => setActiveTab("ARCHIVED")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "ARCHIVED"
                ? "bg-[#0A54B1] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Archived
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search role or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-hidden focus:border-[#0A54B1] focus:ring-1 focus:ring-[#0A54B1] transition-all"
          />
        </div>
      </div>

      {/* ================= APPLICATIONS LIST ================= */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#0A54B1] animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading your applications...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200/80 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0A54B1] flex items-center justify-center mx-auto shadow-inner">
            <Send className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              {searchQuery ? "No matching applications found" : "No applications submitted yet"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {searchQuery
                ? "Try searching with different keywords or clearing your filter."
                : "You haven't submitted any job applications yet. Browse the job portal to discover curated openings tailored to your skills."}
            </p>
          </div>
          <Link
            href="/job-portal"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] text-white text-xs font-bold shadow-md shadow-sky-500/20 hover:opacity-95 transition-all"
          >
            <span>Explore Curated Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const appId = app.id || "";
            const jobTitle = app.job?.title || "Position";
            const companyName = app.job?.company || "Company";
            const companyLogo = app.job?.employer?.companyLogoUrl;
            const location = app.job?.location || "Remote";
            const jobType = app.job?.jobType || "Full Time";
            const statusConfig = getStatusBadge(app.status);
            const StatusIcon = statusConfig.icon;
            const isNoteExpanded = expandedNotes[appId];
            const screening = app.screeningResult;
            const hasScreeningScore = typeof screening?.score === "number";

            const appliedDate = app.createdAt
              ? new Date(app.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recently";

            return (
              <div
                key={appId}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-sky-200 shadow-xs hover:shadow-md transition-all space-y-4 group"
              >
                {/* Top Section */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Company & Role */}
                  <div className="flex items-start gap-3.5">
                    {companyLogo ? (
                      <img
                        src={companyLogo}
                        alt={companyName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-sky-500 to-[#0A54B1] text-white flex items-center justify-center font-black text-base shrink-0 shadow-sm">
                        {companyName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0A54B1] transition-colors">
                          {jobTitle}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                          <StatusIcon className="w-3 h-3" />
                          <span>{statusConfig.label}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <Link
                          href={`/companies/${encodeURIComponent(companyName)}`}
                          className="font-semibold text-slate-700 hover:text-[#0A54B1] hover:underline"
                        >
                          {companyName}
                        </Link>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {location}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          {jobType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submission date & AI Score Pill */}
                  <div className="flex sm:flex-col sm:items-end justify-between items-center gap-2 shrink-0">
                    <span className="text-[11px] font-medium text-slate-400">
                      Applied {appliedDate}
                    </span>

                    {hasScreeningScore ? (
                      <button
                        onClick={() => setSelectedScreeningApp(app)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-linear-to-r from-sky-50 to-blue-50 border border-sky-100 text-[#0A54B1] text-xs font-bold hover:bg-sky-100/60 transition-all cursor-pointer shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                        <span>{screening?.score}% Match</span>
                        <ChevronRight className="w-3 h-3 opacity-60" />
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>AI Review Pending</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Employer Feedback Note (if present) */}
                {app.employerFeedback && (
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-2.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Employer Note: </span>
                      <span>{app.employerFeedback}</span>
                    </div>
                  </div>
                )}

                {/* Bottom Bar: Cover Note Toggle & Quick Actions */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  {/* Cover note toggle */}
                  {app.coverNote ? (
                    <div>
                      <button
                        onClick={() => toggleNote(appId)}
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold cursor-pointer transition-colors"
                      >
                        <span>{isNoteExpanded ? "Hide Cover Note" : "View Attached Cover Note"}</span>
                        {isNoteExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {isNoteExpanded && (
                        <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed max-w-2xl whitespace-pre-wrap">
                          {app.coverNote}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div />
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 self-end sm:self-auto">
                    <Link
                      href={`/job-assistant?tab=cover-letter&role=${encodeURIComponent(
                        jobTitle
                      )}&company=${encodeURIComponent(companyName)}`}
                      className="px-3 py-1.5 rounded-xl text-slate-600 hover:text-[#0A54B1] hover:bg-slate-50 font-bold transition-all"
                    >
                      Prepare Cover Letter
                    </Link>
                    <Link
                      href={`/companies/${encodeURIComponent(companyName)}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold transition-all"
                    >
                      <span>Company Profile</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= SCREENING REPORT MODAL ================= */}
      {selectedScreeningApp && selectedScreeningApp.screeningResult && (
        <ApplicantScreeningModal
          onClose={() => setSelectedScreeningApp(null)}
          applicant={selectedScreeningApp}
        />
      )}
    </div>
  );
}
