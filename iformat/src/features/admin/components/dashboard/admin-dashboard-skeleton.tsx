import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCardsGridSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={`stat-card-skeleton-${idx}`}
          className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-3.5 w-32 rounded-md" />
            <Skeleton className="w-10 h-10 rounded-xl" />
          </div>

          <div>
            <Skeleton className="h-8 w-24 rounded-lg mb-2" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-36 rounded-md" />
              <Skeleton className="w-4 h-4 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function QuickActionPanelsSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={`quick-action-skeleton-${idx}`}
          className="bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xs"
        >
          <div>
            <Skeleton className="w-10 h-10 rounded-xl mb-3" />
            <Skeleton className="h-5 w-48 rounded-md mb-2" />
            <div className="space-y-1.5 mt-2">
              <Skeleton className="h-3 w-full rounded-md" />
              <Skeleton className="h-3 w-4/5 rounded-md" />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Skeleton className="h-3.5 w-28 rounded-md" />
            <Skeleton className="h-4 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecentAuditLogsSkeleton() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-4.5 w-56 rounded-md" />
            <Skeleton className="h-3 w-72 rounded-md" />
          </div>
        </div>

        <Skeleton className="h-4 w-24 rounded-md" />
      </div>

      <div className="divide-y divide-slate-100">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={`audit-log-skeleton-${idx}`}
            className="py-3.5 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Skeleton className="h-6 w-24 rounded-lg shrink-0" />
              <div className="space-y-1.5 min-w-0">
                <Skeleton className="h-3.5 w-52 rounded-md" />
                <Skeleton className="h-3 w-40 rounded-md" />
              </div>
            </div>

            <Skeleton className="h-3 w-28 rounded-md shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 sm:w-60 rounded-xl" />
          <Skeleton className="h-4 w-72 sm:w-96 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* KPI Stats Grid Skeleton */}
      <StatCardsGridSkeleton />

      {/* Quick Actions Skeleton */}
      <QuickActionPanelsSkeleton />

      {/* Recent Activity / Audit Logs Skeleton */}
      <RecentAuditLogsSkeleton />
    </div>
  );
}

export default AdminDashboardSkeleton;
