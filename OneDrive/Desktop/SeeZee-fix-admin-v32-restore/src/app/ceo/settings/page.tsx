"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle, User, Bell, Crown } from "lucide-react";
import { useSession } from "next-auth/react";

type TabType = "profile" | "notifications";

export default function CEOSettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  
  // Profile state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Notification state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [executiveReports, setExecutiveReports] = useState(true);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      // Fetch additional user data
      fetch("/api/client/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.profile) {
            setPhone(data.profile.phone || "");
          }
        });
    }
  }, [session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/client/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/client/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailNotifications,
          projectUpdates,
          systemAlerts,
          executiveReports,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to update notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Settings</h1>
          <p className="admin-page-subtitle">
            Manage your executive account preferences
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-container-static">
        <div className="border-b border-white/10">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-all ${
                activeTab === "profile"
                  ? "border-purple-500 text-purple-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-all ${
                activeTab === "notifications"
                  ? "border-purple-500 text-purple-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Bell className="w-4 h-4" />
              Notifications
            </button>
          </div>
        </div>

        <div className="mt-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex items-center gap-3 mb-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <Crown className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white font-semibold">Executive Account</p>
                  <p className="text-sm text-slate-400">CEO privileges enabled</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all font-medium flex items-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50"
              >
                {success ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {loading ? "Saving..." : "Save Changes"}
                  </>
                )}
              </button>
            </form>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-white/5 hover:border-purple-500/30 transition-colors group">
                <div>
                  <p className="text-white font-medium group-hover:text-purple-400 transition-colors">
                    Email Notifications
                  </p>
                  <p className="text-sm text-slate-400">
                    Receive email updates about your account
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 bg-slate-800 checked:bg-purple-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-white/5 hover:border-purple-500/30 transition-colors group">
                <div>
                  <p className="text-white font-medium group-hover:text-purple-400 transition-colors">
                    Project Updates
                  </p>
                  <p className="text-sm text-slate-400">
                    Get notified when project milestones are completed
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={projectUpdates}
                  onChange={(e) => setProjectUpdates(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 bg-slate-800 checked:bg-purple-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-white/5 hover:border-purple-500/30 transition-colors group">
                <div>
                  <p className="text-white font-medium group-hover:text-purple-400 transition-colors">
                    System Alerts
                  </p>
                  <p className="text-sm text-slate-400">
                    Receive alerts about system issues and updates
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={systemAlerts}
                  onChange={(e) => setSystemAlerts(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 bg-slate-800 checked:bg-purple-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-white/5 hover:border-purple-500/30 transition-colors group">
                <div>
                  <p className="text-white font-medium group-hover:text-purple-400 transition-colors">
                    Executive Reports
                  </p>
                  <p className="text-sm text-slate-400">
                    Receive weekly executive summary reports
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={executiveReports}
                  onChange={(e) => setExecutiveReports(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 bg-slate-800 checked:bg-purple-500"
                />
              </div>

              <button
                onClick={handleSaveNotifications}
                disabled={loading}
                className="w-full px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all font-medium flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50"
              >
                {success ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {loading ? "Saving..." : "Save Notification Preferences"}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


