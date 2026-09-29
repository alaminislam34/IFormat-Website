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
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
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
          className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl text-xs font-semibold flex items-center gap-2 h-10 px-4 cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-sky-500" : "text-slate-400"}`} />
          <span>Refresh</span>
        </Button>
      </AdminPageHeader>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Total Employers</span>
            <Building2 className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <p className="text-xs text-slate-500 mt-1">Registered employer profiles</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Verified Partners</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats.verified}</div>
          <p className="text-xs text-slate-500 mt-1">Active trust badges displayed</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Pending Review</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          <p className="text-xs text-slate-500 mt-1">Awaiting trust credential review</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Active Job Postings</span>
            <Briefcase className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalJobs}</div>
          <p className="text-xs text-slate-500 mt-1">Total listings across companies</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60 overflow-x-auto">
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
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === tab.id
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
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
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search by company name, email, website..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs rounded-xl focus-visible:ring-sky-500"
          />
        </form>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">
              Loading company roster...
            </p>
          </div>
        </div>
      ) : companies.length === 0 ? (
        <div className="py-20 text-center bg-white border border-slate-200 rounded-3xl p-8 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">No employer organizations found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
                className="bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between space-y-5 hover:border-slate-300 hover:shadow-md transition-all shadow-xs"
              >
                <div>
                  {/* Top Header: Logo + Verification Status */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
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
                        <div className="w-full h-full bg-linear-to-br from-[#0A54B1] to-indigo-700 text-white font-bold text-lg flex items-center justify-center">
                          {logoLetter}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {c.isVerifiedCompany ? (
                        <span className="px-3 py-1 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-xl text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pending Review</span>
                        </span>
                      )}

                      {c.subscription?.plan && (
                        <span className="text-[11px] font-medium text-sky-700 bg-sky-50 border border-sky-200/60 px-2 py-0.5 rounded-md">
                          {c.subscription.plan.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Contact Details */}
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 tracking-tight line-clamp-1">
                      {companyDisplayName}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{c.email}</span>
                    </p>
                    {c.phone && (
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
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
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-sky-600 hover:text-sky-700 font-medium transition-colors"
                      >
                        <span className="truncate max-w-35">{c.companyWebsite.replace(/^https?:\/\//, "")}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {/* Link to public company page */}
                    <Link
                      href={`/companies/${encodeURIComponent(companyDisplayName)}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 hover:text-slate-900 font-medium transition-colors"
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
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 hover:text-rose-800 font-medium transition-colors cursor-pointer"
                        title="Watch employer culture reel"
                      >
                        <Play className="w-3 h-3 fill-current text-rose-600" />
                        <span>Culture Reel</span>
                      </button>
                    )}
                  </div>

                  {/* Description Snippet */}
                  {c.companyDescription && (
                    <p className="text-xs text-slate-500 line-clamp-2 mt-3 italic leading-relaxed">
                      &ldquo;{c.companyDescription}&rdquo;
                    </p>
                  )}

                  {/* Job Count & Joined Date */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1 text-slate-700 font-semibold">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      {c._count?.jobPostings || 0} Job Listings
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3 h-3" />
                      Joined {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Verification Action Button */}
                <div className="pt-2">
                  <Button
                    onClick={() => handleToggleVerification(c)}
                    className={`w-full h-10 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      c.isVerifiedCompany
                        ? "bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 shadow-xs"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Play className="w-4 h-4 text-rose-600 fill-current" />
                <span>{previewVideo.companyName} — Culture Video</span>
              </h3>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-slate-200">
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
