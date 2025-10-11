"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function OnboardingTosPage() {
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, update } = useSession();

  const handleAccept = async () => {
    if (!agreed) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/onboarding/tos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accepted: true }),
      });

      if (response.ok) {
        // Update session with new data
        await update({
          tosAcceptedAt: new Date().toISOString(),
        });
        
        // Force a hard navigation to bypass middleware cache
        window.location.href = "/onboarding/profile";
      } else {
        alert("Failed to accept terms. Please try again.");
      }
    } catch (error) {
      console.error("ToS error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-blue-500/20 backdrop-blur-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Step 1 of 2
          </div>
          <h1 className="text-5xl font-bold text-white mb-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-slate-400 text-lg">Please review and accept our terms to continue</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl hover:border-white/20 transition-all duration-300">
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 max-h-96 overflow-y-auto mb-6 hover:bg-slate-900/70 transition-colors scrollbar-thin scrollbar-thumb-blue-500/50 scrollbar-track-transparent">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              SeeZee Terms of Service
            </h2>
            <p className="text-slate-400 text-sm mb-6 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Last updated: October 10, 2025
            </p>

            <div className="space-y-6 text-slate-300 text-sm">
              <section className="group">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-500/20 rounded-full text-blue-400 text-xs">1</span>
                  Acceptance of Terms
                </h3>
                <p className="pl-8">
                  By accessing and using SeeZee's services, you accept and agree to be bound by the
                  terms and provision of this agreement.
                </p>
              </section>

              <section className="group">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-500/20 rounded-full text-blue-400 text-xs">2</span>
                  Use License
                </h3>
                <p className="pl-8">
                  Permission is granted to temporarily access the materials (information or software)
                  on SeeZee's platform for personal, non-commercial transitory viewing only.
                </p>
              </section>

              <section className="group">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-500/20 rounded-full text-blue-400 text-xs">3</span>
                  User Account
                </h3>
                <p className="pl-8">
                  You are responsible for safeguarding the password that you use to access the service
                  and for any activities or actions under your password.
                </p>
              </section>

              <section className="group">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-500/20 rounded-full text-blue-400 text-xs">4</span>
                  Privacy Policy
                </h3>
                <p className="pl-8">
                  Your use of SeeZee is also governed by our Privacy Policy. Please review our Privacy
                  Policy, which also governs the site and informs users of our data collection practices.
                </p>
              </section>

              <section className="group">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-500/20 rounded-full text-blue-400 text-xs">5</span>
                  Service Modifications
                </h3>
                <p className="pl-8">
                  SeeZee reserves the right to modify or discontinue, temporarily or permanently, the
                  service with or without notice.
                </p>
              </section>

              <section className="group">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-500/20 rounded-full text-blue-400 text-xs">6</span>
                  Limitation of Liability
                </h3>
                <p className="pl-8">
                  In no event shall SeeZee or its suppliers be liable for any damages (including,
                  without limitation, damages for loss of data or profit, or due to business interruption)
                  arising out of the use or inability to use the materials on SeeZee's platform.
                </p>
              </section>

              <section className="group">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-500/20 rounded-full text-blue-400 text-xs">7</span>
                  Governing Law
                </h3>
                <p className="pl-8">
                  These terms and conditions are governed by and construed in accordance with the laws
                  and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                </p>
              </section>
            </div>
          </div>

          <label className="flex items-start gap-3 mb-6 cursor-pointer group p-4 rounded-lg hover:bg-white/5 transition-all">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer transition-all"
            />
            <span className="text-slate-300 text-sm group-hover:text-white transition-colors leading-relaxed">
              I have read and agree to the Terms of Service and Privacy Policy. I understand that
              by checking this box and clicking "Accept & Continue", I am creating a legally binding
              agreement.
            </span>
          </label>

          <button
            onClick={handleAccept}
            disabled={!agreed || isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/50 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                Accept & Continue
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Your data is protected with industry-standard encryption
        </p>
      </div>
    </div>
  );
}
