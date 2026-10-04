import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function CompanyCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between space-y-5 shadow-xs">
      <div>
        {/* Top Header: Logo + Upload Button + Verification Badges */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
            <Skeleton className="h-7 w-24 rounded-lg" />
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <Skeleton className="h-6 w-24 rounded-xl" />
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>
        </div>

        {/* Title & Contact Details */}
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-44 rounded-md" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0" />
            <Skeleton className="h-3.5 w-48 rounded" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0" />
            <Skeleton className="h-3.5 w-32 rounded" />
          </div>
        </div>

        {/* Website & Live Profile Links */}
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <Skeleton className="h-6 w-28 rounded-lg" />
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-6 w-24 rounded-lg" />
        </div>

        {/* Description Snippet */}
        <div className="mt-3 space-y-1.5">
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-4/5 rounded" />
        </div>

        {/* Job Count & Joined Date */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
            <Skeleton className="h-3.5 w-24 rounded" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-3 h-3 rounded shrink-0" />
            <Skeleton className="h-3.5 w-28 rounded" />
          </div>
        </div>
      </div>

      {/* Actions: Verification & Delete */}
      <div className="pt-2 flex items-center gap-2">
        <Skeleton className="flex-1 h-10 rounded-xl" />
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
      </div>
    </div>
  );
}

export function CompaniesGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <CompanyCardSkeleton key={`company-skeleton-${idx}`} />
      ))}
    </div>
  );
}

export function CompaniesStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={`companies-stat-skeleton-${idx}`}
          className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-28 rounded-md" />
            <Skeleton className="w-4 h-4 rounded-md" />
          </div>
          <Skeleton className="h-7 w-16 rounded-md" />
          <Skeleton className="h-3 w-36 rounded" />
        </div>
      ))}
    </div>
  );
}

export function CompanyTableSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
      <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 grid grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={`head-skel-${i}`} className="h-4 w-20 rounded" />
        ))}
      </div>
      <div className="divide-y divide-slate-100 p-2">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={`table-skel-row-${idx}`} className="py-4 px-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 flex-1">
              <Skeleton className="w-11 h-11 rounded-2xl shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-3 w-48 rounded" />
              </div>
            </div>
            <Skeleton className="h-6 w-24 rounded-xl" />
            <Skeleton className="h-6 w-20 rounded-lg" />
            <Skeleton className="h-6 w-16 rounded-lg" />
            <Skeleton className="h-6 w-24 rounded-lg" />
            <Skeleton className="h-3.5 w-20 rounded" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20 rounded-xl" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminCompaniesSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      {/* Stats Skeleton */}
      <CompaniesStatsSkeleton />

      {/* Filter Tabs & Search Bar Skeleton */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-full md:max-w-md rounded-xl" />
      </div>

      {/* Table Skeleton */}
      <CompanyTableSkeleton count={6} />
    </div>
  );
}
