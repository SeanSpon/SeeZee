"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";

interface AuthConfig {
  env: {
    hasAuthSecret: boolean;
    hasGoogleId: boolean;
    hasGoogleSecret: boolean;
    hasAuthUrl: boolean;
    hasNextAuthUrl: boolean;
    authUrl: string;
    nextAuthUrl: string;
    nodeEnv: string;
  };
  oauth: {
    googleClientId: string;
    googleClientSecret: string;
    expectedCallbackUrl: string;
  };
  recommendations: string[];
  googleOAuthSettings: {
    authorizedRedirectUri: string;
    authorizedJavaScriptOrigins: string;
  };
}

export default function AuthTestPage() {
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/debug-auth")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load auth config:", err);
        setLoading(false);
      });
  }, []);

  const testSignIn = async () => {
    setStatus("Testing sign in...");
    setError("");

    try {
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        setError(`Sign in error: ${result.error}`);
        setStatus("Failed");
      } else if (result?.ok) {
        setStatus("Success! Redirecting...");
        window.location.href = "/";
      } else {
        setStatus("Unknown response");
      }
    } catch (err: any) {
      setError(`Exception: ${err.message}`);
      setStatus("Failed");
      console.error("Sign in error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Auth Configuration Test</h1>
        
        {loading ? (
          <div className="bg-slate-900 p-6 rounded-lg">Loading configuration...</div>
        ) : config ? (
          <>
            <div className="bg-slate-900 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className={config.env.hasAuthSecret ? "text-green-400" : "text-red-400"}>
                    {config.env.hasAuthSecret ? "✅" : "❌"}
                  </span>
                  <span>AUTH_SECRET or NEXTAUTH_SECRET: {config.env.hasAuthSecret ? "Set" : "Not set"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={config.env.hasGoogleId ? "text-green-400" : "text-red-400"}>
                    {config.env.hasGoogleId ? "✅" : "❌"}
                  </span>
                  <span>Google Client ID: {config.env.hasGoogleId ? "Set" : "Not set"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={config.env.hasGoogleSecret ? "text-green-400" : "text-red-400"}>
                    {config.env.hasGoogleSecret ? "✅" : "❌"}
                  </span>
                  <span>Google Client Secret: {config.env.hasGoogleSecret ? "Set" : "Not set"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={config.env.hasAuthUrl || config.env.hasNextAuthUrl ? "text-green-400" : "text-yellow-400"}>
                    {config.env.hasAuthUrl || config.env.hasNextAuthUrl ? "✅" : "⚠️"}
                  </span>
                  <span>AUTH_URL: {config.env.authUrl}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={config.env.hasNextAuthUrl ? "text-green-400" : "text-yellow-400"}>
                    {config.env.hasNextAuthUrl ? "✅" : "⚠️"}
                  </span>
                  <span>NEXTAUTH_URL: {config.env.nextAuthUrl}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>NODE_ENV: {config.env.nodeEnv}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-semibold mb-4">Google OAuth Configuration</h2>
              <div className="space-y-2 text-sm font-mono">
                <div>
                  <strong className="text-yellow-400">Expected Callback URL:</strong>
                  <div className="mt-1 p-2 bg-slate-800 rounded break-all">
                    {config.oauth.expectedCallbackUrl}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    ⚠️ This URL must be added to Google Cloud Console → OAuth 2.0 Client → Authorized redirect URIs
                  </p>
                </div>
                <div className="mt-4">
                  <strong className="text-yellow-400">Authorized JavaScript Origins:</strong>
                  <div className="mt-1 p-2 bg-slate-800 rounded">
                    {config.googleOAuthSettings.authorizedJavaScriptOrigins}
                  </div>
                </div>
              </div>
            </div>

            {config.recommendations.length > 0 && (
              <div className="bg-yellow-900/20 border border-yellow-500/50 p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-4 text-yellow-400">Recommendations</h2>
                <ul className="space-y-2 text-sm">
                  {config.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-slate-900 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-semibold mb-4">Test Sign In</h2>
              <button
                onClick={testSignIn}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
                disabled={status === "Testing sign in..."}
              >
                {status || "Test Google Sign In"}
              </button>
              
              {error && (
                <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded">
                  <p className="text-red-300 font-semibold mb-2">Error:</p>
                  <p className="text-red-300">{error}</p>
                  {error.includes("Configuration") && (
                    <div className="mt-3 text-xs text-red-400">
                      <p className="font-semibold mb-1">Common causes:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Missing AUTH_URL or NEXTAUTH_URL environment variable</li>
                        <li>Callback URL in Google Console doesn't match: {config.oauth.expectedCallbackUrl}</li>
                        <li>Wrong domain in Google OAuth settings</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {status && !error && (
                <div className="mt-4 p-4 bg-green-900/50 border border-green-500 rounded">
                  <p className="text-green-300">{status}</p>
                </div>
              )}
            </div>
          </>
        ) : null}

        <div className="bg-slate-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="text-sm space-y-2">
            <p>
              <a href="/login" className="text-blue-400 hover:underline">
                → Go to login page
              </a>
            </p>
            <p>
              <a href="/api/debug-auth" className="text-blue-400 hover:underline" target="_blank">
                → View raw debug data (JSON)
              </a>
            </p>
            <p className="text-xs text-slate-400 mt-4">
              Check browser console and network tab for detailed logs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

