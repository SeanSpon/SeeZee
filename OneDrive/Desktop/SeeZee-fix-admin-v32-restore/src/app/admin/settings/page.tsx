"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle, User, Bell, Shield } from "lucide-react";
import { useSession } from "next-auth/react";

type TabType = "profile" | "notifications";

export default function AdminSettingsPage() {
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
    <div className="space-y-8">
      <header className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red">
          Control Center
        </span>
        <h1 className="text-3xl font-heading font-bold text-white">Settings</h1>
        <p className="max-w-2xl text-sm text-gray-400">
          Fine-tune your profile, communication preferences, and system alerts without leaving mission control.
        </p>
      </header>

      <div className="rounded-2xl border border-white/10 bg-gray-900/70 p-6 shadow-lg shadow-gray-900/20 backdrop-blur">
        <div className="border-b border-gray-800/80">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 border-b-2 px-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === "profile"
                  ? "border-trinity-red text-trinity-red"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <User className="h-4 w-4" /> Profile
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-2 border-b-2 px-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === "notifications"
                  ? "border-trinity-red text-trinity-red"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <Bell className="h-4 w-4" /> Notifications
            </button>
          </div>
        </div>

        <div className="mt-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-gray-900/70 px-4 py-3 text-white shadow-inner transition focus:border-trinity-red focus:outline-none"
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
                  className="w-full rounded-lg border border-gray-800 bg-gray-900/70 px-4 py-3 text-white shadow-inner transition focus:border-trinity-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Role
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/70 px-4 py-3 text-sm text-gray-300">
                  <Shield className="w-4 h-4" />
                  {session?.user?.role || "N/A"}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-trinity-red px-6 py-2 font-medium text-white transition hover:bg-trinity-maroon disabled:opacity-50"
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
              <div className="group flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/60 p-4 transition hover:border-trinity-red/40">
                <div>
                  <p className="font-medium text-white transition group-hover:text-trinity-red">
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
                  className="h-5 w-5 rounded border-gray-700 bg-gray-800 text-trinity-red focus:ring-trinity-red"
                />
              </div>

              <div className="group flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/60 p-4 transition hover:border-trinity-red/40">
                <div>
                  <p className="font-medium text-white transition group-hover:text-trinity-red">
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
                  className="h-5 w-5 rounded border-gray-700 bg-gray-800 text-trinity-red focus:ring-trinity-red"
                />
              </div>

              <div className="group flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/60 p-4 transition hover:border-trinity-red/40">
                <div>
                  <p className="font-medium text-white transition group-hover:text-trinity-red">
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
                  className="h-5 w-5 rounded border-gray-700 bg-gray-800 text-trinity-red focus:ring-trinity-red"
                />
              </div>

              <button
                onClick={handleSaveNotifications}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-trinity-red px-6 py-2 font-medium text-white transition hover:bg-trinity-maroon disabled:opacity-50"
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










