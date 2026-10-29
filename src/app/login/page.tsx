"use client";

import { getProviders, signIn, useSession } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiEye, FiEyeOff, FiLoader } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import Link from "next/link";
import LogoHeader from "@/components/brand/LogoHeader";

const STAFF_ROLES = ["CEO", "ADMIN", "CFO", "FRONTEND", "BACKEND", "OUTREACH", "STAFF", "DEV", "DESIGNER", "INTERN", "PARTNER"];

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "That email and password don't match. Please try again.",
  OAuthAccountNotLinked:
    "This email is already registered with a password. Sign in with your password instead, or reset it below.",
  OAuthSignin: "Google sign-in couldn't start. Please try again.",
  OAuthCallback: "Google sign-in was interrupted. Please try again.",
  OAuthCallbackError: "Google sign-in was interrupted. Please try again.",
  AccessDenied: "Access was denied. If you think this is a mistake, contact us.",
  Verification: "That sign-in link has expired. Please request a new one.",
  Configuration: "We're having trouble signing you in right now. Please try again in a minute, or contact us if it keeps happening.",
  SessionRequired: "Please sign in to continue.",
};

function friendlyError(code: string) {
  return ERROR_MESSAGES[code] ?? "Something went wrong signing you in. Please try again.";
}

// Only allow same-site relative paths as post-login destinations.
function safeCallback(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    const path = `${url.pathname}${url.search}${url.hash}`;
    if (path === "/" || path.startsWith("/login")) return null;
    return path;
  } catch {
    return null;
  }
}

function dashboardFor(role?: string | null) {
  return role && STAFF_ROLES.includes(role) ? "/admin" : "/client";
}

// reCAPTCHA can hang forever if its script is blocked (ad blockers, CSP,
// wrong domain). Never let it hold up sign-in for more than a few seconds.
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | undefined> {
  return Promise.race([promise, new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), ms))]);
}

function LoginContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [isLoading, setIsLoading] = useState(false);
  const [googleAvailable, setGoogleAvailable] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Support both returnUrl (from middleware) and callbackUrl (from NextAuth)
  const rawCallback = searchParams.get("returnUrl") || searchParams.get("callbackUrl");

  useEffect(() => {
    getProviders()
      .then((providers) => setGoogleAvailable(!!providers?.google))
      .catch(() => setGoogleAvailable(false));
  }, []);

  // Already signed in: go straight to the right place.
  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    router.replace(safeCallback(rawCallback) ?? dashboardFor(session.user.role as string));
  }, [session, status, router, rawCallback]);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) setError(friendlyError(errorParam));
  }, [searchParams]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let recaptchaToken: string | undefined;
      if (executeRecaptcha && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
        try {
          recaptchaToken = await withTimeout(executeRecaptcha("login"), 4000);
        } catch (recaptchaError) {
          console.warn("reCAPTCHA unavailable, continuing without it:", recaptchaError);
        }
      }

      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        ...(recaptchaToken ? { recaptchaToken } : {}),
        redirect: false,
      });

      if (!result || result.error) {
        setError(friendlyError(result?.error || "CredentialsSignin"));
        setIsLoading(false);
        return;
      }

      // Non-critical bookkeeping; never block the redirect on it.
      fetch("/api/settings/sessions/track", { method: "POST" }).catch(() => {});

      let destination = safeCallback(rawCallback);
      if (!destination) {
        try {
          const res = await fetch("/api/user/me", { cache: "no-store" });
          const me = res.ok ? await res.json() : null;
          destination = dashboardFor(me?.role);
        } catch {
          destination = "/client";
        }
      }
      // Full page load so the middleware and server components see the fresh session cookie.
      window.location.assign(destination);
    } catch (err) {
      console.error("Sign in exception:", err);
      setError(friendlyError("Configuration"));
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: safeCallback(rawCallback) ?? "/client" });
    } catch (err) {
      console.error("Google sign in exception:", err);
      setError(friendlyError("OAuthSignin"));
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[#0b0b0c] text-white lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden border-r border-white/[0.08] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_0%,rgba(220,38,38,0.22),transparent_70%)]" />
        <Link href="/" className="relative inline-flex w-fit" aria-label="SeeZee Studio home">
          <LogoHeader href="" />
        </Link>
        <div className="relative">
          <h2 className="font-heading text-4xl font-bold !leading-[1.15] tracking-tight">
            Your project, invoices and messages — all in one place.
          </h2>
          <p className="mt-5 max-w-md text-lg text-white/60">
            Sign in to the SeeZee client portal to review progress, request changes and talk with the team.
          </p>
        </div>
        <p className="relative text-sm text-white/55">SeeZee Studio · Louisville, KY</p>
      </aside>

      {/* Form */}
      <main className="flex flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-white/60 hover:text-white">
            <FiArrowLeft aria-hidden className="h-4 w-4" /> Back to site
          </Link>
          <div className="lg:hidden">
            <LogoHeader href="" />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="font-heading text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-white/60">
            New here?{" "}
            <Link href="/register" className="font-semibold text-red-400 hover:text-red-300">
              Create an account
            </Link>
          </p>

          {error && (
            <div role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {googleAvailable && (
            <>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-3.5 font-semibold text-gray-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FcGoogle aria-hidden className="h-5 w-5" />
                Continue with Google
              </button>
              <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-wider text-white/55">
                <span className="h-px flex-1 bg-white/10" />
                or
                <span className="h-px flex-1 bg-white/10" />
              </div>
            </>
          )}

          <form onSubmit={handleEmailLogin} className={googleAvailable ? "space-y-5" : "mt-8 space-y-5"} noValidate={false}>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/80">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                placeholder="you@business.com"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white placeholder-white/30 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <div className="mb-2 flex flex-nowrap items-center justify-between gap-4">
                <label htmlFor="password" className="!mb-0 !w-auto text-sm font-medium text-white/80">
                  Password
                </label>
                <Link href="/forgot-password" className="inline-flex items-center whitespace-nowrap text-sm text-white/60 hover:text-red-400">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 pr-12 text-white placeholder-white/30 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-white/55 hover:text-white"
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3.5 font-semibold text-white shadow-[0_8px_30px_-8px_rgba(220,38,38,0.6)] transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading && <FiLoader aria-hidden className="h-4 w-4 animate-spin" />}
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-white/55">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-white">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-white">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}

function LoginPageWithProvider() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b0b0c]" />}>
      <LoginContent />
    </Suspense>
  );
}

export default function LoginPage() {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

  if (!recaptchaSiteKey) {
    return <LoginPageWithProvider />;
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
      <LoginPageWithProvider />
    </GoogleReCaptchaProvider>
  );
}
