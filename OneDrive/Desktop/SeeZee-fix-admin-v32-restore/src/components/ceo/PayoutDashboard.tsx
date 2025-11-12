"use client";

import { useState, useEffect } from "react";
import { DollarSign, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Payout {
  id: string;
  amount: string;
  status: string;
  task: {
    id: string;
    title: string;
    project?: {
      id: string;
      name: string;
    };
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  payoutDate?: string;
}

export function PayoutDashboard() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    loadPayouts();
  }, [statusFilter]);

  const loadPayouts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`/api/ceo/payouts?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to load payouts");
      const data = await response.json();
      setPayouts(data.payouts || []);
    } catch (error) {
      console.error("Failed to load payouts:", error);
      toast("Failed to load payouts", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayout = async (payoutId: string) => {
    if (!confirm("Process this payout? This will mark it as paid.")) return;

    try {
      const response = await fetch("/api/ceo/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutId,
          paymentMethod: "stripe", // TODO: Make this configurable
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to process payout");
      }

      toast("Payout processed successfully!", "success");
      loadPayouts();
    } catch (error: any) {
      toast(error.message || "Failed to process payout", "error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AWAITING_CLIENT_PAYMENT":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "READY":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "PAID":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "FAILED":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  const totalAmount = payouts.reduce((sum, payout) => sum + parseFloat(payout.amount), 0);
  const readyAmount = payouts
    .filter((p) => p.status === "READY")
    .reduce((sum, payout) => sum + parseFloat(payout.amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Payout Dashboard</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
        >
          <option value="">All Statuses</option>
          <option value="AWAITING_CLIENT_PAYMENT">Awaiting Client Payment</option>
          <option value="READY">Ready</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-6 rounded-lg border border-slate-700">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-sm text-slate-400">Awaiting Payment</p>
              <p className="text-2xl font-bold text-white">
                {payouts.filter((p) => p.status === "AWAITING_CLIENT_PAYMENT").length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-lg border border-slate-700">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-sm text-slate-400">Ready to Pay</p>
              <p className="text-2xl font-bold text-white">
                ${readyAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-lg border border-slate-700">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-sm text-slate-400">Total Amount</p>
              <p className="text-2xl font-bold text-white">
                ${totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {payouts.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No payouts found</p>
        </div>
      ) : (
        <div className="glass rounded-lg border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                    Worker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-slate-800/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {payout.task.title}
                        </p>
                        {payout.task.project && (
                          <p className="text-xs text-slate-400">
                            {payout.task.project.name}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-300">
                        {payout.user.name || payout.user.email}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-green-400">
                        ${payout.amount}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs border ${getStatusColor(payout.status)}`}
                      >
                        {payout.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {payout.status === "READY" && (
                        <button
                          onClick={() => handleProcessPayout(payout.id)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                        >
                          Process
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

