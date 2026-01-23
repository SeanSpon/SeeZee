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
  { id: "NEW", label: "New", color: "from-blue-500 to-blue-600", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30" },
  { id: "CONTACTED", label: "Contacted", color: "from-purple-500 to-purple-600", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/30" },
  { id: "QUALIFIED", label: "Qualified", color: "from-amber-500 to-orange-500", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/30" },
  { id: "PROPOSAL_SENT", label: "Proposal", color: "from-cyan-500 to-teal-500", bgColor: "bg-cyan-500/10", borderColor: "border-cyan-500/30" },
  { id: "CONVERTED", label: "Won", color: "from-emerald-500 to-green-500", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/30" },
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
    <div className="space-y-6">
      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard
          icon={Users}
          label="Total Leads"
          value={metrics.total}
          color="text-blue-400"
          bgColor="bg-blue-500/10"
        />
        <MetricCard
          icon={Zap}
          label="New Today"
          value={metrics.newLeads}
          color="text-purple-400"
          bgColor="bg-purple-500/10"
        />
        <MetricCard
          icon={Target}
          label="Conversion"
          value={`${metrics.conversionRate}%`}
          color="text-emerald-400"
          bgColor="bg-emerald-500/10"
        />
        <MetricCard
          icon={CheckCircle}
          label="Converted"
          value={metrics.converted}
          color="text-green-400"
          bgColor="bg-green-500/10"
        />
        <MetricCard
          icon={DollarSign}
          label="Pipeline Value"
          value={`$${(metrics.pipelineValue / 1000).toFixed(0)}k`}
          color="text-amber-400"
          bgColor="bg-amber-500/10"
        />
      </div>

      {/* Search and Actions Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:border-[#ef4444]/50 focus:outline-none transition-colors"
          />
        </div>

        {/* Stage Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedStage(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              !selectedStage
                ? "bg-white/20 text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            All
          </button>
          {LEAD_STAGES.slice(0, -1).map(stage => (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(selectedStage === stage.id ? null : stage.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedStage === stage.id
                  ? `${stage.bgColor} ${stage.borderColor} border text-white`
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {stage.label} ({leadsByStage[stage.id]?.length || 0})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Link
            href="/admin/projects/create"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white text-sm font-medium hover:shadow-lg hover:shadow-[#ef4444]/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Board */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {LEAD_STAGES.filter(s => s.id !== "CONVERTED" || leadsByStage[s.id]?.length > 0).map((stage) => (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`rounded-2xl p-4 ${stage.bgColor} border ${stage.borderColor} transition-all min-h-[400px]`}
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stage.color}`} />
                    <h3 className="text-sm font-semibold text-white">{stage.label}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-medium text-white/70">
                    {leadsByStage[stage.id]?.length || 0}
                  </span>
                </div>

                {/* Lead Cards */}
                <div className="space-y-3">
                  {leadsByStage[stage.id]?.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-white/40">
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
          <div className="hidden xl:block w-80 space-y-4">
            {/* Quick Actions */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  href="/admin/leads"
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white group-hover:text-[#ef4444] transition-colors">Lead Finder</p>
                    <p className="text-xs text-white/40">Find new prospects</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40" />
                </Link>
                <Link
                  href="/admin/marketing"
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Send className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white group-hover:text-[#ef4444] transition-colors">Email Campaign</p>
                    <p className="text-xs text-white/40">Reach out to leads</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40" />
                </Link>
                <Link
                  href="/admin/projects/create"
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Rocket className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white group-hover:text-[#ef4444] transition-colors">Create Project</p>
                    <p className="text-xs text-white/40">From existing lead</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40" />
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {leads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-white/60">
                        {lead.name?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">{lead.name}</p>
                      <p className="text-[10px] text-white/40">
                        {lead.status === "NEW" ? "New lead added" : `Moved to ${lead.status.toLowerCase()}`}
                      </p>
                    </div>
                    <span className="text-[10px] text-white/30 flex-shrink-0">
                      {formatTimeAgo(lead.updatedAt || lead.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20 p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                AI Insights
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-white/80 mb-2">
                    <span className="text-emerald-400">↑ 3 leads</span> ready to be contacted
                  </p>
                  <button className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    Review leads <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-white/80 mb-2">
                    <span className="text-amber-400">2 proposals</span> pending follow-up
                  </p>
                  <button className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1">
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
          <p className="text-xl font-bold text-white">{value}</p>
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
      className={`group relative rounded-xl bg-[#0f172a]/80 border border-white/10 p-3 cursor-move transition-all hover:border-white/20 ${
        isUpdating ? "opacity-50" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-white truncate">{lead.name}</p>
          {lead.company && (
            <p className="text-xs text-white/50 truncate flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3" />
              {lead.company}
            </p>
          )}
        </div>
        <button
          onClick={onExpand}
          className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
        >
          <MoreHorizontal className="w-4 h-4 text-white/40" />
        </button>
      </div>

      {/* Quick Info */}
      <div className="space-y-1 mb-3">
        {lead.email && (
          <p className="text-xs text-white/40 truncate flex items-center gap-1.5">
            <Mail className="w-3 h-3" />
            {lead.email}
          </p>
        )}
        {lead.phone && (
          <p className="text-xs text-white/40 truncate flex items-center gap-1.5">
            <Phone className="w-3 h-3" />
            {lead.phone}
          </p>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {lead.budget && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-medium text-emerald-400">
            {lead.budget}
          </span>
        )}
        {lead.timeline && (
          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-[10px] font-medium text-blue-400">
            {lead.timeline}
          </span>
        )}
        {lead.serviceType && (
          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-[10px] font-medium text-purple-400">
            {lead.serviceType}
          </span>
        )}
      </div>

      {/* Quick Action Button */}
      {nextAction && lead.status !== "CONVERTED" && (
        <button
          onClick={() => onStageChange(lead.id, nextAction.next)}
          disabled={isUpdating}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r ${stage.color} text-white text-xs font-medium transition-all hover:shadow-lg disabled:opacity-50`}
        >
          <nextAction.icon className="w-3.5 h-3.5" />
          {nextAction.label}
        </button>
      )}

      {lead.status === "PROPOSAL_SENT" && (
        <button
          onClick={() => onConvert(lead.id)}
          disabled={isUpdating}
          className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-medium transition-all hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50"
        >
          <Rocket className="w-3.5 h-3.5" />
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
            className="mt-3 pt-3 border-t border-white/10 space-y-2"
          >
            <Link
              href={`/admin/pipeline/leads/${lead.id}`}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 text-xs text-white/70 hover:text-white transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              View Details
            </Link>
            <button
              onClick={() => onDelete(lead.id)}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-red-500/10 text-xs text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Lead
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time indicator */}
      <div className="absolute top-2 right-2 text-[10px] text-white/30 opacity-0 group-hover:opacity-100 transition-opacity">
        {formatTimeAgo(lead.createdAt)}
      </div>
    </motion.div>
  );
}

export default UnifiedPipeline;
