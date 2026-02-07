/**
 * Admin: Workflow Nodes Management
 * /admin/nodes
 * 
 * Create and manage distributed workflow nodes (AI agents, git workers, etc.)
 */

"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  status: "ONLINE" | "OFFLINE" | "BUSY";
  capabilities: Record<string, boolean>;
  lastHeartbeatAt: string | null;
  currentJobId: string | null;
  health: "healthy" | "stale";
  minutesSinceHeartbeat: number | null;
  createdAt: string;
}

export default function AdminNodesPage() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [stats, setStats] = useState({ online: 0, busy: 0, offline: 0 });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newNodeKey, setNewNodeKey] = useState<string | null>(null);

  // Form state
  const [nodeName, setNodeName] = useState("");
  const [nodeType, setNodeType] = useState("GIT_AGENT");

  useEffect(() => {
    fetchNodes();
    const interval = setInterval(fetchNodes, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function fetchNodes() {
    try {
      const res = await fetch("/api/admin/nodes/list");
      const data = await res.json();
      setNodes(data.nodes || []);
      setStats({
        online: data.online || 0,
        busy: data.busy || 0,
        offline: data.offline || 0,
      });
    } catch (error) {
      console.error("Failed to fetch nodes:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createNode() {
    if (!nodeName.trim()) {
      toast.error("Node name is required");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/admin/nodes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nodeName, type: nodeType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setNewNodeKey(data.node.apiKey);
      toast.success(`Node "${nodeName}" created!`);
      setNodeName("");
      fetchNodes();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCreating(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "ONLINE":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "BUSY":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Workflow Nodes</h1>
          <p className="text-gray-400">
            Manage distributed AI agents and workflow workers
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="text-3xl font-bold text-green-400">{stats.online}</div>
            <div className="text-sm text-gray-400">Online</div>
          </div>
          <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="text-3xl font-bold text-yellow-400">{stats.busy}</div>
            <div className="text-sm text-gray-400">Busy</div>
          </div>
          <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="text-3xl font-bold text-gray-400">{stats.offline}</div>
            <div className="text-sm text-gray-400">Offline</div>
          </div>
        </div>

        {/* Create Node Form */}
        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Create New Node</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Node Name</label>
              <input
                type="text"
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
                placeholder="AI Content Agent"
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Type</label>
              <select
                value={nodeType}
                onChange={(e) => setNodeType(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2"
              >
                <option value="GIT_AGENT">Git Agent</option>
                <option value="AI_AGENT">AI Agent</option>
                <option value="BUILD_RUNNER">Build Runner</option>
                <option value="TEST_RUNNER">Test Runner</option>
              </select>
            </div>
          </div>
          <button
            onClick={createNode}
            disabled={creating}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Node"}
          </button>

          {/* API Key Display */}
          {newNodeKey && (
            <div className="mt-4 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 text-2xl">⚠️</span>
                <div className="flex-1">
                  <div className="font-bold text-yellow-400 mb-1">
                    Save This API Key!
                  </div>
                  <div className="text-sm text-gray-300 mb-2">
                    This key will only be shown once. Copy it now:
                  </div>
                  <code className="block bg-black/50 p-3 rounded border border-white/10 text-xs break-all">
                    {newNodeKey}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(newNodeKey);
                      toast.success("Copied to clipboard!");
                    }}
                    className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                  >
                    📋 Copy to Clipboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Nodes List */}
        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Active Nodes ({nodes.length})</h2>
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : nodes.length === 0 ? (
            <div className="text-gray-400 py-8 text-center">
              No nodes created yet. Create your first node above!
            </div>
          ) : (
            <div className="space-y-3">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className="bg-black/50 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{node.name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            node.status
                          )}`}
                        >
                          {node.status}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10">
                          {node.type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <div>
                          Capabilities:{" "}
                          {Object.entries(node.capabilities)
                            .filter(([, enabled]) => enabled)
                            .map(([name]) => name)
                            .join(", ") || "None"}
                        </div>
                        {node.lastHeartbeatAt && (
                          <div>
                            Last heartbeat:{" "}
                            {node.minutesSinceHeartbeat !== null
                              ? `${node.minutesSinceHeartbeat} min ago`
                              : "Never"}
                          </div>
                        )}
                        {node.currentJobId && (
                          <div>Current job: {node.currentJobId}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <div>ID: {node.id.slice(0, 8)}...</div>
                      <div>Created {new Date(node.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Setup Instructions */}
        <div className="mt-8 backdrop-blur-lg bg-blue-400/5 border border-blue-400/20 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-2">🚀 Running a Worker</h3>
          <pre className="text-sm bg-black/50 p-4 rounded border border-white/10 overflow-x-auto">
            {`# 1. Copy your API key from above
# 2. Add to .env.local on your worker machine:
NODE_API_KEY=node_xxxxx.secret

# 3. Run the worker:
npm run worker:git-agent

# The worker will authenticate and start polling for jobs!`}
          </pre>
        </div>
      </div>
    </div>
  );
}
