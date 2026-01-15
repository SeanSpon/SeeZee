"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  const handleReset = () => {
    reset();
  };

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
          <div className="text-center max-w-md">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12">
              <div className="bg-red-500/20 border border-red-500/30 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Critical Error</h1>
              <p className="text-slate-400 mb-8">
                A critical error occurred. Please refresh the page or contact support.
              </p>
              {error.digest && (
                <p className="text-xs text-slate-500 mb-6 font-mono">
                  Error ID: {error.digest}
                </p>
              )}
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium transition-all flex items-center justify-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}


