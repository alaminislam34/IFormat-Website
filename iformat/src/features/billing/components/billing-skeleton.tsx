import React from "react";

export function BillingSkeleton() {
  return (
    <div className="py-8 p-6 relative selection:bg-sky-100 selection:text-sky-900 animate-in fade-in-50 duration-300">
      <div className="space-y-10 relative z-10">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-200/60">
          <div className="space-y-3">
            <div className="h-4 w-28 rounded-md bg-slate-200 animate-pulse" />
            <div className="h-9 w-64 sm:w-80 rounded-2xl bg-slate-200 animate-pulse" />
            <div className="h-4 w-80 sm:w-110 rounded-xl bg-slate-200/70 animate-pulse" />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-11 w-28 rounded-xl bg-slate-200 animate-pulse" />
            <div className="h-11 w-36 rounded-xl bg-slate-200 animate-pulse" />
          </div>
        </div>

        {/* Active Membership Hero Card Skeleton */}
        <div className="relative rounded-3xl overflow-hidden bg-linear-to-br from-slate-900 via-[#0B1528] to-slate-950 p-8 md:p-10 border border-slate-800 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <div className="h-6 w-36 rounded-full bg-slate-800 animate-pulse" />
                <div className="h-6 w-44 rounded-full bg-slate-800/80 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-8 w-56 rounded-2xl bg-slate-700 animate-pulse" />
                <div className="h-4 w-72 sm:w-96 rounded-xl bg-slate-800 animate-pulse" />
              </div>
              <div className="grid sm:grid-cols-2 gap-2.5 pt-2">
                {[1, 2, 3, 4].map((item) => (
                  <div key={`plan-feat-${item}`} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-slate-800 animate-pulse shrink-0" />
                    <div className="h-3.5 w-40 rounded-lg bg-slate-800/80 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
              <div className="h-12 w-36 rounded-2xl bg-slate-700 animate-pulse" />
              <div className="h-3.5 w-24 rounded-lg bg-slate-800 animate-pulse" />
              <div className="flex items-center gap-3 pt-2">
                <div className="h-11 w-40 rounded-xl bg-slate-800 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Quota Meters Grid Skeleton */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="h-6 w-52 rounded-xl bg-slate-200 animate-pulse" />
            <div className="h-3.5 w-80 rounded-lg bg-slate-200/60 animate-pulse" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((meter) => (
              <div
                key={`meter-skel-${meter}`}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 w-28 rounded-md bg-slate-200 animate-pulse" />
                  <div className="w-8 h-8 rounded-xl bg-slate-100 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-8 w-20 rounded-xl bg-slate-200 animate-pulse" />
                  <div className="h-2 w-full rounded-full bg-slate-100 animate-pulse" />
                </div>
                <div className="h-3 w-32 rounded-md bg-slate-200/60 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Plans Switcher Grid Skeleton */}
        <div className="space-y-6 pt-4 border-t border-slate-200/60">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="h-7 w-48 rounded-xl bg-slate-200 animate-pulse mx-auto" />
            <div className="h-4 w-72 rounded-lg bg-slate-200/60 animate-pulse mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((card) => (
              <div
                key={`plan-card-skel-${card}`}
                className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="h-6 w-24 rounded-full bg-slate-100 animate-pulse" />
                  <div className="h-7 w-36 rounded-xl bg-slate-200 animate-pulse" />
                  <div className="h-10 w-28 rounded-2xl bg-slate-200 animate-pulse" />
                  <div className="h-4 w-full rounded-lg bg-slate-100 animate-pulse" />
                  <div className="space-y-2.5 pt-4 border-t border-slate-100">
                    {[1, 2, 3, 4].map((f) => (
                      <div key={`plan-skel-f-${f}`} className="h-4 w-full rounded-md bg-slate-100 animate-pulse" />
                    ))}
                  </div>
                </div>
                <div className="h-12 w-full rounded-xl bg-slate-200 animate-pulse pt-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
