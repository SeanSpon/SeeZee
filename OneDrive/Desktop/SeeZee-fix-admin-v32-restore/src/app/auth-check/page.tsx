"use client";

import { useEffect, useState } from "react";

export default function AuthCheckPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/debug-auth")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load config:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div>Loading configuration...</div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Configuration Check</h1>
          <div className="bg-red-900/20 border border-red-500 p-6 rounded-lg">
            <p className="text-red-300">Failed to load configuration. Check your server logs.</p>
          </div>
        </div>
      </div>
    );
  }

  const hasAllRequired = 
    config.env.hasAuthSecret && 
    config.env.hasGoogleId && 
    config.env.hasGoogleSecret &&
    (config.env.hasAuthUrl || config.env.hasNextAuthUrl);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Authentication Configuration Check</h1>

        <div className={`p-6 rounded-lg mb-6 ${hasAllRequired ? 'bg-green-900/20 border border-green-500' : 'bg-red-900/20 border border-red-500'}`}>
          <h2 className="text-xl font-semibold mb-4">
            {hasAllRequired ? "✅ Configuration looks good!" : "❌ Configuration is missing required variables"}
          </h2>
          {!hasAllRequired && (
            <div className="mt-4 space-y-2 text-sm">
              <p className="font-semibold">To fix sign-in issues, you need to set these environment variables:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                {!config.env.hasAuthSecret && (
                  <li className="text-red-300">AUTH_SECRET or NEXTAUTH_SECRET</li>
                )}
                {!config.env.hasGoogleId && (
                  <li className="text-red-300">AUTH_GOOGLE_ID or GOOGLE_CLIENT_ID</li>
                )}
                {!config.env.hasGoogleSecret && (
                  <li className="text-red-300">AUTH_GOOGLE_SECRET or GOOGLE_CLIENT_SECRET</li>
                )}
                {!config.env.hasAuthUrl && !config.env.hasNextAuthUrl && (
                  <li className="text-red-300">AUTH_URL or NEXTAUTH_URL (this is critical!)</li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="bg-slate-900 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables Status</h2>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex items-center gap-3">
              <span className={config.env.hasAuthSecret ? "text-green-400" : "text-red-400"}>
                {config.env.hasAuthSecret ? "✅" : "❌"}
              </span>
              <span>AUTH_SECRET or NEXTAUTH_SECRET: {config.env.hasAuthSecret ? "Set" : "Missing"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={config.env.hasGoogleId ? "text-green-400" : "text-red-400"}>
                {config.env.hasGoogleId ? "✅" : "❌"}
              </span>
              <span>Google Client ID: {config.env.hasGoogleId ? "Set" : "Missing"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={config.env.hasGoogleSecret ? "text-green-400" : "text-red-400"}>
                {config.env.hasGoogleSecret ? "✅" : "❌"}
              </span>
              <span>Google Client Secret: {config.env.hasGoogleSecret ? "Set" : "Missing"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={config.env.hasAuthUrl || config.env.hasNextAuthUrl ? "text-green-400" : "text-yellow-400"}>
                {config.env.hasAuthUrl || config.env.hasNextAuthUrl ? "✅" : "⚠️"}
              </span>
              <span>AUTH_URL: {config.env.authUrl}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={config.env.hasNextAuthUrl ? "text-green-400" : "text-yellow-400"}>
                {config.env.hasNextAuthUrl ? "✅" : "⚠️"}
              </span>
              <span>NEXTAUTH_URL: {config.env.nextAuthUrl}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Google OAuth Configuration</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400 mb-2">Expected Callback URL:</p>
              <div className="bg-slate-800 p-3 rounded font-mono text-sm break-all">
                {config.oauth.expectedCallbackUrl}
              </div>
              <p className="text-xs text-yellow-400 mt-2">
                ⚠️ This URL MUST be added to Google Cloud Console
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-2">Authorized JavaScript Origins:</p>
              <div className="bg-slate-800 p-3 rounded font-mono text-sm">
                {config.googleOAuthSettings.authorizedJavaScriptOrigins}
              </div>
            </div>
          </div>
        </div>

        {config.recommendations && config.recommendations.length > 0 && (
          <div className="bg-yellow-900/20 border border-yellow-500/50 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">Recommendations</h2>
            <ul className="space-y-2 text-sm">
              {config.recommendations.map((rec: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-slate-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">1. Check Environment Variables</h3>
              <p className="text-slate-400 mb-2">
                If you're running locally, create a <code className="bg-slate-800 px-2 py-1 rounded">.env.local</code> file with:
              </p>
              <pre className="bg-slate-800 p-4 rounded overflow-x-auto text-xs">
{`AUTH_SECRET=your-secret-here
AUTH_URL=http://localhost:3000
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
DATABASE_URL=your-database-url`}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. Update Google OAuth Console</h3>
              <p className="text-slate-400 mb-2">
                Go to{" "}
                <a 
                  href="https://console.cloud.google.com/apis/credentials" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Google Cloud Console
                </a>{" "}
                and make sure:
              </p>
              <ul className="list-disc list-inside text-slate-400 ml-4 space-y-1">
                <li>Authorized redirect URIs includes: <code className="bg-slate-800 px-2 py-1 rounded text-xs">{config.oauth.expectedCallbackUrl}</code></li>
                <li>Authorized JavaScript origins includes: <code className="bg-slate-800 px-2 py-1 rounded text-xs">{config.googleOAuthSettings.authorizedJavaScriptOrigins}</code></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. Restart Your Server</h3>
              <p className="text-slate-400">
                After updating environment variables, restart your development server or redeploy your application.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a 
            href="/login" 
            className="text-blue-400 hover:underline"
          >
            → Try signing in again
          </a>
        </div>
      </div>
    </div>
  );
}


