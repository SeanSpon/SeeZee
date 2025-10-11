import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Users, Mail, Shield, Calendar } from "lucide-react";
import RoleEditor from "./components/RoleEditor";
import InviteStaffButton from "./components/InviteStaffButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getTeamMembers() {
  try {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            assignedProjects: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
}

async function getPendingInvitations() {
  try {
    return await prisma.staffInviteCode.findMany({
      where: {
        redeemedAt: null,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        expiresAt: true,
      },
    });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return [];
  }
}

export default async function TeamPage() {
  const session = await auth();
  const isCEO = session?.user?.email === "seanspm1007@gmail.com";
  const teamMembers = await getTeamMembers();
  const pendingInvitations = isCEO ? await getPendingInvitations() : [];

  const roleColors = {
    ADMIN: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    STAFF: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    CLIENT: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-white">Team</h1>
            {isCEO && (
              <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                👑 CEO - Can Edit Roles
              </span>
            )}
          </div>
          <p className="text-slate-400 mt-2">Manage team members and permissions</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-6 py-3">
            <p className="text-3xl font-bold text-white">{teamMembers.length}</p>
            <p className="text-xs text-slate-400">Team Members</p>
          </div>
          {isCEO && <InviteStaffButton />}
        </div>
      </div>

      {/* Pending Invitations */}
      {isCEO && pendingInvitations.length > 0 && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Pending Invitations ({pendingInvitations.length})
          </h2>
          <div className="space-y-3">
            {pendingInvitations.map((inv) => (
              <div key={inv.id} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{inv.email}</p>
                  <p className="text-slate-400 text-sm">
                    Role: {inv.role} • Expires{" "}
                    {new Date(inv.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-yellow-500/20 text-yellow-300 text-xs font-bold border border-yellow-500/30">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role Stats */}
      <div className="grid grid-cols-3 gap-4">
        {(['ADMIN', 'STAFF', 'CLIENT'] as const).map((role) => {
          const count = teamMembers.filter(m => m.role === role).length;
          return (
            <div key={role} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-xs text-slate-400 capitalize">{role.toLowerCase()}</p>
            </div>
          );
        })}
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.length === 0 ? (
          <div className="col-span-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No team members yet</p>
          </div>
        ) : (
          teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-200"
            >
              {/* Avatar & Name */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  {member.image ? (
                    <img src={member.image} alt={member.name || ''} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-2xl">
                      {(member.name || member.email).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg truncate">{member.name || 'No Name'}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Mail size={14} />
                    <span className="truncate">{member.email}</span>
                  </div>
                </div>
              </div>

              {/* Role Badge with Editor */}
              <div className="mb-4">
                <RoleEditor
                  userId={member.id}
                  currentRole={member.role}
                  userName={member.name || member.email}
                  isCEO={isCEO}
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Projects</p>
                  <p className="text-white font-semibold">{member._count.assignedProjects}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Joined</p>
                  <p className="text-white font-semibold text-xs">
                    {new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

