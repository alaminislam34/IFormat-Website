"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home, LifeBuoy } from "lucide-react";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log client-side error diagnostics
    console.error("🚨 Unhandled App Router Error caught by error.tsx:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="relative max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none text-center overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/15 dark:bg-rose-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Warning Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-6 shadow-sm">
          <AlertTriangle className="w-8 h-8 animate-pulse" />
        </div>

        {/* Headings */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          Something went wrong
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base mb-6 leading-relaxed">
          An unexpected error occurred while loading this page. Our team has been notified. You can try refreshing or returning to the homepage.
        </p>

        {/* Error Digest (if available) */}
        {error?.digest && (
          <div className="mb-6 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-mono text-slate-500 dark:text-slate-400 break-all select-all">
            Reference ID: {error.digest}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Help Link */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <LifeBuoy className="w-4 h-4 text-blue-500" />
          <span>Need assistance? <Link href="/services" className="text-blue-600 dark:text-blue-400 underline font-medium hover:text-blue-700">Contact Support</Link></span>
        </div>
      </div>
    </div>
  );
}
