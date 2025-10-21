"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Building2, Save, Loader2, Camera, Shield, Calendar } from "lucide-react";
import { updateMyProfile } from "@/server/actions/profile";
import { formatDistanceToNow } from "date-fns";
import Avatar from "@/components/ui/Avatar";
import { RoleBadge } from "@/components/admin/RoleBadge";

interface ProfileClientProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
    phone: string | null;
    company: string | null;
    tosAcceptedAt: Date | null;
    profileDoneAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    company: user.company || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateMyProfile(formData);

      if (!result.success) {
        throw new Error(result.error || "Failed to update profile");
      }

      setSuccess(true);
      setEditing(false);
      router.refresh();
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      company: user.company || "",
    });
    setEditing(false);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-gray-400">
          View and manage your personal information
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-300">
          Profile updated successfully!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">
            {/* Avatar */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center mx-auto">
                  <Avatar
                    src={user.image}
                    alt={user.name || user.email}
                    size={128}
                    fallbackText={user.name || user.email?.charAt(0)}
                  />
                </div>
                <button
                  className="absolute bottom-0 right-0 p-2 bg-purple-500 hover:bg-purple-600 rounded-full text-white transition-colors"
                  title="Change avatar (coming soon)"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              
              <h2 className="text-xl font-bold text-white mt-4">
                {user.name || "No name set"}
              </h2>
              <p className="text-sm text-gray-400">{user.email}</p>
              
              <div className="flex items-center justify-center gap-2 mt-3">
                <RoleBadge role={user.role as any} />
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Member since</span>
                <span className="text-white font-medium">
                  {formatDistanceToNow(new Date(user.createdAt))} ago
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Last updated</span>
                <span className="text-white font-medium">
                  {formatDistanceToNow(new Date(user.updatedAt))} ago
                </span>
              </div>

              {user.tosAcceptedAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">ToS accepted</span>
                  <span className="text-green-400 font-medium">✓</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details Form */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Profile Information</h3>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white text-sm font-semibold transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </div>
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                ) : (
                  <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                    {user.name || <span className="text-gray-500">Not set</span>}
                  </div>
                )}
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </div>
                </label>
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-400">
                  {user.email}
                  <span className="text-xs ml-2">(cannot be changed)</span>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </div>
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                ) : (
                  <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                    {user.phone || <span className="text-gray-500">Not set</span>}
                  </div>
                )}
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Company
                  </div>
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Enter your company name"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                ) : (
                  <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                    {user.company || <span className="text-gray-500">Not set</span>}
                  </div>
                )}
              </div>

              {/* Role (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Role
                  </div>
                </label>
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                  <RoleBadge role={user.role as any} />
                  <span className="text-xs text-gray-500 ml-2">(managed by admin)</span>
                </div>
              </div>

              {/* Action Buttons */}
              {editing && (
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
