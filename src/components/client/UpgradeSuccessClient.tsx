"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export function UpgradeSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setMessage("No session ID found");
      return;
    }

    // Verify the session with our backend
    const verifySession = async () => {
      try {
        const response = await fetch(`/api/client/subscriptions/verify?session_id=${sessionId}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage("Your subscription has been activated!");
          
          // Redirect to subscriptions page after 3 seconds
          setTimeout(() => {
            router.push("/client/subscriptions");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to verify subscription");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Failed to verify subscription");
      }
    };

    verifySession();
  }, [sessionId, router]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white/5/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center"
      >
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-white mb-2">Processing Payment</h1>
            <p className="text-slate-400">Please wait while we confirm your subscription...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-slate-400 mb-6">{message}</p>
            <p className="text-sm text-slate-500">Redirecting you to your subscriptions...</p>
            <Link
              href="/client/subscriptions"
              className="mt-4 inline-block text-cyan-400 hover:text-cyan-300 text-sm"
            >
              Go to Subscriptions Now →
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-slate-400 mb-6">{message}</p>
            <div className="space-y-2">
              <Link
                href="/client/subscriptions"
                className="block w-full py-2 px-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
              >
                View Subscriptions
              </Link>
              <Link
                href="/client/upgrade"
                className="block w-full py-2 px-4 bg-white/10 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
