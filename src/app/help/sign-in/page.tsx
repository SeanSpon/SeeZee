"use client";

import Link from "next/link";
import { FiArrowLeft, FiCheck, FiX, FiAlertCircle } from "react-icons/fi";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Configuration
const SUPPORT_EMAIL = "support@seezeestudios.com";

function SignInHelpContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen bg-black">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0520] to-[#150a2e]"></div>
      
      {/* Back button */}
      <div className="absolute top-8 left-8 z-50">
        <Link 
          href="/login"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300 text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/5 backdrop-blur-sm border border-white/5 hover:border-white/10"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          {/* Main Card */}
          <div className="bg-gradient-to-br from-[#1a1a2e]/90 via-[#16213e]/80 to-[#0f1419]/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="border-b border-white/10 p-8">
              <h1 className="text-3xl font-heading font-bold mb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-300">
                  Can't Sign In?
                </span>
              </h1>
              <p className="text-gray-400">Let's get you back into your account</p>
            </div>

            <div className="p-8 space-y-6">
              {/* Error-specific help */}
              {error === "Configuration" && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-red-300 mb-2">Configuration Error</h3>
                      <p className="text-red-200 mb-4">
                        This is a server configuration issue. The authentication system is not properly set up.
                      </p>
                      <Link 
                        href="/auth-check"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-200 font-medium transition-all"
                      >
                        Check Configuration Details →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Common Issues */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white mb-4">Common Sign-In Issues</h2>
                
                {/* Issue 1: Wrong Password */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/[0.07] transition-all">
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <span className="text-[#ef4444]">1.</span> Incorrect Email or Password
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">
                    Double-check your email address and password. Passwords are case-sensitive.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link 
                      href="/forgot-password"
                      className="text-sm text-[#ef4444] hover:text-[#dc2626] font-medium"
                    >
                      Reset your password →
                    </Link>
                  </div>
                </div>

                {/* Issue 2: Google OAuth */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/[0.07] transition-all">
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <span className="text-[#ef4444]">2.</span> Google Sign-In Not Working
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">
                    If you're having trouble with Google sign-in, try these steps:
                  </p>
                  <ul className="text-gray-400 text-sm space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <FiCheck className="w-4 h-4 text-[#ef4444] flex-shrink-0 mt-0.5" />
                      <span>Make sure your browser allows third-party cookies and pop-ups</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="w-4 h-4 text-[#ef4444] flex-shrink-0 mt-0.5" />
                      <span>Try signing in with email/password instead</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="w-4 h-4 text-[#ef4444] flex-shrink-0 mt-0.5" />
                      <span>Clear your browser cache and cookies, then try again</span>
                    </li>
                  </ul>
                </div>

                {/* Issue 3: Account Doesn't Exist */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/[0.07] transition-all">
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <span className="text-[#ef4444]">3.</span> Account Not Found
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">
                    If you haven't created an account yet, you'll need to sign up first.
                  </p>
                  <Link 
                    href="/register"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#ef4444]/20 hover:bg-[#ef4444]/30 border border-[#ef4444]/50 rounded-lg text-red-200 font-medium transition-all text-sm"
                  >
                    Create an Account →
                  </Link>
                </div>

                {/* Issue 4: Browser Issues */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/[0.07] transition-all">
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <span className="text-[#ef4444]">4.</span> Browser or Cache Issues
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">
                    Sometimes browser settings or cached data can prevent sign-in.
                  </p>
                  <ul className="text-gray-400 text-sm space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <FiCheck className="w-4 h-4 text-[#ef4444] flex-shrink-0 mt-0.5" />
                      <span>Try using a different browser (Chrome, Firefox, Safari, Edge)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="w-4 h-4 text-[#ef4444] flex-shrink-0 mt-0.5" />
                      <span>Clear your browser cache and cookies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="w-4 h-4 text-[#ef4444] flex-shrink-0 mt-0.5" />
                      <span>Try incognito/private browsing mode</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="w-4 h-4 text-[#ef4444] flex-shrink-0 mt-0.5" />
                      <span>Disable browser extensions temporarily</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Need More Help */}
              <div className="bg-gradient-to-br from-[#ef4444]/10 to-[#dc2626]/5 border border-[#ef4444]/20 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-3">Still Need Help?</h3>
                <p className="text-gray-300 text-sm mb-4">
                  If you've tried everything above and still can't sign in, please contact support:
                </p>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300">
                    <span className="font-medium text-white">Email:</span>{" "}
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#ef4444] hover:text-[#dc2626]">
                      {SUPPORT_EMAIL}
                    </a>
                  </p>
                  <p className="text-gray-400">
                    Please include any error messages you see and what you've tried so far.
                  </p>
                </div>
              </div>

              {/* Back to Login Button */}
              <div className="pt-4 flex justify-center">
                <Link
                  href="/login"
                  className="px-8 py-3 bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white rounded-xl hover:from-[#dc2626] hover:to-[#b91c1c] transition-all duration-300 font-semibold shadow-lg shadow-[#ef4444]/25 hover:shadow-xl hover:shadow-[#ef4444]/40"
                >
                  Try Signing In Again
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInHelpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <SignInHelpContent />
    </Suspense>
  );
}
