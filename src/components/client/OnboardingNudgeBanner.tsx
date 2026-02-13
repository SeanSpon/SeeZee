"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiUser } from "react-icons/fi";
import Link from "next/link";

const DISMISS_KEY = "seezee_onboarding_nudge_dismissed";

export function OnboardingNudgeBanner() {
  const { data: session } = useSession();
  const [dismissed, setDismissed] = useState(true); // Default hidden until checked

  useEffect(() => {
    const wasDismissed = localStorage.getItem(DISMISS_KEY) === "true";
    setDismissed(wasDismissed);
  }, []);

  if (dismissed) return null;

  // Only show if onboarding is incomplete
  const tosAccepted = !!(session?.user as any)?.tosAcceptedAt;
  const profileDone = !!(session?.user as any)?.profileDoneAt;

  if (tosAccepted && profileDone) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="border-b bg-blue-500/10 border-blue-500/20"
      >
        <div className="mx-auto max-w-[1200px] px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <FiUser className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white">
                <span className="font-semibold">Complete your profile</span>
                {" "}in{" "}
                <Link
                  href="/settings?tab=profile"
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium underline"
                >
                  Settings
                </Link>
                {" "}to unlock all features.
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 flex-shrink-0"
              aria-label="Dismiss"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
