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
    case "ADMIN": return Shield;
    case "STAFF": return UserCheck;
    case "DEV": return Code;
    case "DESIGNER": return Palette;
    case "OUTREACH": return Megaphone;
    default: return User;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "CEO": return "text-yellow-400";
    case "ADMIN": return "text-red-400";
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
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Team Management</h1>
        <p className="text-gray-400">
          Manage team members and their roles
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-400" />
            <span className="text-sm text-gray-400">Total Team</span>
          </div>
          <p className="text-2xl font-bold text-white mt-1">{users.length}</p>
        </div>
        
        {roles.slice(0, 3).map((role) => {
          const Icon = getRoleIcon(role);
          const colorClass = getRoleColor(role);
          
          return (
            <div key={role} className="bg-white/5 p-4 rounded-lg border border-white/10">
              <div className="flex items-center space-x-2">
                <Icon className={`h-5 w-5 ${colorClass}`} />
                <span className="text-sm text-gray-400">{role}s</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">{roleStats[role]}</p>
            </div>
          );
        })}
      </div>

      {/* Role Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedRole(null)}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            selectedRole === null
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/50"
              : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
          }`}
        >
          All ({users.length})
        </button>
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedRole === role
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/50"
                : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
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
      <SectionCard
        title={`Team Members ${selectedRole ? `(${selectedRole})` : ""}`}
      >
        <div className="space-y-4">
          {searchFilteredUsers.length === 0 ? (
            <div className="text-center py-8">
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
                  className="bg-white/5 p-4 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
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
      </SectionCard>

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