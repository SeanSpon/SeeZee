"use client";

export const dynamic = 'force-dynamic';

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import Link from "next/link";
import LogoHeader from "@/components/brand/LogoHeader";

function LoginContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const { executeRecaptcha } = useGoogleReCaptcha();
  // Support both returnUrl (from middleware) and callbackUrl (from NextAuth)
  const callbackUrl = searchParams.get("returnUrl") || searchParams.get("callbackUrl") || "/";

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "loading") return; // Wait for session to load    
    if (session?.user) {
      // User is already signed in, redirect them away from login page
      // Check onboarding status to redirect appropriately
      if (!session.user.tosAcceptedAt) {
        // Need to accept ToS - redirect to onboarding        router.push("/onboarding/tos");
      } else if (!session.user.profileDoneAt) {
        // Need to complete profile        router.push("/onboarding/profile");
      } else {
        // Onboarding complete - redirect to appropriate dashboard or callbackUrl
        const defaultUrl = session.user.role === 'CEO' || session.user.role === 'ADMIN' ? '/admin' : '/client';
        const redirectUrl = callbackUrl === '/' ? defaultUrl : callbackUrl;        router.push(redirectUrl);
      }
    }
  }, [session, status, router, callbackUrl]);

  // Set error from URL parameter
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      console.log("🔴 Login error detected:", errorParam);
      setError(
        errorParam === "OAuthAccountNotLinked"
          ? "Unable to link your Google account. If you have an existing account with this email, please try signing in again or contact support."
          : errorParam === "Configuration"
          ? "Authentication configuration error. Please check /auth-check for details."
          : errorParam === "AccessDenied"
          ? "Access denied. Please try again or contact support."
          : errorParam === "unexpected"
          ? "An unexpected error occurred. Please try again."
          : `Error: ${errorParam}. Please try again or contact support.`
      );
    }
  }, [searchParams]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Get reCAPTCHA token
      if (!executeRecaptcha) {
        throw new Error("reCAPTCHA not ready");
      }
      const recaptchaToken = await executeRecaptcha("login");

      const result = await signIn("credentials", {
        email,
        password,
        recaptchaToken,
        redirect: false,
      });      
      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setError("Invalid email or password. Please try again.");
        } else {
          setError(result.error);
        }
        setIsLoading(false);
      } else {
        // Success - track session creation
        try {
          await fetch('/api/settings/sessions/track', {
            method: 'POST',
          });
        } catch (trackError) {
          // Silently fail session tracking - not critical
          console.error("Failed to track session:", trackError);
        }

        // CRITICAL: Force session refresh to ensure token has latest DB data
        // This prevents redirect loops when user has completed onboarding but token is stale
        try {
          // Wait a moment for NextAuth to finish creating the session
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Fetch fresh user data from database (bypasses token cache)
          const userResponse = await fetch('/api/user/me', {
            cache: 'no-store',
          });          
          if (userResponse.ok) {
            const userData = await userResponse.json();            
            // Determine redirect based on onboarding status from DB
            let redirectUrl = callbackUrl;
            
            if (callbackUrl === '/') {
              // Check if onboarding is complete (using DB data, not token)
              if (userData.tosAcceptedAt && userData.profileDoneAt) {
                // Onboarding complete - go to dashboard
                redirectUrl = userData.role === 'CEO' || userData.role === 'ADMIN' ? '/admin' : '/client';
              } else if (!userData.tosAcceptedAt) {
                // Need to accept ToS
                redirectUrl = '/onboarding/tos';
              } else {
                // Need to complete profile
                redirectUrl = '/onboarding/profile';
              }
            }            
            // Use window.location.href for full page reload to ensure fresh session
            window.location.href = redirectUrl;
          } else {
            // Fallback if user data fetch fails            window.location.href = callbackUrl === '/' ? '/onboarding/tos' : callbackUrl;
          }
        } catch (fetchError) {
          console.error("Error fetching user data:", fetchError);          // Fallback redirect
          window.location.href = callbackUrl === '/' ? '/onboarding/tos' : callbackUrl;
        }
      }
    } catch (err: any) {
      console.error("Sign in exception:", err);
      setError(err.message || "Failed to sign in. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);
    try {
      // For OAuth, redirect to onboarding/tos as default
      // Middleware will handle redirects if already completed
      const oauthCallback = callbackUrl === '/' ? '/onboarding/tos' : callbackUrl;
      await signIn("google", { callbackUrl: oauthCallback });
    } catch (err: any) {
      console.error("Sign in exception:", err);
      setError("Failed to initiate login. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Enhanced Background with Animated Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0520] to-[#150a2e]"></div>
      
      {/* Animated Gradient Orbs */}
      <motion.div 
        className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#ef4444]/20 to-red-600/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [-50, 50, -50],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div 
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/15 to-pink-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
          x: [50, -50, 50],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-[0.02]"></div>

      {/* Back to Home button */}
      <div className="absolute top-8 left-8 z-50">
        <Link 
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300 text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/5 backdrop-blur-sm border border-white/5 hover:border-white/10"
        >
          <FiArrowLeft className="w-4 h-4" />
          Home
        </Link>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Enhanced Card Container */}
          <div className="bg-gradient-to-br from-[#1a1a2e]/90 via-[#16213e]/80 to-[#0f1419]/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Animated top border */}
            <div className="h-1 bg-gradient-to-r from-[#ef4444] via-[#dc2626] to-[#b91c1c] relative overflow-hidden">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
            
            <div className="p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <LogoHeader href="" />
            </motion.div>
          </div>

          {/* Title */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-heading font-bold mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-300">
                Welcome Back
              </span>
            </h1>
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Link href="/register" className="text-[#ef4444] hover:text-[#dc2626] font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </motion.div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mb-6 bg-gradient-to-br from-red-900/40 to-red-900/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm backdrop-blur-sm shadow-lg"
            >
              {error}
            </motion.div>
          )}

          {/* Enhanced Social Login Button */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3 mb-6"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full px-6 py-3.5 bg-white text-gray-900 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 shadow-lg hover:shadow-xl"
            >
              <FcGoogle className="w-5 h-5" />
              Login with Google
            </motion.button>
          </motion.div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#1a1a2e] text-gray-500">or continue with email</span>
            </div>
          </div>

          {/* Enhanced Email/Password Form */}
          <motion.form 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleEmailLogin} 
            className="space-y-5"
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ef4444] focus:border-transparent transition-all backdrop-blur-sm hover:bg-white/[0.07]"
                placeholder="alan.turing@example.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-gray-400 hover:text-[#ef4444] transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ef4444] focus:border-transparent transition-all pr-12 backdrop-blur-sm hover:bg-white/[0.07]"
                  placeholder="••••••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-all p-1 rounded-lg hover:bg-white/5"
                  disabled={isLoading}
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-4 bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white rounded-xl hover:from-[#dc2626] hover:to-[#b91c1c] transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-lg shadow-[#ef4444]/25 hover:shadow-xl hover:shadow-[#ef4444]/40 relative overflow-hidden group"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative z-10">{isLoading ? "Logging in..." : "Log In"}</span>
            </motion.button>
          </motion.form>

          {/* Terms and Privacy */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center"
          >
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{" "}
              <Link href="/legal/terms-of-service" className="underline hover:text-[#ef4444] transition-colors">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/legal/privacy-policy" className="underline hover:text-[#ef4444] transition-colors">
                Privacy Policy
              </Link>.
            </p>
          </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function LoginPageWithProvider() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

export default function LoginPage() {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

  if (!recaptchaSiteKey) {
    console.warn("⚠️ NEXT_PUBLIC_RECAPTCHA_SITE_KEY not configured");
    return <LoginPageWithProvider />;
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
      <LoginPageWithProvider />
    </GoogleReCaptchaProvider>
  );
}
