"use client";

import { useEffect, useState } from "react";

export default function TestVercelPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function test() {
      try {
        const res = await fetch("/api/integrations/vercel/deployments");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    test();
  }, []);

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold text-white">Vercel API Test</h1>
      
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h2 className="text-lg font-semibold text-white mb-2">Response:</h2>
        <pre className="text-xs text-white/70 overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>

      <div className="space-y-2">
        <p className="text-white">
          <strong>Source:</strong> {data?.source || "unknown"}
        </p>
        <p className="text-white">
          <strong>Webhook Configured:</strong> {data?.webhookConfigured ? "Yes" : "No"}
        </p>
        <p className="text-white">
          <strong>Deployments Count:</strong> {data?.deployments?.length || 0}
        </p>
        <p className="text-white">
          <strong>Error:</strong> {data?.error || "None"}
        </p>
      </div>

      {data?.deployments && data.deployments.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white mb-2">Deployments:</h2>
          <div className="space-y-2">
            {data.deployments.slice(0, 5).map((d: any) => (
              <div key={d.id} className="text-sm text-white/70">
                <strong>{d.name}</strong> - {d.state} - {d.source}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
