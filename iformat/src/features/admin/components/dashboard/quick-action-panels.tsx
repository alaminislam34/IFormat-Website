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
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xs hover:border-slate-300 hover:shadow-md transition-all">
        <div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
            <Briefcase className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">Job Postings Moderation</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Review published, draft, and closed job listings. Toggle featured statuses and inspect applicants.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {metrics?.jobs?.published || 0} published jobs
          </span>
          <Link
            href="/admin/jobs"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>Open Queue</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Panel 2: User Moderation & Soft Deletes */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xs hover:border-slate-300 hover:shadow-md transition-all">
        <div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">User & Account Directory</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Inspect candidates and employer profiles. Ban suspicious accounts or restore soft-deleted users.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {metrics?.users?.banned || 0} banned • {metrics?.users?.deleted || 0} soft-deleted
          </span>
          <Link
            href="/admin/users"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View Directory</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Panel 3: Monetization & Plans */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xs hover:border-slate-300 hover:shadow-md transition-all">
        <div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">Membership Plans & Entitlements</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Configure Employer & Candidate membership plans, set pricing, adjust feature limits, and grant manual comped subscriptions.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {metrics?.revenue?.totalPlansCount || 0} active tiers
          </span>
          <Link
            href="/admin/plans"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>Edit Plans</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
