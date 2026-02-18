"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  Users,
  Building2,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Target,
  Zap,
  FileText,
  Globe,
  Loader2,
  X,
} from "lucide-react";
import { ProjectCreationWizard } from "@/components/admin/projects/ProjectCreationWizard";

interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  message?: string | null;
  budget?: string | null;
  timeline?: string | null;
  serviceType?: string | null;
  status: string;
  createdAt: string;
  requirements?: any;
  metadata?: any;
  organization?: {
    id: string;
    name: string;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  NEW: { label: "New", color: "text-blue-400", bg: "bg-blue-500/20" },
  CONTACTED: { label: "Contacted", color: "text-amber-400", bg: "bg-amber-500/20" },
  QUALIFIED: { label: "Qualified", color: "text-emerald-400", bg: "bg-emerald-500/20" },
  PROPOSAL_SENT: { label: "Proposal Sent", color: "text-purple-400", bg: "bg-purple-500/20" },
  CONVERTED: { label: "Converted", color: "text-slate-400", bg: "bg-slate-500/20" },
  LOST: { label: "Lost", color: "text-red-400", bg: "bg-red-500/20" },
};

const SERVICE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  WEBSITE: { label: "Website", icon: Globe, color: "text-cyan-400" },
  WEB_APP: { label: "Web App", icon: Zap, color: "text-purple-400" },
  ECOMMERCE: { label: "E-commerce", icon: DollarSign, color: "text-emerald-400" },
  MOBILE: { label: "Mobile", icon: FileText, color: "text-blue-400" },
  BRANDING: { label: "Branding", icon: Target, color: "text-pink-400" },
  AI_DATA: { label: "AI/Data", icon: Sparkles, color: "text-amber-400" },
  OTHER: { label: "Other", icon: FileText, color: "text-slate-400" },
};

export default function CreateProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadIdFromUrl = searchParams.get("leadId");

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Fetch leads
  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch("/api/leads");
        if (res.ok) {
          const data = await res.json();
          // Filter out already converted leads
          const availableLeads = (data.leads || []).filter(
            (lead: Lead) => lead.status !== "CONVERTED"
          );
          setLeads(availableLeads);

          // If leadId is in URL, select that lead
          if (leadIdFromUrl) {
            const lead = (data.leads || []).find((l: Lead) => l.id === leadIdFromUrl);
            if (lead && lead.status !== "CONVERTED") {
              setSelectedLead(lead);
              setShowWizard(true);
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch leads:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, [leadIdFromUrl]);

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      searchQuery === "" ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" || lead.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Group leads by status
  const groupedLeads = filteredLeads.reduce((acc, lead) => {
    const status = lead.status || "NEW";
    if (!acc[status]) acc[status] = [];
    acc[status].push(lead);
    return acc;
  }, {} as Record<string, Lead[]>);

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowWizard(true);
  };

  const handleWizardSuccess = (projectId: string) => {
    router.push(`/admin/projects/${projectId}`);
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
    setSelectedLead(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-3">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Projects
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-seezee-red glow-on-hover inline-block mb-2">
              Project Setup
            </span>
            <h1 className="text-4xl font-heading font-bold gradient-text">
              Create Project from Lead
            </h1>
          </div>
        </div>
        <p className="max-w-2xl text-base text-slate-400 leading-relaxed">
          Select a qualified lead to convert into a full project with auto-generated milestones, 
          timeline, and Git/Vercel integrations.
        </p>
      </header>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads by name, email, or company..."
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#ef4444]/50 focus:ring-1 focus:ring-[#ef4444]/50 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              filterStatus === "all"
                ? "bg-[#ef4444] text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            All ({leads.length})
          </button>
          {Object.entries(STATUS_CONFIG)
            .filter(([key]) => key !== "CONVERTED")
            .map(([key, config]) => {
              const count = leads.filter((l) => l.status === key).length;
              if (count === 0) return null;
              return (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    filterStatus === key
                      ? `${config.bg} ${config.color}`
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {config.label} ({count})
                </button>
              );
            })}
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white/40" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Leads Found</h3>
          <p className="text-white/50 text-sm max-w-md mx-auto">
            {searchQuery
              ? "No leads match your search criteria."
              : "All leads have been converted to projects or there are no leads yet."}
          </p>
          <Link
            href="/admin/pipeline"
            className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-[#ef4444] hover:bg-[#dc2626] text-white text-sm font-semibold rounded-xl transition-all"
          >
            View All Leads
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Priority Section: Qualified Leads */}
          {groupedLeads["QUALIFIED"] && groupedLeads["QUALIFIED"].length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Ready to Convert ({groupedLeads["QUALIFIED"].length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupedLeads["QUALIFIED"].map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onSelect={() => handleSelectLead(lead)}
                    priority
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Leads */}
          {Object.entries(groupedLeads)
            .filter(([status]) => status !== "QUALIFIED" && status !== "CONVERTED")
            .map(([status, statusLeads]) => (
              <div key={status}>
                <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {STATUS_CONFIG[status]?.label || status} ({statusLeads.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {statusLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onSelect={() => handleSelectLead(lead)}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Project Creation Wizard */}
      <AnimatePresence>
        {showWizard && selectedLead && (
          <ProjectCreationWizard
            lead={selectedLead}
            onSuccess={handleWizardSuccess}
            onCancel={handleWizardCancel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Lead Card Component
function LeadCard({
  lead,
  onSelect,
  priority = false,
}: {
  lead: Lead;
  onSelect: () => void;
  priority?: boolean;
}) {
  const statusConfig = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;
  const serviceConfig = lead.serviceType
    ? SERVICE_CONFIG[lead.serviceType] || SERVICE_CONFIG.OTHER
    : null;
  const ServiceIcon = serviceConfig?.icon || FileText;

  return (
    <motion.button
      onClick={onSelect}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full text-left p-4 rounded-xl border transition-all group ${
        priority
          ? "bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/30 hover:border-emerald-500/50"
          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${priority ? "bg-emerald-500/20" : "bg-white/10"} flex items-center justify-center`}>
            <Building2 className={`w-5 h-5 ${priority ? "text-emerald-400" : "text-white/60"}`} />
          </div>
          <div>
            <h3 className="font-semibold text-white group-hover:text-[#ef4444] transition-colors">
              {lead.company || lead.name}
            </h3>
            <p className="text-xs text-white/50">{lead.name}</p>
          </div>
        </div>
        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Mail className="w-3.5 h-3.5" />
          <span className="truncate">{lead.email}</span>
        </div>
        {lead.phone && (
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Phone className="w-3.5 h-3.5" />
            <span>{lead.phone}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {serviceConfig && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-white/10 rounded-full ${serviceConfig.color}`}>
            <ServiceIcon className="w-3 h-3" />
            {serviceConfig.label}
          </span>
        )}
        {lead.budget && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-white/10 text-white/60 rounded-full">
            <DollarSign className="w-3 h-3" />
            {lead.budget}
          </span>
        )}
        {lead.timeline && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-white/10 text-white/60 rounded-full">
            <Calendar className="w-3 h-3" />
            {lead.timeline}
          </span>
        )}
      </div>

      {lead.message && (
        <p className="mt-3 text-xs text-white/40 line-clamp-2">
          {lead.message}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[10px] text-white/30">
          {new Date(lead.createdAt).toLocaleDateString()}
        </span>
        <span className="text-xs text-[#ef4444] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          Create Project
          <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </motion.button>
  );
}
