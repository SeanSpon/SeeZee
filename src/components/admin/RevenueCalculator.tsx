'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, Briefcase, Save, Download, Plus, Trash2 } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface AdminShare {
  userId: string;
  name: string;
  amount: number;
  percentage: number;
  hours?: number;
  hourlyRate?: number;
  tasks?: string;
}

interface ExistingSplit {
  id: string;
  totalAmount: number;
  businessShare: number;
  adminShares: AdminShare[];
  notes: string;
}

interface Project {
  id: string;
  name: string;
  budget: number;
  organizationName: string;
  existingSplit: ExistingSplit | null;
}

interface RevenueCalculatorProps {
  projects: Project[];
  teamMembers: TeamMember[];
}

export function RevenueCalculator({ projects, teamMembers }: RevenueCalculatorProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [businessSharePercent, setBusinessSharePercent] = useState<number>(30);
  const [adminShares, setAdminShares] = useState<AdminShare[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Load existing split or initialize with project budget
  useEffect(() => {
    if (selectedProject) {
      if (selectedProject.existingSplit) {
        const split = selectedProject.existingSplit;
        setTotalAmount(split.totalAmount);
        setBusinessSharePercent((split.businessShare / split.totalAmount) * 100);
        setAdminShares(split.adminShares);
        setNotes(split.notes);
      } else {
        setTotalAmount(selectedProject.budget);
        setBusinessSharePercent(30);
        setAdminShares([]);
        setNotes('');
      }
    }
  }, [selectedProject]);

  const businessShare = (totalAmount * businessSharePercent) / 100;
  const remainingForTeam = totalAmount - businessShare;
  const allocatedToTeam = adminShares.reduce((sum, share) => sum + share.amount, 0);
  const unallocated = remainingForTeam - allocatedToTeam;

  const addAdminShare = () => {
    setAdminShares([
      ...adminShares,
      {
        userId: '',
        name: '',
        amount: 0,
        percentage: 0,
        hours: 0,
        hourlyRate: 50,
        tasks: '',
      },
    ]);
  };

  const removeAdminShare = (index: number) => {
    setAdminShares(adminShares.filter((_, i) => i !== index));
  };

  const updateAdminShare = (index: number, field: keyof AdminShare, value: any) => {
    const newShares = [...adminShares];
    newShares[index] = { ...newShares[index], [field]: value };

    // If userId changed, update name
    if (field === 'userId') {
      const member = teamMembers.find((m) => m.id === value);
      if (member) {
        newShares[index].name = member.name || member.email;
      }
    }

    // Auto-calculate amount from hours * rate
    if (field === 'hours' || field === 'hourlyRate') {
      const hours = field === 'hours' ? value : newShares[index].hours || 0;
      const rate = field === 'hourlyRate' ? value : newShares[index].hourlyRate || 0;
      newShares[index].amount = hours * rate;
    }

    // Calculate percentage
    newShares[index].percentage = remainingForTeam > 0 ? (newShares[index].amount / remainingForTeam) * 100 : 0;

    setAdminShares(newShares);
  };

  const handleSave = async () => {
    if (!selectedProject) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/revenue-splits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProject.id,
          totalAmount,
          businessShare,
          adminShares,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save revenue split');
      }

      alert('Revenue split saved successfully!');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save revenue split. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const exportToCSV = () => {
    if (!selectedProject) return;

    const rows = [
      ['Project', selectedProject.name],
      ['Organization', selectedProject.organizationName],
      ['Total Amount', `$${totalAmount.toFixed(2)}`],
      [''],
      ['Category', 'Name', 'Amount', 'Percentage', 'Hours', 'Rate', 'Tasks'],
      ['Business', '', `$${businessShare.toFixed(2)}`, `${businessSharePercent.toFixed(2)}%`, '', '', ''],
      ...adminShares.map((share) => [
        'Team Member',
        share.name,
        `$${share.amount.toFixed(2)}`,
        `${share.percentage.toFixed(2)}%`,
        share.hours?.toString() || '',
        share.hourlyRate ? `$${share.hourlyRate}` : '',
        share.tasks || '',
      ]),
      [''],
      ['Unallocated', '', `$${unallocated.toFixed(2)}`, '', '', '', ''],
    ];

    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-split-${selectedProject.name.replace(/\s+/g, '-').toLowerCase()}.csv`;
    a.click();
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
        <p className="text-white/60">Create a project to start calculating revenue splits.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Selector */}
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
        <label htmlFor="project-select" className="block text-white font-medium mb-2">
          Select Project
        </label>
        <select
          id="project-select"
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name} - {project.organizationName} (${project.budget.toFixed(2)})
            </option>
          ))}
        </select>
      </div>

      {selectedProject && (
        <>
          {/* Total Amount */}
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-blue-400" />
              Total Project Amount
            </h3>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          {/* Business Share */}
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-blue-400" />
              Business Overhead
            </h3>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-white/80 mb-2">Percentage (%)</label>
                <input
                  type="number"
                  value={businessSharePercent}
                  onChange={(e) => setBusinessSharePercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>
              <div className="flex-1">
                <label className="block text-white/80 mb-2">Amount ($)</label>
                <div className="px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white text-lg font-semibold">
                  ${businessShare.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Team Allocation */}
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-400" />
                Team Member Allocation
              </h3>
              <button
                onClick={addAdminShare}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Member
              </button>
            </div>

            <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="text-white/80 text-sm">
                Available for Team: <span className="font-bold text-white">${remainingForTeam.toFixed(2)}</span>
              </div>
              <div className="text-white/80 text-sm">
                Allocated: <span className="font-bold text-white">${allocatedToTeam.toFixed(2)}</span>
              </div>
              <div className={`text-sm font-semibold ${unallocated >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                Unallocated: ${unallocated.toFixed(2)}
              </div>
            </div>

            {adminShares.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <Users className="w-12 h-12 mx-auto mb-2 text-white/20" />
                <p>No team members allocated yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {adminShares.map((share, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800 border border-white/10 rounded-lg p-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                      <div className="lg:col-span-2">
                        <label className="block text-white/80 text-sm mb-2">Team Member</label>
                        <select
                          value={share.userId}
                          onChange={(e) => updateAdminShare(index, 'userId', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select member...</option>
                          {teamMembers.map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.name || member.email} ({member.role})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-white/80 text-sm mb-2">Hours</label>
                        <input
                          type="number"
                          value={share.hours || ''}
                          onChange={(e) => updateAdminShare(index, 'hours', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-white/80 text-sm mb-2">Rate ($/hr)</label>
                        <input
                          type="number"
                          value={share.hourlyRate || ''}
                          onChange={(e) => updateAdminShare(index, 'hourlyRate', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-white/80 text-sm mb-2">Amount ($)</label>
                        <div className="px-3 py-2 bg-slate-700/50 border border-white/10 rounded text-white text-sm font-semibold">
                          ${share.amount.toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={() => removeAdminShare(index)}
                          className="w-full px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded flex items-center justify-center gap-2 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-white/80 text-sm mb-2">Tasks / Notes</label>
                      <input
                        type="text"
                        value={share.tasks || ''}
                        onChange={(e) => updateAdminShare(index, 'tasks', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe tasks or role..."
                      />
                    </div>

                    <div className="mt-2 text-xs text-white/60">
                      {share.percentage.toFixed(2)}% of team allocation
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
            <label htmlFor="notes" className="block text-white font-medium mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Add any notes about this revenue split..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving || unallocated < 0}
              className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center gap-2 transition-colors font-semibold"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Revenue Split
                </>
              )}
            </button>

            <button
              onClick={exportToCSV}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-colors font-semibold"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>
        </>
      )}
    </div>
  );
}

