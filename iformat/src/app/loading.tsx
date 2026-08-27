export default function GlobalLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-slate-800" />
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
      <p className="text-xs font-medium text-slate-400 animate-pulse tracking-wide uppercase">
        Loading...
      </p>
    </div>
  );
}
