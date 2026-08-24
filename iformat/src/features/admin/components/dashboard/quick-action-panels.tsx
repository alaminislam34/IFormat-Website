import React from "react";
import Link from "next/link";
import { Briefcase, Users, CreditCard, ArrowUpRight } from "lucide-react";
import { AdminMetricsDTO } from "@/services/admin.service";

interface QuickActionPanelsProps {
  metrics: AdminMetricsDTO | null;
}

export function QuickActionPanels({ metrics }: QuickActionPanelsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Panel 1: Content Moderation */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between space-y-4">
        <div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-3">
            <Briefcase className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Job Postings Moderation</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Review published, draft, and closed job listings. Toggle featured statuses and inspect applicants.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {metrics?.jobs?.published || 0} published jobs
          </span>
          <Link
            href="/admin/jobs"
            className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            Open Queue <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Panel 2: User Moderation & Soft Deletes */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between space-y-4">
        <div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">User & Account Directory</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Inspect candidates and employer profiles. Ban suspicious accounts or restore soft-deleted users.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {metrics?.users?.banned || 0} banned • {metrics?.users?.deleted || 0} soft-deleted
          </span>
          <Link
            href="/admin/users"
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            View Directory <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Panel 3: Monetization & Plans */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between space-y-4">
        <div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Membership Plans & Entitlements</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Configure Employer & Candidate membership plans, set pricing, adjust feature limits, and grant manual comped subscriptions.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {metrics?.revenue?.totalPlansCount || 0} active tiers
          </span>
          <Link
            href="/admin/plans"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            Edit Plans <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
