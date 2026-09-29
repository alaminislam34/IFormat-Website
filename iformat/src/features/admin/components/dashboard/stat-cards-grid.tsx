import React from "react";
import Link from "next/link";
import { CreditCard, Users, Building2, Briefcase, ArrowUpRight } from "lucide-react";
import { AdminMetricsDTO } from "@/services/admin.service";

interface StatCardsGridProps {
  metrics: AdminMetricsDTO | null;
}

export function StatCardsGrid({ metrics }: StatCardsGridProps) {
  const statCards = [
    {
      title: "Monthly Recurring Revenue",
      value: metrics?.revenue?.mrrFormatted || "$0",
      subtext: `${metrics?.revenue?.activePaidSubscribers || 0} active paid memberships`,
      icon: CreditCard,
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
      href: "/admin/subscriptions",
    },
    {
      title: "Registered Candidates",
      value: (metrics?.users?.candidates || 0).toLocaleString(),
      subtext: `${metrics?.users?.total || 0} total accounts`,
      icon: Users,
      iconBg: "bg-sky-50 text-sky-600 border border-sky-100",
      href: "/admin/users",
    },
    {
      title: "Hiring Companies",
      value: (metrics?.users?.employers || 0).toLocaleString(),
      subtext: `${metrics?.jobs?.published || 0} live published jobs`,
      icon: Building2,
      iconBg: "bg-indigo-50 text-indigo-600 border border-indigo-100",
      href: "/admin/companies",
    },
    {
      title: "Job Applications",
      value: (metrics?.applications?.total || 0).toLocaleString(),
      subtext: `${metrics?.consultations?.totalBookings || 0} consultations booked`,
      icon: Briefcase,
      iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
      href: "/admin/jobs",
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {statCards.map((card, idx) => {
        const Icon = card.icon;

        return (
          <Link
            key={idx}
            href={card.href}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 hover:border-slate-300 hover:shadow-md transition-all group flex flex-col justify-between shadow-xs"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500">{card.title}</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div>
              <div className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{card.value}</div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{card.subtext}</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
