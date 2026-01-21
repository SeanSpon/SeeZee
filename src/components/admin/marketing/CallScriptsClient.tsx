"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Phone,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Printer,
  Search,
  Star,
  MapPin,
} from "lucide-react";

interface Prospect {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  category: string | null;
  city: string | null;
  state: string | null;
  websiteUrl: string | null;
  leadScore: number;
  callScript: string | null;
  googleRating: number | null;
  googleReviews: number | null;
}

interface Props {
  initialProspects: Prospect[];
}

export function CallScriptsClient({ initialProspects }: Props) {
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProspects = prospects.filter((p) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.company?.toLowerCase().includes(query) ||
      p.email.toLowerCase().includes(query)
    );
  });

  const handleGenerate = async (prospectId: string) => {
    setGenerating(prospectId);
    try {
      const res = await fetch(`/api/prospects/${prospectId}/generate-call-script`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate script");
      }

      // Update prospect with new script
      setProspects(
        prospects.map((p) =>
          p.id === prospectId ? { ...p, callScript: data.script } : p
        )
      );

      // Select the prospect to show the script
      const prospect = prospects.find((p) => p.id === prospectId);
      if (prospect) {
        setSelectedProspect({ ...prospect, callScript: data.script });
      }

      alert("Call script generated successfully!");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setGenerating(null);
    }
  };

  const handleCopy = () => {
    if (selectedProspect?.callScript) {
      navigator.clipboard.writeText(selectedProspect.callScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (selectedProspect?.callScript) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Call Script - ${selectedProspect.company || selectedProspect.name}</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  padding: 20px;
                  line-height: 1.6;
                }
                h1 { color: #333; }
                pre { white-space: pre-wrap; font-family: inherit; }
              </style>
            </head>
            <body>
              <h1>Call Script: ${selectedProspect.company || selectedProspect.name}</h1>
              <p><strong>Contact:</strong> ${selectedProspect.name}</p>
              <p><strong>Phone:</strong> ${selectedProspect.phone || "N/A"}</p>
              <p><strong>Lead Score:</strong> ${selectedProspect.leadScore}/100</p>
              <hr>
              <pre>${selectedProspect.callScript}</pre>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const stats = {
    total: prospects.length,
    withScripts: prospects.filter((p) => p.callScript).length,
    hot: prospects.filter((p) => p.leadScore >= 80).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/marketing"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Phone className="w-8 h-8 text-green-400" />
              Cold Call Scripts
            </h1>
            <p className="text-slate-400 mt-1">
              AI-generated call scripts for your prospects
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/50 border border-white/10 rounded-xl">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-sm text-slate-400">Total Prospects</p>
        </div>
        <div className="p-4 bg-slate-900/50 border border-white/10 rounded-xl">
          <p className="text-2xl font-bold text-green-400">{stats.withScripts}</p>
          <p className="text-sm text-slate-400">With Scripts</p>
        </div>
        <div className="p-4 bg-slate-900/50 border border-white/10 rounded-xl">
          <p className="text-2xl font-bold text-red-400">{stats.hot}</p>
          <p className="text-sm text-slate-400">Hot Leads</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search prospects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prospects List */}
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            Select a Prospect
          </h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredProspects.map((prospect) => (
              <button
                key={prospect.id}
                onClick={() => setSelectedProspect(prospect)}
                className={`w-full p-3 rounded-lg border transition-colors text-left ${
                  selectedProspect?.id === prospect.id
                    ? "border-green-500 bg-green-500/10"
                    : "border-white/10 hover:border-white/20 bg-slate-800"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {prospect.company || prospect.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      {prospect.city && prospect.state && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {prospect.city}, {prospect.state}
                        </span>
                      )}
                      {prospect.googleRating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          {prospect.googleRating}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        prospect.leadScore >= 80
                          ? "bg-red-500/20 text-red-400"
                          : prospect.leadScore >= 60
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-slate-500/20 text-slate-400"
                      }`}
                    >
                      {prospect.leadScore}
                    </span>
                    {prospect.callScript && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        Has Script
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
            {filteredProspects.length === 0 && (
              <p className="text-center text-slate-500 py-8">
                No prospects found
              </p>
            )}
          </div>
        </div>

        {/* Script Display */}
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
          {selectedProspect ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {selectedProspect.company || selectedProspect.name}
                </h3>
                <div className="flex items-center gap-2">
                  {selectedProspect.callScript && (
                    <>
                      <button
                        onClick={handleCopy}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Copy script"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                      <button
                        onClick={handlePrint}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Print script"
                      >
                        <Printer className="w-4 h-4 text-slate-400" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleGenerate(selectedProspect.id)}
                    disabled={generating === selectedProspect.id}
                    className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-medium text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {generating === selectedProspect.id ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {selectedProspect.callScript ? "Regenerate" : "Generate"}
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-3 p-3 bg-slate-800 rounded-lg text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400">Contact:</span>
                    <span className="text-white ml-2">{selectedProspect.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Phone:</span>
                    <span className="text-white ml-2">
                      {selectedProspect.phone || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Email:</span>
                    <span className="text-white ml-2">{selectedProspect.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Score:</span>
                    <span className="text-white ml-2">
                      {selectedProspect.leadScore}/100
                    </span>
                  </div>
                </div>
              </div>

              {selectedProspect.callScript ? (
                <div className="p-4 bg-white rounded-lg text-slate-900 max-h-[500px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {selectedProspect.callScript}
                  </pre>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Phone className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">
                    No call script generated yet
                  </p>
                  <button
                    onClick={() => handleGenerate(selectedProspect.id)}
                    disabled={generating === selectedProspect.id}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-medium flex items-center gap-2 mx-auto"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate Script
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-slate-500">
                <Phone className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select a prospect to view or generate a call script</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-3">
          How AI Call Scripts Work
        </h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li>• Claude AI analyzes the prospect's information and opportunities</li>
          <li>• Generates personalized scripts tailored to their specific situation</li>
          <li>• Includes opening, pain point discussion, value prop, and objection handling</li>
          <li>• Natural, conversational tone - not robotic or salesy</li>
          <li>• Can regenerate multiple times to get different approaches</li>
        </ul>
      </div>
    </div>
  );
}
