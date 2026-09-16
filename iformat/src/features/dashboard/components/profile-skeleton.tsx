export function ProfileSkeleton() {
  return (
    <div className="py-8 p-6 relative selection:bg-sky-100 selection:text-sky-900 animate-in fade-in-50 duration-300">
      <div className="space-y-8 relative z-10">
        <div className="space-y-3">
          <div className="h-4 w-32 rounded-md bg-slate-200 animate-pulse" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="h-8 w-64 sm:w-80 rounded-2xl bg-slate-200 animate-pulse" />
              <div className="h-4 w-72 sm:w-96 rounded-xl bg-slate-200/60 animate-pulse" />
            </div>
            <div className="h-8 w-32 rounded-xl bg-slate-200 animate-pulse" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-200 animate-pulse shrink-0" />
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-6 w-44 rounded-xl bg-slate-200 animate-pulse" />
                  <div className="h-5 w-20 rounded-lg bg-slate-100 animate-pulse" />
                </div>
                <div className="h-4 w-40 rounded-lg bg-slate-200/60 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1.5 self-start sm:self-auto">
              <div className="h-8 w-36 rounded-xl bg-slate-100 animate-pulse" />
              <div className="h-3 w-28 rounded-md bg-slate-200/50 animate-pulse" />
            </div>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column (Forms) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information Skeleton */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-5 w-40 rounded-lg bg-slate-200 animate-pulse" />
                  <div className="h-3.5 w-60 rounded-md bg-slate-200/60 animate-pulse" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="h-3.5 w-24 rounded-md bg-slate-200 animate-pulse" />
                  <div className="h-11 w-full rounded-xl bg-slate-50 border border-slate-100 animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-24 rounded-md bg-slate-200 animate-pulse" />
                    <div className="h-11 w-full rounded-xl bg-slate-50 border border-slate-100 animate-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-24 rounded-md bg-slate-200 animate-pulse" />
                    <div className="h-11 w-full rounded-xl bg-slate-50 border border-slate-100 animate-pulse" />
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <div className="h-11 w-44 rounded-xl bg-slate-200 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Password & Security Skeleton */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-5 w-40 rounded-lg bg-slate-200 animate-pulse" />
                  <div className="h-3.5 w-60 rounded-md bg-slate-200/60 animate-pulse" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="h-3.5 w-32 rounded-md bg-slate-200 animate-pulse" />
                  <div className="h-11 w-full rounded-xl bg-slate-50 border border-slate-100 animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-28 rounded-md bg-slate-200 animate-pulse" />
                    <div className="h-11 w-full rounded-xl bg-slate-50 border border-slate-100 animate-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-28 rounded-md bg-slate-200 animate-pulse" />
                    <div className="h-11 w-full rounded-xl bg-slate-50 border border-slate-100 animate-pulse" />
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <div className="h-11 w-48 rounded-xl bg-slate-200 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="space-y-6">
            {/* Quick Links Card Skeleton */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="h-4 w-32 rounded-md bg-slate-200 animate-pulse" />
              <div className="space-y-2.5">
                {[1, 2, 3].map((item) => (
                  <div
                    key={`profile-link-skel-${item}`}
                    className="h-14 rounded-2xl bg-slate-50 border border-slate-100 animate-pulse w-full"
                  />
                ))}
              </div>
            </div>

            {/* Security Box Skeleton */}
            <div className="bg-linear-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-slate-700 animate-pulse" />
                <div className="h-4 w-36 rounded-md bg-slate-700 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-slate-800 animate-pulse" />
                <div className="h-3 w-4/5 rounded bg-slate-800 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
