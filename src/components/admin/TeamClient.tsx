"use client";

/**
 * Team Client Component
 * Manages team members and their roles with modern UI
 */

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import { SectionCard } from "@/components/admin/SectionCard";
import { RoleBadge } from "@/components/admin/RoleBadge";
import { EditUserModal } from "@/components/admin/EditUserModal";
import { FilterBar } from "@/components/ui/FilterBar";
import { deleteUser } from "@/server/actions/team";
import { 
  Users, 
  Crown, 
  Shield, 
  User, 
  Code, 
  Palette, 
  Megaphone,
  UserCheck,
  Mail,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  X,
  Check,
  Loader2,
  Copy,
  Search,
  Filter,
  ArrowUpDown,
  Phone,
  Building2,
  Clock,
  Activity,
  Eye,
  Star,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface TeamUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TeamClientProps {
  users: TeamUser[];
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case "CEO": return Crown;
    case "CFO": return Shield;
    case "FRONTEND": return Palette;
    case "BACKEND": return Code;
    case "OUTREACH": return Megaphone;
    case "CLIENT": return UserCheck;
    default: return User;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "CEO": return "text-yellow-400";
    case "CFO": return "text-red-400";
    case "STAFF": return "text-blue-400";
    case "DEV": return "text-green-400";
    case "DESIGNER": return "text-purple-400";
    case "OUTREACH": return "text-orange-400";
    case "CLIENT": return "text-cyan-400";
    default: return "text-gray-400";
  }
};

export function TeamClient({ users }: TeamClientProps) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showClients, setShowClients] = useState(false);
  const [editingUser, setEditingUser] = useState<TeamUser | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("FRONTEND");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "role" | "date">("role");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openMenuId]);

  const handleDelete = async (userId: string) => {
    if (deleteConfirm !== userId) {
      setDeleteConfirm(userId);
      return;
    }

    const result = await deleteUser(userId);
    if (result.success) {
      setDeleteConfirm(null);
      setOpenMenuId(null);
      router.refresh();
    }
  };

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setInviteError("");

    try {
      const response = await fetch("/api/invitations/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: inviteEmail, 
          role: inviteRole,
          expiresDays: 7 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setInviteSuccess(true);
        setTimeout(() => {
          setShowInviteModal(false);
          setInviteEmail("");
          setInviteRole("FRONTEND");
          setInviteSuccess(false);
        }, 3000);
      } else {
        setInviteError(data.error || "Failed to send invitation");
      }
    } catch (error) {
      setInviteError("An error occurred while sending the invitation");
    } finally {
      setIsInviting(false);
    }
  };

  // Define role order for consistent display and sorting
  const roleOrder: Record<string, number> = {
    CEO: 1,
    CFO: 2,
    FRONTEND: 3,
    BACKEND: 4,
    OUTREACH: 5,
    CLIENT: 6,
  };

  // Get team users (staff only) and clients separately
  const staffUsers = users.filter(user => user.role !== "CLIENT");
  const clientUsers = users.filter(user => user.role === "CLIENT");

  // Determine which users to show based on showClients toggle or CLIENT role selection
  const baseUsers = selectedRole === "CLIENT" 
    ? clientUsers 
    : (showClients ? users : staffUsers);

  // Sort users based on selected sort method
  const sortedUsers = [...baseUsers].sort((a, b) => {
    if (sortBy === "name") {
      return (a.name || a.email).localeCompare(b.name || b.email);
    } else if (sortBy === "date") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      // Sort by role
      const aOrder = roleOrder[a.role] || 99;
      const bOrder = roleOrder[b.role] || 99;
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      return (a.name || a.email).localeCompare(b.name || b.email);
    }
  });

  // Filter users by selected role (skip if already filtering by CLIENT)
  const filteredUsers = (selectedRole && selectedRole !== "CLIENT")
    ? sortedUsers.filter(user => user.role === selectedRole)
    : sortedUsers;

  // Apply search filter
  const searchFilteredUsers = filteredUsers.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  });

  // Get role statistics for staff users
  const roleStats = staffUsers.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Add CLIENT count to stats
  if (clientUsers.length > 0) {
    roleStats["CLIENT"] = clientUsers.length;
  }

  // Sort roles by predefined order
  const roles = Object.keys(roleStats).sort((a, b) => {
    const aOrder = roleOrder[a] || 99;
    const bOrder = roleOrder[b] || 99;
    return aOrder - bOrder;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-trinity-red/20 to-purple-600/20 flex items-center justify-center border border-trinity-red/30">
                <Users className="w-6 h-6 text-trinity-red" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-trinity-red">
                  People Operations
                </span>
                <h1 className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Team Management
                </h1>
              </div>
            </div>
            <p className="max-w-2xl text-sm md:text-base text-slate-400 leading-relaxed pl-15">
              Manage your team, assign roles, and monitor member activity across the platform.
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-trinity-red to-red-600 hover:from-trinity-red/90 hover:to-red-600/90 text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-trinity-red/25 hover:shadow-xl hover:shadow-trinity-red/40 hover:-translate-y-0.5 group"
          >
            <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Invite Staff
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Team */}
        <div className="group relative rounded-2xl border border-gray-700/50 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl p-6 transition-all duration-500 hover:border-trinity-red/50 hover:shadow-2xl hover:shadow-trinity-red/20 hover:-translate-y-1 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-trinity-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-bold">Total Team</p>
              <div className="w-11 h-11 bg-gradient-to-br from-trinity-red/20 to-red-600/20 rounded-xl flex items-center justify-center border border-trinity-red/30 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-5 h-5 text-trinity-red" />
              </div>
            </div>
            <p className="text-4xl font-heading font-bold bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent mb-1">
              {staffUsers.length}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Activity className="w-3 h-3" />
              <span>Team Members</span>
            </div>
          </div>
        </div>
        
        {/* Clients Stat Card */}
        <button 
          onClick={() => {
            setSelectedRole(selectedRole === "CLIENT" ? null : "CLIENT");
          }}
          className={`group relative rounded-2xl border bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl p-6 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 text-left overflow-hidden ${
            selectedRole === "CLIENT" 
              ? "border-cyan-500/50 shadow-xl shadow-cyan-500/20" 
              : "border-gray-700/50 hover:border-cyan-500/50 hover:shadow-cyan-500/20"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-bold">Clients</p>
              <div className="w-11 h-11 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
                <UserCheck className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <p className="text-4xl font-heading font-bold bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent mb-1">
              {clientUsers.length}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>Active Clients</span>
            </div>
          </div>
        </button>
        
        {/* Role Cards */}
        {roles.filter(r => r !== "CLIENT").slice(0, 3).map((role) => {
          const Icon = getRoleIcon(role);
          const colorClass = getRoleColor(role);
          const bgClass = colorClass.replace("text-", "bg-").replace("400", "500/20");
          const borderClass = colorClass.replace("text-", "border-").replace("400", "500/30");
          const gradientFrom = colorClass.replace("text-", "from-").replace("400", "500/5");
          
          return (
            <div key={role} className="group relative rounded-2xl border border-gray-700/50 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl p-6 transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-bold">{role}s</p>
                  <div className={`w-11 h-11 ${bgClass} rounded-xl flex items-center justify-center border ${borderClass} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-5 h-5 ${colorClass}`} />
                  </div>
                </div>
                <p className="text-4xl font-heading font-bold bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent mb-1">
                  {roleStats[role]}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Star className="w-3 h-3" />
                  <span>Active</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters & Controls */}
      <div className="space-y-4">
        {/* Search and View Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-trinity-red transition-colors" />
            <input
              type="text"
              placeholder={selectedRole === "CLIENT" ? "Search clients by name, email, or company..." : "Search team members by name, email, or role..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-gray-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-trinity-red/50 focus:border-trinity-red/50 transition-all backdrop-blur-xl"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none px-4 py-3.5 pr-10 bg-slate-900/50 border border-gray-700/50 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-trinity-red/50 focus:border-trinity-red/50 transition-all cursor-pointer backdrop-blur-xl min-w-[180px]"
            >
              <option value="role">Sort by Role</option>
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Date Joined</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-slate-900/50 border border-gray-700/50 rounded-xl p-1.5 backdrop-blur-xl">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-trinity-red text-white shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
              title="Grid View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-trinity-red text-white shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
              title="List View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Role Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedRole(null)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              selectedRole === null
                ? "bg-gradient-to-r from-trinity-red to-red-600 text-white shadow-lg shadow-trinity-red/25 scale-105"
                : "bg-slate-900/50 text-slate-300 border border-gray-700/50 hover:border-trinity-red/50 hover:text-white hover:scale-105"
            }`}
          >
            <span className="flex items-center gap-2">
              All
              <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs">
                {showClients ? users.length : staffUsers.length}
              </span>
            </span>
          </button>
          {roles.map((role) => {
            const isClient = role === "CLIENT";
            const isSelected = selectedRole === role;
            const Icon = getRoleIcon(role);
            return (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isSelected
                    ? isClient 
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 scale-105"
                      : "bg-gradient-to-r from-trinity-red to-red-600 text-white shadow-lg shadow-trinity-red/25 scale-105"
                    : "bg-slate-900/50 text-slate-300 border border-gray-700/50 hover:border-white/20 hover:text-white hover:scale-105"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {role}
                  <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs">
                    {roleStats[role]}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Team Members / Clients */}
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-heading font-bold text-white mb-1">
              {selectedRole === "CLIENT" ? "Clients" : "Team Members"}
              {selectedRole && selectedRole !== "CLIENT" && (
                <span className="ml-2 text-trinity-red">({selectedRole})</span>
              )}
            </h2>
            <p className="text-sm text-slate-400">
              {searchFilteredUsers.length} {searchFilteredUsers.length === 1 ? "member" : "members"} found
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
        </div>

        {/* Empty State */}
        {searchFilteredUsers.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
              {selectedRole === "CLIENT" ? (
                <UserCheck className="h-10 w-10 text-cyan-400" />
              ) : (
                <Users className="h-10 w-10 text-slate-500" />
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {searchQuery ? "No Results Found" : "No Team Members Yet"}
            </h3>
            <p className="text-slate-400 max-w-md mx-auto">
              {searchQuery 
                ? `No ${selectedRole === "CLIENT" ? "clients" : "team members"} match your search criteria. Try adjusting your filters.` 
                : `Get started by inviting your first ${selectedRole === "CLIENT" ? "client" : "team member"}.`}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {searchFilteredUsers.map((user) => {
              const Icon = getRoleIcon(user.role);
              const colorClass = getRoleColor(user.role);
              const isRecent = new Date().getTime() - new Date(user.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
              
              return (
                <div
                  key={user.id}
                  className="group relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 transition-all duration-500 hover:border-trinity-red/50 hover:shadow-2xl hover:shadow-trinity-red/10 hover:-translate-y-1 overflow-hidden"
                >
                  {/* Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-trinity-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* New Badge */}
                  {isRecent && (
                    <div className="absolute top-4 right-4 px-2.5 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-lg">
                      NEW
                    </div>
                  )}

                  <div className="relative z-10">
                    {/* Avatar & Quick Actions */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 p-0.5 group-hover:from-trinity-red/30 group-hover:to-red-600/30 transition-all duration-500">
                          <div className="w-full h-full rounded-2xl overflow-hidden">
                            <Avatar
                              src={user.image}
                              alt={user.name || user.email}
                              size={64}
                              fallbackText={user.name || user.email?.charAt(0)}
                            />
                          </div>
                        </div>
                        {/* Online Status Indicator (placeholder) */}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-slate-900 rounded-full" />
                      </div>

                      {/* Actions Dropdown */}
                      <div className="relative" ref={openMenuId === user.id ? menuRef : null}>
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-5 w-5 text-gray-400" />
                        </button>

                        {openMenuId === user.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                            <Link
                              href={`/admin/team/${user.id}`}
                              className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-trinity-red/10 hover:text-white transition-all flex items-center gap-3 group/item"
                              onClick={() => setOpenMenuId(null)}
                            >
                              <Eye className="h-4 w-4 group-hover/item:scale-110 transition-transform" />
                              View Profile
                            </Link>
                            <button
                              onClick={() => {
                                setEditingUser(user);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-trinity-red/10 hover:text-white transition-all flex items-center gap-3 group/item"
                            >
                              <Edit className="h-4 w-4 group-hover/item:scale-110 transition-transform" />
                              Edit User
                            </button>
                            <div className="border-t border-white/5" />
                            <button
                              onClick={() => handleDelete(user.id)}
                              className={`w-full px-4 py-3 text-left text-sm transition-all flex items-center gap-3 group/item ${
                                deleteConfirm === user.id
                                  ? "bg-red-500/20 text-red-300"
                                  : "text-red-400 hover:bg-red-500/10"
                              }`}
                            >
                              <Trash2 className="h-4 w-4 group-hover/item:scale-110 transition-transform" />
                              {deleteConfirm === user.id ? "Confirm Delete?" : "Delete User"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="mb-4">
                      <h3 className="font-bold text-lg text-white mb-1 truncate">
                        {user.name || "No name"}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                        <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      
                      {/* Role Badge */}
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${colorClass.replace("text-", "from-")}/20 ${colorClass.replace("text-", "to-")}/10 border border-${colorClass.replace("text-", "")}/30`}>
                          <Icon className={`h-4 w-4 ${colorClass}`} />
                        </div>
                        <RoleBadge role={user.role as any} />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {searchFilteredUsers.map((user) => {
              const Icon = getRoleIcon(user.role);
              const colorClass = getRoleColor(user.role);
              const isRecent = new Date().getTime() - new Date(user.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
              
              return (
                <div
                  key={user.id}
                  className="group relative bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 transition-all duration-300 hover:border-trinity-red/50 hover:shadow-xl hover:shadow-trinity-red/10 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-trinity-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10 flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-700 p-0.5">
                        <Avatar
                          src={user.image}
                          alt={user.name || user.email}
                          size={56}
                          fallbackText={user.name || user.email?.charAt(0)}
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full" />
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-white truncate">
                          {user.name || "No name"}
                        </h3>
                        {isRecent && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Role Badge */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${colorClass.replace("text-", "from-")}/20 ${colorClass.replace("text-", "to-")}/10`}>
                          <Icon className={`h-4 w-4 ${colorClass}`} />
                        </div>
                        <RoleBadge role={user.role as any} />
                      </div>

                      {/* Actions */}
                      <div className="relative" ref={openMenuId === user.id ? menuRef : null}>
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-all"
                        >
                          <MoreHorizontal className="h-5 w-5 text-gray-400" />
                        </button>

                        {openMenuId === user.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                            <Link
                              href={`/admin/team/${user.id}`}
                              className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-trinity-red/10 hover:text-white transition-all flex items-center gap-3 group/item"
                              onClick={() => setOpenMenuId(null)}
                            >
                              <Eye className="h-4 w-4 group-hover/item:scale-110 transition-transform" />
                              View Profile
                            </Link>
                            <button
                              onClick={() => {
                                setEditingUser(user);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-trinity-red/10 hover:text-white transition-all flex items-center gap-3 group/item"
                            >
                              <Edit className="h-4 w-4 group-hover/item:scale-110 transition-transform" />
                              Edit User
                            </button>
                            <div className="border-t border-white/5" />
                            <button
                              onClick={() => handleDelete(user.id)}
                              className={`w-full px-4 py-3 text-left text-sm transition-all flex items-center gap-3 group/item ${
                                deleteConfirm === user.id
                                  ? "bg-red-500/20 text-red-300"
                                  : "text-red-400 hover:bg-red-500/10"
                              }`}
                            >
                              <Trash2 className="h-4 w-4 group-hover/item:scale-110 transition-transform" />
                              {deleteConfirm === user.id ? "Confirm Delete?" : "Delete User"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            router.refresh();
          }}
        />
      )}

      {/* Invite Staff Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-white/10 rounded-3xl p-8 max-w-lg w-full shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-300">
            {/* Decorative Elements */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-trinity-red/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-trinity-red/20 to-red-600/20 flex items-center justify-center border border-trinity-red/30">
                    <UserPlus className="w-6 h-6 text-trinity-red" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Invite Team Member</h2>
                    <p className="text-sm text-slate-400">Send an invitation code via email</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail("");
                    setInviteRole("FRONTEND");
                    setInviteError("");
                    setInviteSuccess(false);
                  }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {inviteSuccess ? (
                /* Success State */
                <div className="text-center py-12 animate-in fade-in zoom-in-95 duration-500">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50">
                      <Check className="w-10 h-10 text-white animate-in zoom-in duration-300 delay-200" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Invitation Sent!</h3>
                  <p className="text-slate-300 mb-2">
                    A 6-digit verification code has been sent to:
                  </p>
                  <p className="text-trinity-red font-semibold text-lg">{inviteEmail}</p>
                  <p className="text-sm text-slate-400 mt-4">
                    The recipient can use this code to join your team
                  </p>
                </div>
              ) : (
                /* Form */
                <form onSubmit={handleInviteStaff} className="space-y-6">
                  {inviteError && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top duration-300">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-red-300 text-sm">{inviteError}</p>
                    </div>
                  )}

                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        required
                        placeholder="colleague@example.com"
                        className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-trinity-red/50 focus:border-trinity-red/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Role Select */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Team Role
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="w-full pl-12 pr-10 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-trinity-red/50 focus:border-trinity-red/50 transition-all appearance-none cursor-pointer"
                      >
                        <option value="CEO" className="bg-slate-900">CEO - Chief Executive</option>
                        <option value="CFO" className="bg-slate-900">CFO - Chief Financial Officer</option>
                        <option value="FRONTEND" className="bg-slate-900">Frontend Developer</option>
                        <option value="BACKEND" className="bg-slate-900">Backend Developer</option>
                        <option value="OUTREACH" className="bg-slate-900">Outreach Specialist</option>
                      </select>
                      <ArrowUpDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-cyan-300 mb-1">Email Verification</p>
                        <p className="text-xs text-cyan-400/80">
                          A secure 6-digit code will be generated and sent to the recipient. They can use this code to register and join your team.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowInviteModal(false);
                        setInviteEmail("");
                        setInviteRole("FRONTEND");
                        setInviteError("");
                      }}
                      className="flex-1 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all border border-white/10 hover:border-white/20"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isInviting || !inviteEmail}
                      className="flex-1 px-6 py-3.5 bg-gradient-to-r from-trinity-red to-red-600 hover:from-trinity-red/90 hover:to-red-600/90 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-trinity-red/25 hover:shadow-xl hover:shadow-trinity-red/40"
                    >
                      {isInviting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5" />
                          Send Invitation
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}