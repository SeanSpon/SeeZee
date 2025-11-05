"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle, CreditCard, ExternalLink, User, Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

type TabType = "profile" | "notifications" | "billing";

export default function ClientSettingsPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || "profile");
  
  // Profile state
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Notification state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [invoiceReminders, setInvoiceReminders] = useState(true);
  
  // Billing state
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loadingBilling, setLoadingBilling] = useState(false);

  useEffect(() => {
    // Set active tab from URL parameter
    if (tabParam && ["profile", "notifications", "billing"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

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
      
      // Fetch notification preferences
      fetch("/api/client/settings/notifications")
        .then((res) => res.json())
        .then((data) => {
          if (data.emailNotifications !== undefined) {
            setEmailNotifications(data.emailNotifications);
          }
          if (data.projectUpdates !== undefined) {
            setProjectUpdates(data.projectUpdates);
          }
          if (data.invoiceReminders !== undefined) {
            setInvoiceReminders(data.invoiceReminders);
          }
        })
        .catch((err) => console.error("Failed to fetch notification settings:", err));
      
      // Fetch invoices
      fetch("/api/client/invoices")
        .then((res) => res.json())
        .then((data) => {
          if (data.invoices) {
            setInvoices(data.invoices);
          }
        })
        .catch((err) => console.error("Failed to fetch invoices:", err));
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

  const handleBillingPortal = async () => {
    setLoadingBilling(true);
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error("Failed to open billing portal:", error);
    } finally {
      setLoadingBilling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "pending":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "overdue":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Settings</h1>
          <p className="admin-page-subtitle">
            Manage your account preferences and billing
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
                  ? "border-cyan-500 text-cyan-400"
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
                  ? "border-cyan-500 text-cyan-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Bell className="w-4 h-4" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab("billing")}
              className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-all ${
                activeTab === "billing"
                  ? "border-cyan-500 text-cyan-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Billing
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
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  required
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
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
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
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
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
              <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-colors group">
                <div>
                  <p className="text-white font-medium group-hover:text-cyan-400 transition-colors">
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
                  className="w-5 h-5 rounded border-white/20 bg-slate-800 checked:bg-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-colors group">
                <div>
                  <p className="text-white font-medium group-hover:text-cyan-400 transition-colors">
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
                  className="w-5 h-5 rounded border-white/20 bg-slate-800 checked:bg-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-colors group">
                <div>
                  <p className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                    Invoice Reminders
                  </p>
                  <p className="text-sm text-slate-400">
                    Receive reminders about upcoming payments
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={invoiceReminders}
                  onChange={(e) => setInvoiceReminders(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 bg-slate-800 checked:bg-cyan-500"
                />
              </div>

              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    const response = await fetch("/api/client/settings/notifications", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        emailNotifications,
                        projectUpdates,
                        invoiceReminders,
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
                }}
                disabled={loading}
                className="w-full px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
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

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <div className="flex items-start justify-between p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Billing Portal
                  </h3>
                  <p className="text-slate-300 text-sm mb-4">
                    Manage your payment methods, view invoices, and update billing information
                  </p>
                  <button
                    onClick={handleBillingPortal}
                    disabled={loadingBilling}
                    className="px-4 py-2 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-all font-medium flex items-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    <CreditCard className="w-4 h-4" />
                    {loadingBilling ? "Opening..." : "Open Billing Portal"}
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
                <CreditCard className="w-12 h-12 text-cyan-400" />
              </div>

              {/* Recent Invoices */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Recent Invoices</h3>
                {invoices.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No invoices yet</p>
                ) : (
                  <div className="space-y-3">
                    {invoices.slice(0, 5).map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-colors"
                      >
                        <div>
                          <p className="text-white font-medium">{invoice.description}</p>
                          <p className="text-sm text-slate-400">
                            {new Date(invoice.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-white">
                            ${(invoice.amount / 100).toFixed(2)}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                              invoice.status
                            )}`}
                          >
                            {invoice.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
