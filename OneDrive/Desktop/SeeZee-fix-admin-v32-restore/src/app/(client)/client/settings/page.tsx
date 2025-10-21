"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle } from "lucide-react";
import { useSession } from "next-auth/react";

export default function ClientSettingsPage() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      // Fetch additional user data
      fetch("/api/client/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.profile) {
            setCompany(data.profile.company || "");
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
        body: JSON.stringify({ name, company, phone }),
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

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-slate-400 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Profile Settings */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Profile Information</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Your company name"
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Your phone number"
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {success ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Saved Successfully!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save Changes"}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Notifications</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-5 h-5" defaultChecked />
            <span className="text-white">Email me about project updates</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-5 h-5" defaultChecked />
            <span className="text-white">Email me about new messages</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-5 h-5" />
            <span className="text-white">Email me about invoices</span>
          </label>
        </div>
      </div>
    </div>
  );
}
