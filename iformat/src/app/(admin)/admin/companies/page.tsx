"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Loader2,
  X,
  Play,
  Briefcase,
  Phone,
  Mail,
  RefreshCw,
  Eye,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminService, AdminUserItemDTO } from "@/services/admin.service";
import { AdminPageHeader } from "@/features/admin/components/shared/admin-page-header";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<AdminUserItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "VERIFIED" | "UNVERIFIED">("ALL");
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Video Preview Modal State
  const [previewVideo, setPreviewVideo] = useState<{ url: string; companyName: string } | null>(null);

  const loadCompanies = async () => {
    try {
      const params: any = { role: "EMPLOYER" };
      if (search.trim()) params.search = search.trim();
      if (activeFilter === "VERIFIED") params.isVerifiedCompany = true;
      if (activeFilter === "UNVERIFIED") params.isVerifiedCompany = false;

      const res = await adminService.listUsers(params);
      if (res) setCompanies(Array.isArray(res) ? res : res.users || []);
    } catch (err: any) {
      console.warn("Could not load companies:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadCompanies();
  };

  const handleToggleVerification = async (company: AdminUserItemDTO) => {
    try {
      const newState = !company.isVerifiedCompany;
      await adminService.toggleCompanyVerification(company.id, newState);
      setToastMessage({
        text: newState
          ? `Verified trust badge granted to ${company.companyName || company.name}. In-app notification sent.`
          : `Verification badge revoked for ${company.companyName || company.name}.`,
        type: "success",
      });
      loadCompanies();
    } catch (err: any) {
      setToastMessage({
        text: err.message || "Failed to update verification status",
        type: "error",
      });
    }
  };

  // Metrics for telemetry cards
  const stats = useMemo(() => {
    const total = companies.length;
    const verified = companies.filter((c) => c.isVerifiedCompany).length;
    const pending = total - verified;
    const totalJobs = companies.reduce((acc, c) => acc + (c._count?.jobPostings || 0), 0);

    return { total, verified, pending, totalJobs };
  }, [companies]);

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
            toastMessage.type === "success"
              ? "bg-emerald-950/80 border-emerald-800 text-emerald-300"
              : "bg-rose-950/80 border-rose-800 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <AdminPageHeader
        title="Company Verifications & Brand Auditing"
        description="Audit employer credentials, preview company reels, and manage official 'Verified Company' trust badges."
      >
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 h-10 px-4 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-sky-400" : ""}`} />
          Refresh
        </Button>
      </AdminPageHeader>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>Total Employers</span>
            <Building2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.total}</div>
          <p className="text-[11px] text-slate-500 mt-1">Registered employer profiles</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>Verified Partners</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{stats.verified}</div>
          <p className="text-[11px] text-slate-500 mt-1">Active trust badges displayed</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>Pending Review</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{stats.pending}</div>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting trust credential review</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>Active Job Postings</span>
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.totalJobs}</div>
          <p className="text-[11px] text-slate-500 mt-1">Total listings across companies</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(
            [
              { id: "ALL", label: "All Companies" },
              { id: "VERIFIED", label: "Verified Partners" },
              { id: "UNVERIFIED", label: "Pending Review" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? "bg-sky-500 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadCompanies();
          }}
          className="relative w-full md:max-w-md"
        >
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search by company name, email, website..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-slate-950 border-slate-800 text-white text-xs rounded-xl focus-visible:ring-sky-500"
          />
        </form>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Loading Company Roster...
            </p>
          </div>
        </div>
      ) : companies.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">No employer organizations found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No company profiles match your current search or status filter.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((c) => {
            const companyDisplayName = c.companyName || c.name || "Company";
            const logoLetter = companyDisplayName.charAt(0).toUpperCase();

            return (
              <div
                key={c.id}
                className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between space-y-5 hover:border-slate-700 transition-all shadow-xs"
              >
                <div>
                  {/* Top Header: Logo + Verification Status */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                      {c.companyLogoUrl ? (
                        <img
                          src={c.companyLogoUrl}
                          alt={`${companyDisplayName} logo`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-[#0A54B1] to-indigo-700 text-white font-black text-lg flex items-center justify-center">
                          {logoLetter}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {c.isVerifiedCompany ? (
                        <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          Verified
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-xl text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                          Pending Review
                        </span>
                      )}

                      {c.subscription?.plan && (
                        <span className="text-[10px] font-bold text-sky-400 bg-sky-950/60 border border-sky-900/60 px-2 py-0.5 rounded-md">
                          {c.subscription.plan.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Contact Details */}
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
                      {companyDisplayName}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                      <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{c.email}</span>
                    </p>
                    {c.phone && (
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                        <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{c.phone}</span>
                      </p>
                    )}
                  </div>

                  {/* Website & Live Profile Links */}
                  <div className="flex flex-wrap items-center gap-2 pt-3">
                    {c.companyWebsite && (
                      <a
                        href={c.companyWebsite.startsWith("http") ? c.companyWebsite : `https://${c.companyWebsite}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-sky-400 hover:text-sky-300 font-semibold transition-colors"
                      >
                        <span className="truncate max-w-35">{c.companyWebsite.replace(/^https?:\/\//, "")}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {/* Link to public company page */}
                    <Link
                      href={`/companies/${encodeURIComponent(companyDisplayName)}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:text-white font-semibold transition-colors"
                    >
                      <Eye className="w-3 h-3 text-slate-400" />
                      <span>Public Profile</span>
                    </Link>

                    {/* Culture video trigger if present */}
                    {c.companyVideoUrl && (
                      <button
                        onClick={() =>
                          setPreviewVideo({
                            url: c.companyVideoUrl!,
                            companyName: companyDisplayName,
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-900/60 text-[11px] text-rose-300 hover:text-rose-200 font-semibold transition-colors cursor-pointer"
                        title="Watch employer culture reel"
                      >
                        <Play className="w-3 h-3 fill-current text-rose-400" />
                        <span>Culture Reel</span>
                      </button>
                    )}
                  </div>

                  {/* Description Snippet */}
                  {c.companyDescription && (
                    <p className="text-xs text-slate-400/90 line-clamp-2 mt-3 italic leading-relaxed">
                      &ldquo;{c.companyDescription}&rdquo;
                    </p>
                  )}

                  {/* Job Count & Joined Date */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1 text-slate-300 font-bold">
                      <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                      {c._count?.jobPostings || 0} Job Listings
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar className="w-3 h-3" />
                      Joined {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Verification Action Button */}
                <div className="pt-2">
                  <Button
                    onClick={() => handleToggleVerification(c)}
                    className={`w-full h-10 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      c.isVerifiedCompany
                        ? "bg-slate-800/80 hover:bg-rose-950/80 text-slate-300 hover:text-rose-200 border border-slate-700/80 hover:border-rose-800"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                    }`}
                  >
                    {c.isVerifiedCompany ? (
                      <span className="flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5" />
                        Revoke Verification Badge
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Grant Verified Trust Badge
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Reel Preview Dialog */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-rose-500 fill-current" />
                {previewVideo.companyName} — Culture Video
              </h3>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-slate-800">
              <video
                src={previewVideo.url}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
