'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Trash2,
  Archive,
  Tag,
  Mail,
  CheckSquare,
  MoreVertical,
  X,
  Plus,
} from 'lucide-react';
import {
  getProspectsAction,
  bulkDeleteProspectsAction,
  bulkArchiveProspectsAction,
  bulkUpdateStatusAction,
  bulkAddTagsAction,
  exportProspectsAction,
  sendBulkEmailsAction,
} from '@/server/actions/outreach';
import { Prospect, ProspectStatus } from '@prisma/client';
import { ProspectFilters } from '@/lib/outreach/bulk-operations';

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<ProspectFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showBulkMenu, setShowBulkMenu] = useState(false);

  useEffect(() => {
    loadProspects();
  }, [filters, page]);

  async function loadProspects() {
    setLoading(true);
    const result = await getProspectsAction({
      filters: { ...filters, search: searchTerm },
      page,
      pageSize: 50,
    });

    if (result.success) {
      setProspects(result.prospects);
      setTotalPages(result.pages);
    }
    setLoading(false);
  }

  function handleSelectAll() {
    if (selectedIds.size === prospects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(prospects.map(p => p.id)));
    }
  }

  function toggleSelect(id: string) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  }

  async function handleBulkDelete() {
    if (!confirm(`Delete ${selectedIds.size} prospects? This cannot be undone.`)) return;

    const result = await bulkDeleteProspectsAction(Array.from(selectedIds));
    if (result.success) {
      alert(result.message);
      setSelectedIds(new Set());
      loadProspects();
    }
  }

  async function handleBulkArchive() {
    const result = await bulkArchiveProspectsAction(Array.from(selectedIds));
    if (result.success) {
      alert(result.message);
      setSelectedIds(new Set());
      loadProspects();
    }
  }

  async function handleBulkEmail() {
    if (!confirm(`Send AI-generated emails to ${selectedIds.size} prospects?`)) return;

    const result = await sendBulkEmailsAction({
      prospectIds: Array.from(selectedIds),
      useAI: true,
      aiParams: {
        includeWebsiteAudit: true,
        includePortfolio: true,
      },
    });

    if (result.success) {
      alert(`Successfully sent ${result.sent} emails, ${result.failed} failed`);
      setSelectedIds(new Set());
      loadProspects();
    }
  }

  async function handleExport() {
    const result = await exportProspectsAction(Array.from(selectedIds));
    if (result.success && result.csv) {
      const blob = new Blob([result.csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prospects-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-cyan-400" />
            Prospect Management
          </h1>
          <p className="text-slate-400 mt-1">
            {prospects.length} prospects
            {selectedIds.size > 0 && ` • ${selectedIds.size} selected`}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search prospects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadProspects()}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white hover:border-cyan-500 transition-colors flex items-center gap-2"
        >
          <Filter className="w-5 h-5" />
          Filters
        </button>
        <button
          onClick={loadProspects}
          className="px-4 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Lead Score</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.leadScoreMin || ''}
                  onChange={(e) => setFilters({ ...filters, leadScoreMin: parseInt(e.target.value) || undefined })}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.leadScoreMax || ''}
                  onChange={(e) => setFilters({ ...filters, leadScoreMax: parseInt(e.target.value) || undefined })}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Status</label>
              <select
                value={filters.status?.[0] || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value ? [e.target.value as ProspectStatus] : undefined })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white"
              >
                <option value="">All Statuses</option>
                <option value="PROSPECT">Prospect</option>
                <option value="REVIEWING">Reviewing</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="CONTACTED">Contacted</option>
                <option value="RESPONDED">Responded</option>
                <option value="CONVERTED">Converted</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Has Website</label>
              <select
                value={filters.hasWebsite === undefined ? '' : filters.hasWebsite ? 'yes' : 'no'}
                onChange={(e) => setFilters({ ...filters, hasWebsite: e.target.value === '' ? undefined : e.target.value === 'yes' })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white"
              >
                <option value="">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              setFilters({});
              setSearchTerm('');
            }}
            className="text-cyan-400 hover:text-cyan-300 text-sm"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg flex items-center justify-between">
          <div className="text-white font-medium">
            {selectedIds.size} prospect{selectedIds.size !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBulkEmail}
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Send AI Emails
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleBulkArchive}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
            >
              <Archive className="w-4 h-4" />
              Archive
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Prospects Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === prospects.length && prospects.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Name/Company</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Location</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Score</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Loading prospects...
                  </td>
                </tr>
              ) : prospects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No prospects found. Try discovering some!
                  </td>
                </tr>
              ) : (
                prospects.map((prospect) => (
                  <tr key={prospect.id} className="border-b border-slate-800 hover:bg-slate-900/50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(prospect.id)}
                        onChange={() => toggleSelect(prospect.id)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white font-medium">{prospect.name}</div>
                      <div className="text-slate-400 text-sm">{prospect.company || prospect.category}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-300 text-sm">
                        {[prospect.city, prospect.state].filter(Boolean).join(', ')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="text-white font-medium">{prospect.leadScore}</div>
                        <div className={`w-16 h-2 bg-slate-700 rounded-full overflow-hidden`}>
                          <div
                            className={`h-full ${
                              prospect.leadScore >= 80 ? 'bg-green-500' :
                              prospect.leadScore >= 60 ? 'bg-cyan-500' :
                              prospect.leadScore >= 40 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${prospect.leadScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(prospect.status)}`}>
                        {formatStatus(prospect.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-300 text-sm">{prospect.email || 'No email'}</div>
                      <div className="text-slate-500 text-xs">{prospect.phone || ''}</div>
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-2 hover:bg-slate-700 rounded transition-colors">
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function getStatusBadgeColor(status: ProspectStatus): string {
  const colors: Record<ProspectStatus, string> = {
    PROSPECT: 'bg-slate-500/20 text-slate-300',
    REVIEWING: 'bg-blue-500/20 text-blue-300',
    QUALIFIED: 'bg-cyan-500/20 text-cyan-300',
    DRAFT_READY: 'bg-purple-500/20 text-purple-300',
    CONTACTED: 'bg-indigo-500/20 text-indigo-300',
    RESPONDED: 'bg-green-500/20 text-green-300',
    MEETING: 'bg-yellow-500/20 text-yellow-300',
    PROPOSAL: 'bg-orange-500/20 text-orange-300',
    NEGOTIATING: 'bg-amber-500/20 text-amber-300',
    CONVERTED: 'bg-emerald-500/20 text-emerald-300',
    LOST: 'bg-red-500/20 text-red-300',
    ARCHIVED: 'bg-gray-500/20 text-gray-300',
  };
  return colors[status] || 'bg-slate-500/20 text-slate-300';
}

function formatStatus(status: string): string {
  return status.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
}
