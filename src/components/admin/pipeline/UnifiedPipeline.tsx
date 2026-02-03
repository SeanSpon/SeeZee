"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Phone,
  Mail,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Users,
  Target,
  Zap,
  Activity,
  ChevronRight,
  Edit2,
  Trash2,
  Send,
  FileText,
  ExternalLink,
  RefreshCw,
  Eye,
  GitBranch,
  Rocket,
} from "lucide-react";
import { updateLeadStatus, deleteLead } from "@/server/actions/pipeline";
import { approveLeadAndCreateProject } from "@/server/actions/leads";

// Types
interface Lead {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  status: string;
  source?: string | null;
  message?: string | null;
  notes?: string | null;
  serviceType?: string | null;
  timeline?: string | null;
  budget?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

interface Project {
  id: string;
  name: string;
  status: string;
  organization?: { name: string } | null;
  budget?: number | null;
  createdAt?: Date | string;
}

interface Invoice {
  id: string;
  title?: string;
  number?: string;
  status: string;
  total: string | number;
  organization?: { name: string } | null;
  createdAt?: Date | string;
}

interface UnifiedPipelineProps {
  leads: Lead[];
  projects?: Project[];
  invoices?: Invoice[];
}

// Stage configuration
const LEAD_STAGES = [
  { id: "NEW", label: "New", color: "from-blue-500 to-blue-600", bgColor: "bg-blue-500/5", borderColor: "border-blue-500/20" },
  { id: "CONTACTED", label: "Contacted", color: "from-purple-500 to-purple-600", bgColor: "bg-purple-500/5", borderColor: "border-purple-500/20" },
  { id: "QUALIFIED", label: "Qualified", color: "from-amber-500 to-orange-500", bgColor: "bg-amber-500/5", borderColor: "border-amber-500/20" },
  { id: "PROPOSAL_SENT", label: "Proposal", color: "from-cyan-500 to-teal-500", bgColor: "bg-cyan-500/5", borderColor: "border-cyan-500/20" },
  { id: "CONVERTED", label: "Won", color: "from-emerald-500 to-green-500", bgColor: "bg-emerald-500/5", borderColor: "border-emerald-500/20" },
];

const STATUS_ACTIONS: Record<string, { next: string; label: string; icon: any }> = {
  NEW: { next: "CONTACTED", label: "Mark Contacted", icon: Phone },
  CONTACTED: { next: "QUALIFIED", label: "Qualify Lead", icon: Target },
  QUALIFIED: { next: "PROPOSAL_SENT", label: "Send Proposal", icon: Send },
  PROPOSAL_SENT: { next: "CONVERTED", label: "Convert", icon: CheckCircle },
};

export function UnifiedPipeline({ leads: initialLeads, projects = [], invoices = [] }: UnifiedPipelineProps) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [showFilters, setShowFilters] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [showActivity, setShowActivity] = useState(true);

  // Filter leads based on search and stage
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch = !searchQuery || 
        lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStage = !selectedStage || lead.status === selectedStage;
      
      return matchesSearch && matchesStage;
    });
  }, [leads, searchQuery, selectedStage]);

  // Group leads by stage
  const leadsByStage = useMemo(() => {
    const grouped: Record<string, Lead[]> = {};
    LEAD_STAGES.forEach(stage => {
      grouped[stage.id] = filteredLeads.filter(lead => lead.status === stage.id);
    });
    return grouped;
  }, [filteredLeads]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = leads.length;
    const newLeads = leads.filter(l => l.status === "NEW").length;
    const converted = leads.filter(l => l.status === "CONVERTED").length;
    const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;
    
    // Calculate pipeline value
    const pipelineValue = leads
      .filter(l => l.status !== "CONVERTED" && l.status !== "LOST")
      .reduce((sum, lead) => {
        const budget = lead.budget?.replace(/[^0-9]/g, "") || "0";
        return sum + parseInt(budget, 10);
      }, 0);

    return { total, newLeads, converted, conversionRate, pipelineValue };
  }, [leads]);

  // Handle stage change
  const handleStageChange = async (leadId: string, newStatus: string) => {
    setUpdating(leadId);
    try {
      const result = await updateLeadStatus(leadId, newStatus as any);
      if (result.success) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      }
    } catch (e) {
      console.error("Failed to update lead:", e);
    }
    setUpdating(null);
  };

  // Handle convert to project
  const handleConvert = async (leadId: string) => {
    if (!confirm("Convert this lead to a project?")) return;
    
    setUpdating(leadId);
    try {
      const result = await approveLeadAndCreateProject(leadId);
      if (result.success) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: "CONVERTED" } : l));
        if (result.projectId) {
          router.push(`/admin/projects/${result.projectId}`);
        }
      }
    } catch (e) {
      console.error("Failed to convert lead:", e);
    }
    setUpdating(null);
  };

  // Handle delete
  const handleDelete = async (leadId: string) => {
    if (!confirm("Delete this lead? This cannot be undone.")) return;
    
    setUpdating(leadId);
    try {
      const result = await deleteLead(leadId);
      if (result.success) {
        setLeads(prev => prev.filter(l => l.id !== leadId));
      }
    } catch (e) {
      console.error("Failed to delete lead:", e);
    }
    setUpdating(null);
  };

  // Handle drag and drop
  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    e.dataTransfer.setData("leadId", lead.id);
    e.dataTransfer.setData("currentStatus", lead.status);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    const currentStatus = e.dataTransfer.getData("currentStatus");
    
    if (currentStatus !== newStatus) {
      await handleStageChange(leadId, newStatus);
    }
  };

  const formatTimeAgo = (date: Date | string | undefined) => {
    if (!date) return "";
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-8">
      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard
          icon={Users}
          label="Total Leads"
          value={metrics.total}
          color="text-blue-400"
          bgColor="bg-blue-500/20"
        />
        <MetricCard
          icon={Zap}
          label="New Today"
          value={metrics.newLeads}
          color="text-purple-400"
          bgColor="bg-purple-500/20"
        />
        <MetricCard
          icon={Target}
          label="Conversion"
          value={`${metrics.conversionRate}%`}
          color="text-emerald-400"
          bgColor="bg-emerald-500/20"
        />
        <MetricCard
          icon={CheckCircle}
          label="Converted"
          value={metrics.converted}
          color="text-green-400"
          bgColor="bg-green-500/20"
        />
        <MetricCard
          icon={DollarSign}
          label="Pipeline Value"
          value={`$${(metrics.pipelineValue / 1000).toFixed(0)}k`}
          color="text-amber-400"
          bgColor="bg-amber-500/20"
        />
      </div>

      {/* Search and Actions Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:border-[#ef4444]/50 outline-none"
          />
        </div>

        {/* Stage Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedStage(null)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              !selectedStage
                ? "bg-[#ef4444] text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            All
          </button>
          {LEAD_STAGES.slice(0, -1).map(stage => (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(selectedStage === stage.id ? null : stage.id)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedStage === stage.id
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              {stage.label} ({leadsByStage[stage.id]?.length || 0})
            </button>
          ))}
        </div>

        <Link
          href="/admin/projects/create"
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white text-sm font-medium hover:shadow-lg transition-all lg:ml-auto"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Board */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {LEAD_STAGES.filter(s => s.id !== "CONVERTED" || leadsByStage[s.id]?.length > 0).map((stage) => (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                className="bg-white/5 rounded-xl border border-white/10 p-5 min-h-[600px] transition-all hover:border-white/20"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stage.color}`} />
                    <h3 className="text-sm font-semibold text-white">{stage.label}</h3>
                  </div>
                  <span className="px-2 py-1 rounded-md bg-white/10 text-xs font-semibold text-white">
                    {leadsByStage[stage.id]?.length || 0}
                  </span>
                </div>

                {/* Lead Cards */}
                <div className="space-y-3">
                  {leadsByStage[stage.id]?.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-white/10 p-12 text-center text-sm text-white/30">
                      {stage.id === "NEW" ? "No new leads" : "Drop leads here"}
                    </div>
                  ) : (
                    leadsByStage[stage.id]?.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        stage={stage}
                        isUpdating={updating === lead.id}
                        isExpanded={expandedLead === lead.id}
                        onExpand={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                        onStageChange={handleStageChange}
                        onConvert={handleConvert}
                        onDelete={handleDelete}
                        onDragStart={handleDragStart}
                        formatTimeAgo={formatTimeAgo}
                      />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Sidebar */}
        {showActivity && (
          <div className="hidden xl:block w-80 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="font-semibold text-white">Quick Actions</h3>
              </div>
              <div className="p-4 space-y-2">
                <Link
                  href="/admin/leads"
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Lead Finder</p>
                    <p className="text-xs text-white/50">Find new prospects</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30" />
                </Link>
                <Link
                  href="/admin/marketing"
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Send className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Email Campaign</p>
                    <p className="text-xs text-white/50">Reach out to leads</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30" />
                </Link>
                <Link
                  href="/admin/projects/create"
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Rocket className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Create Project</p>
                    <p className="text-xs text-white/50">From existing lead</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30" />
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="font-semibold text-white">Recent Activity</h3>
              </div>
              <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
                {leads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="px-4 py-3 hover:bg-white/5 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {lead.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{lead.name}</p>
                        <p className="text-xs text-white/50 mt-0.5">
                          {lead.status === "NEW" ? "New lead added" : `Moved to ${lead.status.toLowerCase()}`}
                        </p>
                        <span className="text-xs text-white/30 mt-1 inline-block">
                          {formatTimeAgo(lead.updatedAt || lead.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="font-semibold text-white">AI Insights</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs text-white/90 mb-2">
                    <span className="text-emerald-400 font-bold">↑ 3 leads</span> ready to be contacted
                  </p>
                  <button className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                    Review leads <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs text-white/90 mb-2">
                    <span className="text-amber-400 font-bold">2 proposals</span> pending follow-up
                  </p>
                  <button className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1">
                    View proposals <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-white/50">{label}</p>
        </div>
      </div>
    </div>
  );
}

// Lead Card Component
function LeadCard({
  lead,
  stage,
  isUpdating,
  isExpanded,
  onExpand,
  onStageChange,
  onConvert,
  onDelete,
  onDragStart,
  formatTimeAgo,
}: {
  lead: Lead;
  stage: typeof LEAD_STAGES[0];
  isUpdating: boolean;
  isExpanded: boolean;
  onExpand: () => void;
  onStageChange: (leadId: string, status: string) => void;
  onConvert: (leadId: string) => void;
  onDelete: (leadId: string) => void;
  onDragStart: (e: React.DragEvent, lead: Lead) => void;
  formatTimeAgo: (date: Date | string | undefined) => string;
}) {
  const nextAction = STATUS_ACTIONS[lead.status];

  return (
    <motion.div
      draggable
      onDragStart={(e) => onDragStart(e as any, lead)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`group relative rounded-xl bg-white/5 border border-white/10 p-5 cursor-move transition-all hover:border-white/20 hover:bg-white/10 ${
        isUpdating ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{lead.name}</p>
          {lead.company && (
            <p className="text-sm text-white/50 truncate flex items-center gap-2 mt-1">
              <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{lead.company}</span>
            </p>
          )}
        </div>
        <button
          onClick={onExpand}
          className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all flex-shrink-0"
        >
          <MoreHorizontal className="w-4 h-4 text-white/50" />
        </button>
      </div>

      {/* Quick Info */}
      <div className="space-y-2 mb-4">
        {lead.email && (
          <p className="text-sm text-white/50 truncate flex items-center gap-2">
            <Mail className="w-4 h-4 flex-shrink-0 text-blue-400" />
            <span className="truncate">{lead.email}</span>
          </p>
        )}
        {lead.phone && (
          <p className="text-sm text-white/50 truncate flex items-center gap-2">
            <Phone className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span className="truncate">{lead.phone}</span>
          </p>
        )}
      </div>

      {/* Tags */}
      {(lead.budget || lead.timeline || lead.serviceType) && (
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-white/10">
          {lead.budget && (
            <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-xs font-medium text-emerald-400">
              {lead.budget}
            </span>
          )}
          {lead.timeline && (
            <span className="px-2 py-1 rounded-md bg-blue-500/20 text-xs font-medium text-blue-400">
              {lead.timeline}
            </span>
          )}
          {lead.serviceType && (
            <span className="px-2 py-1 rounded-md bg-purple-500/20 text-xs font-medium text-purple-400">
              {lead.serviceType}
            </span>
          )}
        </div>
      )}

      {/* Quick Action Button */}
      {nextAction && lead.status !== "CONVERTED" && (
        <button
          onClick={() => onStageChange(lead.id, nextAction.next)}
          disabled={isUpdating}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r ${stage.color} text-white text-sm font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isUpdating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <nextAction.icon className="w-4 h-4" />
          )}
          {nextAction.label}
        </button>
      )}

      {lead.status === "PROPOSAL_SENT" && (
        <button
          onClick={() => onConvert(lead.id)}
          disabled={isUpdating}
          className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Rocket className="w-4 h-4" />
          )}
          Create Project
        </button>
      )}

      {/* Expanded Actions */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-white/10 space-y-2"
          >
            {/* Quick Contact */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              {lead.email && (
                <a
                  href={`mailto:${lead.email}?subject=Following up on your inquiry&body=Hi ${lead.name},%0D%0A%0D%0AThank you for reaching out to SeeZee Studios.%0D%0A%0D%0A`}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-sm font-medium text-blue-400 transition-all"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </a>
              )}
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-sm font-medium text-emerald-400 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  Call
                </a>
              )}
            </div>
            
            <Link
              href={`/admin/pipeline/leads/${lead.id}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm font-medium text-white/70 hover:text-white transition-all"
            >
              <Eye className="w-4 h-4" />
              View Details
            </Link>
            <Link
              href={`/admin/marketing?email=${encodeURIComponent(lead.email || "")}&name=${encodeURIComponent(lead.name)}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm font-medium text-white/70 hover:text-white transition-all"
            >
              <Send className="w-4 h-4" />
              Add to Campaign
            </Link>
            <button
              onClick={() => onDelete(lead.id)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 text-sm font-medium text-red-400 hover:text-red-300 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete Lead
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time indicator */}
      <div className="absolute top-4 right-4 px-2 py-1 rounded-md bg-black/50 text-xs text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
        {formatTimeAgo(lead.createdAt)}
      </div>
    </motion.div>
  );
}

export default UnifiedPipeline;
