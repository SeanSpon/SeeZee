"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreditCard,
  ExternalLink,
  Download,
  Receipt,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Settings,
} from "lucide-react";

export default function BillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [billingStats, setBillingStats] = useState({
    totalSpent: 0,
    thisMonth: 0,
    pending: 0,
    invoices: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchBillingData();
    }
  }, [status, router]);

  const fetchBillingData = async () => {
    try {
      // Fetch invoices
      const invoicesRes = await fetch("/api/client/invoices");
      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        setInvoices(invoicesData.invoices || []);
        
        // Calculate stats - invoice totals are in dollars
        const total = invoicesData.invoices?.reduce((sum: number, inv: any) => {
          if (inv.status === "paid") {
            return sum + Number(inv.total);
          }
          return sum;
        }, 0) || 0;

        const thisMonthTotal = invoicesData.invoices?.reduce((sum: number, inv: any) => {
          const invDate = new Date(inv.createdAt);
          const now = new Date();
          if (
            inv.status === "paid" &&
            invDate.getMonth() === now.getMonth() &&
            invDate.getFullYear() === now.getFullYear()
          ) {
            return sum + Number(inv.total);
          }
          return sum;
        }, 0) || 0;

        const pending = invoicesData.invoices?.reduce((sum: number, inv: any) => {
          if (inv.status === "pending" || inv.status === "overdue") {
            return sum + Number(inv.total);
          }
          return sum;
        }, 0) || 0;

        setBillingStats({
          totalSpent: total,
          thisMonth: thisMonthTotal,
          pending,
          invoices: invoicesData.invoices?.length || 0,
        });
      }

      // Fetch subscriptions (if any)
      // This would be implemented when subscription system is added
    } catch (error) {
      console.error("Failed to fetch billing data:", error);
    }
  };

  const handleBillingPortal = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const error = await response.json();
        alert(error.error || "Failed to open billing portal");
      }
    } catch (error) {
      console.error("Failed to open billing portal:", error);
      alert("Failed to open billing portal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "pending":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "overdue":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <CheckCircle2 className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-white/20 border-t-cyan-500 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-300">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Billing & Payments</h1>
            <p className="text-slate-400">Manage your billing information and payment methods</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/client/settings?tab=billing"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <button
              onClick={handleBillingPortal}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              {loading ? "Opening..." : "Billing Portal"}
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm">Total Spent</p>
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-white">${billingStats.totalSpent.toFixed(2)}</p>
            <p className="text-slate-500 text-xs mt-1">All time</p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm">This Month</p>
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-3xl font-bold text-white">${billingStats.thisMonth.toFixed(2)}</p>
            <p className="text-slate-500 text-xs mt-1">Current month</p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm">Pending</p>
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-white">${billingStats.pending.toFixed(2)}</p>
            <p className="text-slate-500 text-xs mt-1">Awaiting payment</p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm">Total Invoices</p>
              <Receipt className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{billingStats.invoices}</p>
            <p className="text-slate-500 text-xs mt-1">All invoices</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Invoices Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Receipt className="w-6 h-6 text-cyan-400" />
                  Recent Invoices
                </h2>
                <Link
                  href="/client/settings?tab=billing"
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  View all
                </Link>
              </div>

              {invoices.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-2">No invoices yet</p>
                  <p className="text-slate-500 text-sm">Your invoices will appear here once you make a purchase</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invoices.slice(0, 10).map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-all group"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${getStatusColor(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                            {invoice.description || `Invoice #${invoice.id.slice(0, 8)}`}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(invoice.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                            <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(
                              invoice.status
                            )}`}>
                              {invoice.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-white">
                          ${Number(invoice.total).toLocaleString()}
                        </span>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                          <Download className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Methods */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Payment Methods</h3>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Plus className="w-4 h-4 text-cyan-400" />
                </button>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                Manage your payment methods in the billing portal
              </p>
              <button
                onClick={handleBillingPortal}
                className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors text-sm"
              >
                Manage Payment Methods
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/client/settings?tab=billing"
                  className="block p-3 bg-slate-900/30 hover:bg-slate-900/50 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-all text-white text-sm"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-4 h-4 text-cyan-400" />
                    <span>Billing Settings</span>
                  </div>
                </Link>
                <button
                  onClick={handleBillingPortal}
                  className="w-full p-3 bg-slate-900/30 hover:bg-slate-900/50 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-all text-white text-sm text-left"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                    <span>Update Payment Method</span>
                  </div>
                </button>
                <Link
                  href="/client/settings"
                  className="block p-3 bg-slate-900/30 hover:bg-slate-900/50 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-all text-white text-sm"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>Account Settings</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20 p-6">
              <h3 className="text-lg font-bold text-white mb-2">Need Help?</h3>
              <p className="text-slate-300 text-sm mb-4">
                Have questions about billing or payments? Our support team is here to help.
              </p>
              <Link
                href="/contact"
                className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition-colors"
              >
                Contact Support →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}