import Link from "next/link";
import { ArrowLeft, Briefcase, FileText, Home, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background glow decorations */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 blur-3xl rounded-full pointer-events-none" />

      <div className="relative max-w-xl w-full text-center">
        {/* Big 404 Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 font-semibold text-xs tracking-wider uppercase mb-6 shadow-sm">
          Error 404
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tight mb-4 font-mono">
          4<span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">0</span>4
        </h1>

        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4 tracking-tight">
          Page not found
        </h2>

        <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-md mx-auto mb-8 leading-relaxed">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. The link might be broken or the page may have been moved.
        </p>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto mb-10">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm transition-all hover:-translate-y-0.5"
          >
            <Home className="w-4 h-4 text-blue-600" />
            Home
          </Link>
          <Link
            href="/job-portal"
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm transition-all hover:-translate-y-0.5"
          >
            <Briefcase className="w-4 h-4 text-cyan-600" />
            Job Portal
          </Link>
          <Link
            href="/job-assistant"
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm transition-all hover:-translate-y-0.5"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            AI Tools
          </Link>
        </div>

        {/* Main CTA */}
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-sm shadow-xl shadow-blue-600/25 transition-all active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}
