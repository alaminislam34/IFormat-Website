"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Search,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminService, AdminUserItemDTO } from "@/services/admin.service";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<AdminUserItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const params: any = { role: "EMPLOYER" };
      if (search.trim()) params.search = search.trim();
      const res = await adminService.listUsers(params);
      if (res?.users) setCompanies(res.users);
    } catch (err: any) {
      console.warn("Could not load companies:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleToggleVerification = async (company: AdminUserItemDTO) => {
    try {
      const newState = !company.isVerifiedCompany;
      await adminService.toggleCompanyVerification(company.id, newState);
      setToastMessage(
        newState
          ? `Verified trust badge granted to ${company.companyName || company.name}.`
          : `Verification badge revoked for ${company.companyName || company.name}.`
      );
      loadCompanies();
    } catch (err: any) {
      alert(err.message || "Failed to update verification");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Company Verifications & Badges
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Audit employer organizations, website credentials, and grant official "Verified Company" trust badges.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadCompanies();
          }}
          className="relative w-full max-w-md"
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
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        </div>
      ) : companies.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 font-medium">
          No employer companies found.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((c) => (
            <div
              key={c.id}
              className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-sm">
                    {c.companyName?.[0] || c.name[0]}
                  </div>

                  {c.isVerifiedCompany ? (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-800 text-slate-400">
                      Unverified
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white">
                  {c.companyName || c.name}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">{c.email}</p>

                {c.companyWebsite && (
                  <a
                    href={c.companyWebsite.startsWith("http") ? c.companyWebsite : `https://${c.companyWebsite}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-semibold mt-2"
                  >
                    <span>{c.companyWebsite}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>{c._count.jobPostings} Active Job Listings</span>
                  <span>Joined {new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => handleToggleVerification(c)}
                  className={`w-full h-10 rounded-xl text-xs font-bold transition-all ${
                    c.isVerifiedCompany
                      ? "bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 hover:border-rose-800"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                  }`}
                >
                  {c.isVerifiedCompany ? "Revoke Verification Badge" : "Grant Verified Trust Badge"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
