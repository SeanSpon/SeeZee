"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function ClientRequestsPage() {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to create request
    console.log({ title, details });
    setTitle("");
    setDetails("");
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Change Requests</h2>
        <p className="text-slate-400 mt-1">
          Submit requests for changes or new features
        </p>
      </div>

      {/* Submit Request Form */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">New Request</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Request Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of your request"
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Details
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide detailed information about your request"
              rows={6}
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Submit Request
          </button>
        </form>
      </div>

      {/* Past Requests */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Previous Requests</h3>
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
          <p className="text-slate-400">No previous requests</p>
        </div>
      </div>
    </div>
  );
}
