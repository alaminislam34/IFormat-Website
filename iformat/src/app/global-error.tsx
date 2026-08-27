"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("💥 Critical Root Layout Error in global-error.tsx:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans antialiased">
        <div className="max-w-md w-full text-center bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Application Error</h2>
          <p className="text-slate-400 text-sm mb-6">
            A critical system error occurred. Please try reloading the application.
          </p>
          {error?.digest && (
            <p className="text-xs font-mono text-slate-500 mb-6 break-all">
              Error Digest: {error.digest}
            </p>
          )}
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Reload Page
          </button>
        </div>
      </body>
    </html>
  );
}
