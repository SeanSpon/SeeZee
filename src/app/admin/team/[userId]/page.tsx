import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Globe, 
  Briefcase, 
  Calendar, 
  Shield,
  ArrowLeft,
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  User,
  Star,
  Award,
  Target
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import Avatar from "@/components/ui/Avatar";
import { RoleBadge } from "@/components/admin/RoleBadge";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserProfilePage({ params }: PageProps) {
  const { userId } = await params;
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect("/login");
  }

  // Only admins can view other user profiles
  const isAdmin = ["CEO", "CFO", "FRONTEND", "BACKEND", "OUTREACH"].includes(currentUser.role || "");
  
  if (!isAdmin) {
    redirect("/");
  }

  // Fetch the user profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      _count: {
        select: {
          assignedProjects: true,
          assignedTodos: true,
          createdTodos: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back Button */}
        <Link
          href="/admin/team"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Team
        </Link>

        {/* Header */}
        <div className="relative">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-trinity-red/20 to-purple-600/20 flex items-center justify-center border border-trinity-red/30">
              <User className="w-6 h-6 text-trinity-red" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Team Member Profile
              </h1>
              <p className="text-slate-400">Detailed information and activity overview</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Main Profile */}
            <div className="group relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 transition-all duration-500 hover:border-trinity-red/50 hover:shadow-2xl hover:shadow-trinity-red/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-trinity-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                {/* Avatar */}
                <div className="text-center mb-6">
                  <div className="relative inline-block mb-4">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 p-1 group-hover:from-trinity-red/30 group-hover:to-red-600/30 transition-all duration-500">
                      <div className="w-full h-full rounded-2xl overflow-hidden">
                        <Avatar
                          src={user.image || user.profileImageUrl}
                          alt={user.name || user.email}
                          size={128}
                          fallbackText={user.name || user.email?.charAt(0)}
                        />
                      </div>
                    </div>
                    {/* Online Status */}
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-slate-900 rounded-full" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {user.name || "No name set"}
                  </h2>
                  <p className="text-sm text-slate-400 mb-4">{user.email}</p>
                  
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <RoleBadge role={user.role as any} />
                  </div>

                  {user.profile?.jobTitle && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                      <Briefcase className="w-4 h-4 text-purple-400" />
                      <p className="text-sm text-purple-300 font-medium">
                        {user.profile.jobTitle}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {user.bio && (
                  <div className="pt-6 border-t border-white/5">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3">About</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{user.bio}</p>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/5">
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <Target className="w-5 h-5 text-trinity-red mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{user._count.assignedProjects}</p>
                    <p className="text-xs text-slate-400">Projects</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <Award className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{user._count.assignedTodos}</p>
                    <p className="text-xs text-slate-400">Tasks</p>
                  </div>
                </div>

                {/* Skills */}
                {user.profile?.skills && user.profile.skills.length > 0 && (
                  <div className="pt-6 border-t border-white/5">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3">Skills & Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.profile.skills.map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 text-xs font-medium rounded-lg border border-purple-500/30 hover:border-purple-400/50 transition-colors"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Activity Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">Joined Team</p>
                    <p className="text-xs text-slate-400">{format(new Date(user.createdAt), "MMM dd, yyyy")}</p>
                  </div>
                </div>
                {user.lastLogin && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">Last Active</p>
                      <p className="text-xs text-slate-400">{formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Mail className="w-5 h-5 text-trinity-red" />
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Mail className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Email Address</p>
                    <p className="text-white font-medium truncate">{user.email}</p>
                  </div>
                </div>

                {/* Phone */}
                {user.phone && (
                  <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Phone className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Phone Number</p>
                      <p className="text-white font-medium">{user.phone}</p>
                    </div>
                  </div>
                )}

                {/* Company */}
                {user.company && (
                  <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-green-500/30 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Building2 className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Company</p>
                      <p className="text-white font-medium">{user.company}</p>
                    </div>
                  </div>
                )}

                {/* Location */}
                {user.location && (
                  <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-red-500/30 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <MapPin className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Location</p>
                      <p className="text-white font-medium">{user.location}</p>
                    </div>
                  </div>
                )}

                {/* Website */}
                {user.profile?.websiteUrl && (
                  <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Globe className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Website</p>
                      <a 
                        href={user.profile.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors truncate block"
                      >
                        {user.profile.websiteUrl}
                      </a>
                    </div>
                  </div>
                )}

                {/* Portfolio */}
                {user.profile?.portfolioUrl && (
                  <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-yellow-500/30 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Briefcase className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Portfolio</p>
                      <a 
                        href={user.profile.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors truncate block"
                      >
                        {user.profile.portfolioUrl}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-trinity-red" />
                Account Status
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl border transition-all ${
                  user.emailVerified 
                    ? "bg-green-500/10 border-green-500/30" 
                    : "bg-red-500/10 border-red-500/30"
                }`}>
                  {user.emailVerified ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 mb-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 mb-2" />
                  )}
                  <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Email Verified</p>
                  <p className={`text-sm font-bold ${user.emailVerified ? "text-green-300" : "text-red-300"}`}>
                    {user.emailVerified ? "Verified" : "Not Verified"}
                  </p>
                </div>

                <div className={`p-4 rounded-xl border transition-all ${
                  user.profileDoneAt 
                    ? "bg-green-500/10 border-green-500/30" 
                    : "bg-orange-500/10 border-orange-500/30"
                }`}>
                  {user.profileDoneAt ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 mb-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-orange-400 mb-2" />
                  )}
                  <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Profile Status</p>
                  <p className={`text-sm font-bold ${user.profileDoneAt ? "text-green-300" : "text-orange-300"}`}>
                    {user.profileDoneAt ? "Complete" : "Incomplete"}
                  </p>
                </div>

                <div className={`p-4 rounded-xl border transition-all ${
                  user.twofaEnabled 
                    ? "bg-green-500/10 border-green-500/30" 
                    : "bg-red-500/10 border-red-500/30"
                }`}>
                  {user.twofaEnabled ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 mb-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 mb-2" />
                  )}
                  <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">2FA Security</p>
                  <p className={`text-sm font-bold ${user.twofaEnabled ? "text-green-300" : "text-red-300"}`}>
                    {user.twofaEnabled ? "Enabled" : "Disabled"}
                  </p>
                </div>

                <div className={`p-4 rounded-xl border transition-all ${
                  user.tosAcceptedAt 
                    ? "bg-green-500/10 border-green-500/30" 
                    : "bg-red-500/10 border-red-500/30"
                }`}>
                  {user.tosAcceptedAt ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 mb-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 mb-2" />
                  )}
                  <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Terms of Service</p>
                  <p className={`text-sm font-bold ${user.tosAcceptedAt ? "text-green-300" : "text-red-300"}`}>
                    {user.tosAcceptedAt ? "Accepted" : "Pending"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}




