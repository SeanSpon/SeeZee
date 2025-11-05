/**
 * Wired RequestsPanel Component
 * AI-powered request generation and manual request creation
 */

"use client";

import { useState } from "react";
import { useProjectRequests, useProjectSummary, createRequest } from "@/hooks/useProject";
import { Loader2, Sparkles, Send, ChevronDown } from "lucide-react";
import { StatusPill } from "./StatusPill";

interface RequestsPanelProps {
  projectId: string;
}

export function RequestsPanel({ projectId }: RequestsPanelProps) {
  const { requests, isLoading, mutate } = useProjectRequests(projectId);
  const { summary, isLoading: loadingSummary, refetch } = useProjectSummary(projectId);
  
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAnalyze = async () => {
    await refetch();
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !details.trim()) return;

    setSubmitting(true);
    try {
      await createRequest(projectId, {
        title: title.trim(),
        details: details.trim(),
        source: "MANUAL",
      });
      
      setTitle("");
      setDetails("");
      setShowForm(false);
      mutate(); // Refresh request list
    } catch (error) {
      console.error("Failed to create request:", error);
      alert("Failed to create request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptSuggestion = async (suggestion: { title: string; details: string }) => {
    setSubmitting(true);
    try {
      await createRequest(projectId, {
        title: suggestion.title,
        details: suggestion.details,
        source: "AI",
      });
      
      mutate(); // Refresh request list
    } catch (error) {
      console.error("Failed to accept suggestion:", error);
      alert("Failed to create request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Analysis Section */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold">AI Request Assistant</h3>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loadingSummary}
            className="btn-gradient text-sm px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loadingSummary ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze latest Git"
            )}
          </button>
        </div>

        {summary && summary.suggestions && summary.suggestions.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-400">{summary.summary}</p>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-zinc-300">AI Suggestions:</h4>
              {summary.suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="glass-panel p-4 space-y-2 border border-purple-500/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-white">{suggestion.title}</p>
                      <p className="text-sm text-zinc-400">{suggestion.details}</p>
                    </div>
                    <button
                      onClick={() => handleAcceptSuggestion(suggestion)}
                      disabled={submitting}
                      className="btn-gradient text-xs px-3 py-1.5 rounded whitespace-nowrap disabled:opacity-50"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Manual Request Form */}
      <div className="glass-panel p-6 space-y-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-lg font-semibold">Create Manual Request</h3>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${showForm ? "rotate-180" : ""}`}
          />
        </button>

        {showForm && (
          <form onSubmit={handleCreateManual} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Request Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Add dark mode toggle"
                className="input-glass w-full px-4 py-2 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Details
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe what you need..."
                rows={4}
                className="input-glass w-full px-4 py-2 rounded-lg resize-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-gradient w-full py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Request
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Request List */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-lg font-semibold">All Requests</h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            <p>No requests yet. Create your first one above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="glass-panel p-4 space-y-2 hover:border-purple-500/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{request.title}</p>
                      {request.source === "AI" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          AI
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400">{request.details}</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusPill status={request.state} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
