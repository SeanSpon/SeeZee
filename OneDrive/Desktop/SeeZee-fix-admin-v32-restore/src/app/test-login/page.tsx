"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TestLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    // Fetch debug info
    fetch("/api/debug-auth")
      .then((res) => res.json())
      .then((data) => setDebugInfo(data))
      .catch((err) => console.error("Failed to fetch debug info:", err));
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session) {
      console.log("✅ User is authenticated:", session);
      // Redirect to home after a short delay
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Login Test Page</h1>

        <div className="bg-slate-900 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Status:</span>{" "}
              <span
                className={
                  status === "authenticated"
                    ? "text-green-400"
                    : status === "loading"
                    ? "text-yellow-400"
                    : "text-red-400"
                }
              >
                {status}
              </span>
            </div>
            {session && (
              <div>
                <span className="font-semibold">User:</span> {session.user?.email}
              </div>
            )}
            {session && (
              <div>
                <span className="font-semibold">Role:</span>{" "}
                {(session.user as any)?.role || "N/A"}
              </div>
            )}
          </div>
        </div>

        {debugInfo && (
          <div className="bg-slate-900 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Configuration</h2>
            <pre className="bg-slate-800 p-4 rounded overflow-x-auto text-xs">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        {status === "authenticated" && (
          <div className="bg-green-900/20 border border-green-500 p-6 rounded-lg">
            <p className="text-green-400 font-semibold mb-2">
              ✅ Successfully authenticated!
            </p>
            <p className="text-sm text-slate-300">
              Redirecting to home page in 2 seconds...
            </p>
          </div>
        )}

        {status === "unauthenticated" && (
          <div className="bg-yellow-900/20 border border-yellow-500 p-6 rounded-lg">
            <p className="text-yellow-400 font-semibold mb-2">
              ⚠️ Not authenticated
            </p>
            <p className="text-sm text-slate-300 mb-4">
              Go to <a href="/login" className="text-blue-400 underline">/login</a> to sign in
            </p>
          </div>
        )}

        {status === "loading" && (
          <div className="bg-blue-900/20 border border-blue-500 p-6 rounded-lg">
            <p className="text-blue-400 font-semibold">Loading session...</p>
          </div>
        )}
      </div>
    </div>
  );
}

