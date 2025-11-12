"use client";

/**
 * Team Client Component
 * Manages team members and their roles
 */

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Trash2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
    default: return "text-gray-400";
  }
};

export function TeamClient({ users }: TeamClientProps) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<TeamUser | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
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

  // Filter users by selected role
  const filteredUsers = selectedRole 
    ? users.filter(user => user.role === selectedRole)
    : users;

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

  // Get role statistics
  const roleStats = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const roles = Object.keys(roleStats);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-3 relative">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red glow-on-hover inline-block mb-2">
          People Operations
        </span>
        <h1 className="text-4xl font-heading font-bold gradient-text">Team Management</h1>
        <p className="max-w-2xl text-base text-gray-300 leading-relaxed">
          Manage team members, assign roles, and oversee access control across the platform.
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-2xl border-2 border-gray-700 glass-effect p-6 text-white hover:border-trinity-red/50 transition-all duration-300 group hover:shadow-large hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-semibold">Total Team</p>
            <div className="w-10 h-10 bg-trinity-red/20 rounded-lg flex items-center justify-center border border-trinity-red/30">
              <Users className="w-5 h-5 text-trinity-red" />
            </div>
          </div>
          <p className="text-4xl font-heading font-bold text-white mb-1">{users.length}</p>
          <p className="text-xs text-gray-500">Members</p>
        </div>
        
        {roles.slice(0, 3).map((role) => {
          const Icon = getRoleIcon(role);
          const colorClass = getRoleColor(role);
          const bgClass = colorClass.replace("text-", "bg-").replace("400", "500/20");
          const borderClass = colorClass.replace("text-", "border-").replace("400", "500/30");
          
          return (
            <div key={role} className="rounded-2xl border-2 border-gray-700 glass-effect p-6 text-white hover:border-trinity-red/50 transition-all duration-300 group hover:shadow-large hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-semibold">{role}s</p>
                <div className={`w-10 h-10 ${bgClass} rounded-lg flex items-center justify-center border ${borderClass}`}>
                  <Icon className={`w-5 h-5 ${colorClass}`} />
                </div>
              </div>
              <p className="text-4xl font-heading font-bold text-white mb-1">{roleStats[role]}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          );
        })}
      </div>

      {/* Role Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedRole(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedRole === null
              ? "bg-trinity-red/20 text-trinity-red border-2 border-trinity-red/50"
              : "bg-gray-800/50 text-gray-400 border-2 border-gray-700 hover:border-gray-600 hover:text-white"
          }`}
        >
          All ({users.length})
        </button>
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedRole === role
                ? "bg-trinity-red/20 text-trinity-red border-2 border-trinity-red/50"
                : "bg-gray-800/50 text-gray-400 border-2 border-gray-700 hover:border-gray-600 hover:text-white"
            }`}
          >
            {role} ({roleStats[role]})
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Search team members..."
        onSearchChange={setSearchQuery}
        filters={[
          {
            label: "Role",
            value: selectedRole || "all",
            onChange: (value) => setSelectedRole(value === "all" ? null : value),
            options: [
              { label: "All Roles", value: "all" },
              ...roles.map((role) => ({ label: role, value: role })),
            ],
          },
        ]}
      />

      {/* Team Members */}
      <div className="glass-effect rounded-2xl border-2 border-gray-700 p-6 hover:border-trinity-red/30 transition-all duration-300">
        <h2 className="text-2xl font-heading font-bold text-white mb-6">
          Team Members {selectedRole ? `(${selectedRole})` : ""}
        </h2>
        <div className="space-y-4">
          {searchFilteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">
                {searchQuery ? "No team members match your search" : "No team members found"}
              </p>
            </div>
          ) : (
            searchFilteredUsers.map((user) => {
              const Icon = getRoleIcon(user.role);
              const colorClass = getRoleColor(user.role);
              
              return (
                <div
                  key={user.id}
                  className="rounded-xl border-2 border-gray-700 glass-effect p-4 hover:border-trinity-red/50 transition-all hover:shadow-medium"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                        <Avatar
                          src={user.image}
                          alt={user.name || user.email}
                          size={48}
                          fallbackText={user.name || user.email?.charAt(0)}
                        />
                      </div>

                      {/* User Info */}
                      <div>
                        <h3 className="font-semibold text-white">
                          {user.name || "No name"}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <Mail className="h-3 w-3" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Joined {formatDistanceToNow(new Date(user.createdAt))} ago
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Role Badge */}
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-4 w-4 ${colorClass}`} />
                        <RoleBadge role={user.role as any} />
                      </div>

                      {/* Actions Dropdown */}
                      <div className="relative" ref={openMenuId === user.id ? menuRef : null}>
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuId === user.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                            <button
                              onClick={() => {
                                setEditingUser(user);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Edit User
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2 ${
                                deleteConfirm === user.id
                                  ? "bg-red-500/20 text-red-300"
                                  : "text-red-400 hover:bg-red-500/10"
                              }`}
                            >
                              <Trash2 className="h-4 w-4" />
                              {deleteConfirm === user.id ? "Confirm Delete?" : "Delete User"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
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
    </div>
  );
}