"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronRight, Users, CheckSquare, Square } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface AudiencePickerProps {
  value: {
    type: "USER" | "TEAM" | "ROLE";
    userIds?: string[];
    teamId?: string;
    role?: string;
  };
  onChange: (value: AudiencePickerProps["value"]) => void;
  users: User[];
  loadingUsers?: boolean;
}

export default function AudiencePicker({
  value,
  onChange,
  users,
  loadingUsers,
}: AudiencePickerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set(["CEO", "ADMIN", "STAFF", "DESIGNER", "DEV"]));

  // Group users by role
  const usersByRole = useMemo(() => {
    const grouped: Record<string, User[]> = {};
    users.forEach((user) => {
      if (!grouped[user.role]) {
        grouped[user.role] = [];
      }
      grouped[user.role].push(user);
    });
    return grouped;
  }, [users]);

  // Filter users by search term
  const filteredUsersByRole = useMemo(() => {
    if (!searchTerm) return usersByRole;
    
    const filtered: Record<string, User[]> = {};
    Object.entries(usersByRole).forEach(([role, roleUsers]) => {
      const matchingUsers = roleUsers.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchingUsers.length > 0) {
        filtered[role] = matchingUsers;
      }
    });
    return filtered;
  }, [usersByRole, searchTerm]);

  const selectedIds = value.userIds || [];

  const toggleUser = (userId: string) => {
    const newIds = selectedIds.includes(userId)
      ? selectedIds.filter((id) => id !== userId)
      : [...selectedIds, userId];
    onChange({ ...value, type: "USER", userIds: newIds });
  };

  const toggleRole = (role: string) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(role)) {
      newExpanded.delete(role);
    } else {
      newExpanded.add(role);
    }
    setExpandedRoles(newExpanded);
  };

  const selectAllInRole = (role: string) => {
    const roleUserIds = usersByRole[role]?.map((u) => u.id) || [];
    const allSelected = roleUserIds.every((id) => selectedIds.includes(id));
    
    let newIds: string[];
    if (allSelected) {
      // Deselect all in this role
      newIds = selectedIds.filter((id) => !roleUserIds.includes(id));
    } else {
      // Select all in this role
      newIds = [...new Set([...selectedIds, ...roleUserIds])];
    }
    onChange({ ...value, type: "USER", userIds: newIds });
  };

  const selectAll = () => {
    const allUserIds = users.map((u) => u.id);
    const allSelected = allUserIds.every((id) => selectedIds.includes(id));
    
    if (allSelected) {
      onChange({ ...value, type: "USER", userIds: [] });
    } else {
      onChange({ ...value, type: "USER", userIds: allUserIds });
    }
  };

  const getRoleStats = (role: string) => {
    const roleUsers = usersByRole[role] || [];
    const selectedCount = roleUsers.filter((u) => selectedIds.includes(u.id)).length;
    return { total: roleUsers.length, selected: selectedCount };
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      CEO: "text-purple-400",
      ADMIN: "text-blue-400",
      STAFF: "text-green-400",
      DESIGNER: "text-pink-400",
      DEV: "text-cyan-400",
      OUTREACH: "text-orange-400",
      INTERN: "text-yellow-400",
      PARTNER: "text-indigo-400",
      CLIENT: "text-slate-400",
    };
    return colors[role] || "text-slate-400";
  };

  if (loadingUsers) {
    return (
      <div className="text-center py-12 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-3"></div>
        Loading users...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with search and select all */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={selectAll}
          className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 transition-colors text-sm font-medium flex items-center gap-2"
        >
          {selectedIds.length === users.length ? (
            <>
              <CheckSquare className="w-4 h-4" />
              Deselect All
            </>
          ) : (
            <>
              <Square className="w-4 h-4" />
              Select All
            </>
          )}
        </button>
      </div>

      {/* Selection stats */}
      <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-purple-400" />
          <span className="text-slate-300">
            <span className="font-bold text-purple-400">{selectedIds.length}</span> of{" "}
            <span className="font-bold">{users.length}</span> users selected
          </span>
        </div>
        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={() => onChange({ ...value, type: "USER", userIds: [] })}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Clear selection
          </button>
        )}
      </div>

      {/* Tree structure by role */}
      <div className="max-h-96 overflow-y-auto space-y-1 p-3 bg-slate-800/30 rounded-lg border border-slate-700">
        {Object.keys(filteredUsersByRole).length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            {searchTerm ? "No users match your search" : "No users found"}
          </div>
        ) : (
          Object.entries(filteredUsersByRole)
            .sort(([roleA], [roleB]) => roleA.localeCompare(roleB))
            .map(([role, roleUsers]) => {
              const isExpanded = expandedRoles.has(role);
              const stats = getRoleStats(role);
              const allSelected = stats.selected === stats.total && stats.total > 0;
              const someSelected = stats.selected > 0 && stats.selected < stats.total;

              return (
                <div key={role} className="space-y-1">
                  {/* Role header */}
                  <div className="flex items-center gap-2 p-2 hover:bg-slate-700/50 rounded-lg group">
                    <button
                      type="button"
                      onClick={() => toggleRole(role)}
                      className="p-1 hover:bg-slate-600 rounded transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => selectAllInRole(role)}
                      className="p-1"
                    >
                      {allSelected ? (
                        <CheckSquare className="w-4 h-4 text-purple-400" />
                      ) : someSelected ? (
                        <div className="w-4 h-4 border-2 border-purple-400 rounded bg-purple-400/30" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                    </button>

                    <div className="flex-1 flex items-center gap-2">
                      <span className={`text-sm font-semibold ${getRoleColor(role)}`}>
                        {role}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({stats.selected}/{stats.total})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => selectAllInRole(role)}
                      className="text-xs text-purple-400 hover:text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {allSelected ? "Deselect all" : "Select all"}
                    </button>
                  </div>

                  {/* Users in role */}
                  {isExpanded && (
                    <div className="ml-6 space-y-1">
                      {roleUsers.map((user) => (
                        <label
                          key={user.id}
                          className="flex items-center gap-3 p-2 pl-3 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors group"
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(user.id)}
                            onChange={() => toggleUser(user.id)}
                            className="w-4 h-4 rounded border-slate-600 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {user.name || "No name"}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {user.email}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
