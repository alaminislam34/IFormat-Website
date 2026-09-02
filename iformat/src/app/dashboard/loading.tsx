import React from "react";

export default function DashboardLoading() {
  return (
    <div className="text-slate-900 py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in-50 duration-300">
      <div className="max-w-7xl w-11/12 mx-auto space-y-8">
        {/* Welcome Header Skeleton */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-28 rounded-full bg-slate-200/70 animate-pulse" />
                <div className="h-6 w-24 rounded-full bg-slate-200/70 animate-pulse" />
              </div>
              <div className="h-9 w-64 sm:w-80 rounded-2xl bg-slate-200 animate-pulse" />
              <div className="h-4 w-72 sm:w-96 rounded-xl bg-slate-200/60 animate-pulse" />
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="h-11 w-36 rounded-xl bg-slate-200 animate-pulse" />
              <div className="h-11 w-32 rounded-xl bg-slate-200 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Stats Grid Skeleton (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={`stat-skeleton-${i}`}
              className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 animate-pulse" />
                <div className="h-5 w-14 rounded-full bg-slate-100 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-8 w-20 rounded-xl bg-slate-200 animate-pulse" />
                <div className="h-3.5 w-28 rounded-lg bg-slate-200/60 animate-pulse" />
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Main Content 2-Column Skeleton Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Table / Applications / Jobs Card Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="space-y-2">
                  <div className="h-6 w-44 rounded-xl bg-slate-200 animate-pulse" />
                  <div className="h-3.5 w-64 rounded-lg bg-slate-200/60 animate-pulse" />
                </div>
                <div className="h-4 w-28 rounded-lg bg-slate-200/60 animate-pulse" />
              </div>

              {/* Rows Skeleton */}
              <div className="space-y-3.5">
                {[1, 2, 3, 4, 5].map((row) => (
                  <div
                    key={`row-skeleton-${row}`}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-slate-200 animate-pulse shrink-0" />
                      <div className="space-y-2">
                        <div className="h-4 w-48 sm:w-60 rounded-lg bg-slate-200 animate-pulse" />
                        <div className="h-3 w-32 rounded-lg bg-slate-200/60 animate-pulse" />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="h-7 w-24 rounded-full bg-slate-200 animate-pulse" />
                      <div className="h-8 w-20 rounded-xl bg-slate-200 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar Shortcuts Skeleton */}
          <div className="space-y-6">
            {/* AI Suite Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-200 animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-4 w-28 rounded-lg bg-slate-200 animate-pulse" />
                  <div className="h-3 w-36 rounded-lg bg-slate-200/60 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                {[1, 2, 3].map((shortcut) => (
                  <div
                    key={`ai-shortcut-${shortcut}`}
                    className="h-12 rounded-2xl bg-slate-100 animate-pulse w-full"
                  />
                ))}
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="h-4 w-32 rounded-lg bg-slate-200 animate-pulse pb-2 border-b border-slate-100" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((link) => (
                  <div
                    key={`quick-link-${link}`}
                    className="h-9 rounded-xl bg-slate-100 animate-pulse w-full"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
