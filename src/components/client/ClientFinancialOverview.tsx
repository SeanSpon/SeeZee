"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FiDollarSign,
  FiCreditCard,
  FiCalendar,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
} from "react-icons/fi";

interface ClientFinancialData {
  totalSpent: number; // Total amount spent with the business
  thisMonthSpent: number; // Amount spent this month
  pendingPayments: number; // Unpaid invoices
  nextPaymentDue: Date | null;
  activeSubscription: boolean;
  subscriptionAmount: number;
  recentInvoices: Array<{
    id: string;
    number: string;
    title: string;
    amount: number;
    status: string;
    dueDate: Date;
    paidAt: Date | null;
  }>;
}

interface ClientFinancialOverviewProps {
  data: ClientFinancialData;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "sent":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "overdue":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "draft":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

export function ClientFinancialOverview({ data }: ClientFinancialOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <FiDollarSign className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white">
            {formatCurrency(data.totalSpent)}
          </h3>
          <p className="text-gray-400 text-sm mt-1">Total Invested</p>
          <p className="text-xs text-gray-500 mt-1">All-time spending</p>
        </motion.div>

        {/* This Month */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <FiCalendar className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white">
            {formatCurrency(data.thisMonthSpent)}
          </h3>
          <p className="text-gray-400 text-sm mt-1">This Month</p>
          <p className="text-xs text-gray-500 mt-1">Current period</p>
        </motion.div>

        {/* Pending Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`bg-gradient-to-br ${
            data.pendingPayments > 0
              ? "from-orange-500/10 to-orange-600/5 border-orange-500/20"
              : "from-gray-500/10 to-gray-600/5 border-gray-500/20"
          } border rounded-xl p-6`}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className={`p-2 rounded-lg ${
                data.pendingPayments > 0
                  ? "bg-orange-500/10"
                  : "bg-gray-500/10"
              }`}
            >
              <FiAlertCircle
                className={`w-5 h-5 ${
                  data.pendingPayments > 0 ? "text-orange-400" : "text-gray-400"
                }`}
              />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white">
            {formatCurrency(data.pendingPayments)}
          </h3>
          <p className="text-gray-400 text-sm mt-1">Pending Payments</p>
          {data.nextPaymentDue && (
            <p className="text-xs text-orange-400 mt-1">
              Due {new Date(data.nextPaymentDue).toLocaleDateString()}
            </p>
          )}
        </motion.div>

        {/* Active Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`bg-gradient-to-br ${
            data.activeSubscription
              ? "from-purple-500/10 to-purple-600/5 border-purple-500/20"
              : "from-gray-500/10 to-gray-600/5 border-gray-500/20"
          } border rounded-xl p-6`}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className={`p-2 rounded-lg ${
                data.activeSubscription
                  ? "bg-purple-500/10"
                  : "bg-gray-500/10"
              }`}
            >
              <FiCreditCard
                className={`w-5 h-5 ${
                  data.activeSubscription ? "text-purple-400" : "text-gray-400"
                }`}
              />
            </div>
            {data.activeSubscription && (
              <FiCheckCircle className="w-4 h-4 text-green-400" />
            )}
          </div>
          <h3 className="text-2xl font-bold text-white">
            {data.activeSubscription
              ? formatCurrency(data.subscriptionAmount)
              : "—"}
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            {data.activeSubscription ? "Subscription" : "No Subscription"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {data.activeSubscription ? "Monthly plan" : "Upgrade available"}
          </p>
        </motion.div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Recent Invoices</h2>
            <p className="text-sm text-gray-400 mt-1">Your payment history</p>
          </div>
          <Link
            href="/client/invoices"
            className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
          >
            View All <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {data.recentInvoices.length > 0 ? (
            data.recentInvoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/client/invoices/${invoice.id}`}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-medium">{invoice.title}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-gray-400">Invoice #{invoice.number}</p>
                    {invoice.status === "PAID" && invoice.paidAt && (
                      <p className="text-xs text-green-400">
                        • Paid {new Date(invoice.paidAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-white font-semibold text-lg">
                    {formatCurrency(invoice.amount)}
                  </p>
                  {invoice.status !== "PAID" && (
                    <p className="text-xs text-gray-400">
                      Due {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <FiArrowRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors ml-4" />
              </Link>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <FiDollarSign className="w-12 h-12 mx-auto mb-2 text-gray-600" />
              <p className="text-sm">No invoices yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {data.pendingPayments > 0 && (
        <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 border border-orange-500/30 rounded-xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <FiAlertCircle className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Payment Required
                </h3>
                <p className="text-sm text-gray-300">
                  You have {formatCurrency(data.pendingPayments)} in pending payments.
                  {data.nextPaymentDue && (
                    <> Next payment due on{" "}
                      {new Date(data.nextPaymentDue).toLocaleDateString()}.
                    </>
                  )}
                </p>
              </div>
            </div>
            <Link
              href="/client/invoices"
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors text-white font-medium whitespace-nowrap"
            >
              Pay Now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
