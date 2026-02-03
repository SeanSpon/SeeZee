"use client";

import { useState } from "react";
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiAlertCircle, 
  FiCreditCard,
  FiRefreshCw,
  FiFileText,
  FiUsers,
  FiArrowRight,
  FiDownload,
  FiPlus
} from "react-icons/fi";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface FinanceMetrics {
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  last30DaysRevenue: number;
  revenueGrowth: number;
  outstandingAmount: number;
  overdueAmount: number;
  totalInvoices: number;
  paidInvoices: number;
  outstandingInvoices: number;
  overdueInvoices: number;
  totalPayments: number;
  averagePaymentValue: number;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  revenueVsExpenses: Array<{ month: string; revenue: number; expenses: number; profit: number }>;
  // Expense metrics
  thisMonthExpenses?: number;
  lastMonthExpenses?: number;
  totalExpenses?: number;
  thisMonthNetProfit?: number;
  lastMonthNetProfit?: number;
  totalNetProfit?: number;
  availableFunds?: number;
}

interface RecentExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  vendor: string | null;
  status: string;
  expenseDate: string;
  isRecurring: boolean;
}

interface RecentInvoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  status: string;
  dueDate: string | null;
  createdAt: string;
}

interface RecentPayment {
  id: string;
  amount: number;
  client: string;
  invoiceNumber: string;
  date: string;
  method: string;
}

interface Subscription {
  id: string;
  client: string;
  project: string;
  amount: number;
  status: string;
  billingCycle: string;
  nextBillingDate: string | null;
}

interface FinanceOverviewProps {
  metrics: FinanceMetrics;
  recentInvoices: RecentInvoice[];
  recentPayments: RecentPayment[];
  recentExpenses?: RecentExpense[];
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
    case "paid": return "text-green-400";
    case "sent": return "text-blue-400";
    case "overdue": return "text-red-400";
    case "draft": return "text-gray-400";
    case "active": return "text-green-400";
    case "canceled": return "text-red-400";
    default: return "text-gray-400";
  }
};

export function FinanceOverview({ 
  metrics, 
  recentInvoices, 
  recentPayments, 
  recentExpenses = []
}: FinanceOverviewProps) {
  const [timeframe, setTimeframe] = useState<"30d" | "month" | "all">("month");
  const [chartTimeframe, setChartTimeframe] = useState<"3m" | "6m" | "12m">("6m");
  const [chartType, setChartType] = useState<"line" | "bar" | "area">("area");

  // Select revenue based on timeframe
  const displayRevenue = timeframe === "30d" 
    ? metrics.last30DaysRevenue 
    : timeframe === "month" 
    ? metrics.thisMonthRevenue 
    : metrics.totalRevenue;

  // Select expenses based on timeframe
  const displayExpenses = timeframe === "month" 
    ? metrics.thisMonthExpenses || 0
    : metrics.totalExpenses || 0;

  // Select net profit based on timeframe
  const displayNetProfit = timeframe === "month"
    ? metrics.thisMonthNetProfit || 0
    : metrics.totalNetProfit || 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Finance Overview</h1>
          <p className="text-gray-400 mt-1">
            Complete financial dashboard and metrics
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/finance/transactions"
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-white flex items-center gap-2"
          >
            <FiFileText className="w-4 h-4" />
            View All Transactions
          </Link>
          <Link
            href="/admin/finance/transactions?tab=invoices&action=new"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors text-white flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            New Invoice
          </Link>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <FiDollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="text-xs bg-white/5 border border-white/10 rounded px-2 py-1 text-gray-300"
            >
              <option value="30d">Last 30 Days</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <h3 className="text-2xl font-bold text-white">
            {formatCurrency(displayRevenue)}
          </h3>
          <p className="text-gray-400 text-sm mt-1">Revenue</p>
          {timeframe === "month" && (
            <div className="flex items-center gap-1 mt-2">
              <FiTrendingUp className={`w-3 h-3 ${metrics.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`} />
              <span className={`text-xs ${metrics.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metrics.revenueGrowth >= 0 ? '+' : ''}{metrics.revenueGrowth.toFixed(1)}% from last month
              </span>
            </div>
          )}
        </motion.div>

        {/* Expenses */}
        {metrics.thisMonthExpenses !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <FiAlertCircle className="w-5 h-5 text-red-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white">
              {formatCurrency(displayExpenses)}
            </h3>
            <p className="text-gray-400 text-sm mt-1">Expenses</p>
            {timeframe === "month" && metrics.lastMonthExpenses && (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs text-gray-400">
                  vs {formatCurrency(metrics.lastMonthExpenses)}
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Net Profit */}
        {metrics.thisMonthNetProfit !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`bg-gradient-to-br ${displayNetProfit >= 0 ? 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30' : 'from-orange-500/20 to-orange-600/10 border-orange-500/30'} border rounded-xl p-6`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 ${displayNetProfit >= 0 ? 'bg-cyan-500/20' : 'bg-orange-500/20'} rounded-lg`}>
                <FiTrendingUp className={`w-5 h-5 ${displayNetProfit >= 0 ? 'text-cyan-400' : 'text-orange-400'}`} />
              </div>
            </div>
            <h3 className={`text-2xl font-bold ${displayNetProfit >= 0 ? 'text-cyan-400' : 'text-orange-400'}`}>
              {formatCurrency(displayNetProfit)}
            </h3>
            <p className="text-gray-400 text-sm mt-1">Net Profit</p>
            <div className="text-xs text-gray-400 mt-2">
              Revenue - Expenses
            </div>
          </motion.div>
        )}

        {/* Outstanding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <FiAlertCircle className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-xs text-gray-400">{metrics.outstandingInvoices} invoices</span>
          </div>
          <h3 className="text-2xl font-bold text-white">
            {formatCurrency(metrics.outstandingAmount)}
          </h3>
          <p className="text-gray-400 text-sm mt-1">Outstanding</p>
          {metrics.overdueAmount > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <FiAlertCircle className="w-3 h-3 text-red-400" />
              <span className="text-xs text-red-400">
                {formatCurrency(metrics.overdueAmount)} overdue
              </span>
            </div>
          )}
        </motion.div>


        {/* Available Funds (NEW) */}
        {metrics.availableFunds !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <FiCreditCard className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white">
              {formatCurrency(metrics.availableFunds)}
            </h3>
            <p className="text-gray-400 text-sm mt-1">Available Funds</p>
            <div className="text-xs text-gray-400 mt-2">
              Current money on hand
            </div>
          </motion.div>
        )}
      </div>

      {/* Revenue vs Expenses Chart */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Revenue vs Expenses</h2>
          <div className="flex gap-2">
            {/* Chart Type Selector */}
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
              <button
                onClick={() => setChartType("area")}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  chartType === "area" 
                    ? "bg-emerald-500/20 text-emerald-400" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Area
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  chartType === "line" 
                    ? "bg-emerald-500/20 text-emerald-400" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType("bar")}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  chartType === "bar" 
                    ? "bg-emerald-500/20 text-emerald-400" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Bar
              </button>
            </div>
            
            {/* Timeline Selector */}
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
              <button
                onClick={() => setChartTimeframe("3m")}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  chartTimeframe === "3m" 
                    ? "bg-blue-500/20 text-blue-400" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                3M
              </button>
              <button
                onClick={() => setChartTimeframe("6m")}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  chartTimeframe === "6m" 
                    ? "bg-blue-500/20 text-blue-400" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                6M
              </button>
              <button
                onClick={() => setChartTimeframe("12m")}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  chartTimeframe === "12m" 
                    ? "bg-blue-500/20 text-blue-400" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                12M
              </button>
            </div>
          </div>
        </div>

        {metrics.revenueVsExpenses.length > 0 ? (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "area" ? (
                <AreaChart 
                  data={metrics.revenueVsExpenses.slice(
                    chartTimeframe === "3m" ? -3 : chartTimeframe === "6m" ? -6 : 0
                  )}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#94a3b8" 
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155', 
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                    labelStyle={{ color: '#e2e8f0', fontWeight: 'bold', marginBottom: '8px' }}
                    formatter={(value: number, name: string) => {
                      const label = name === 'revenue' ? 'Revenue' : 
                                   name === 'expenses' ? 'Expenses' : 'Net Profit';
                      return [formatCurrency(value), label];
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => {
                      return value === 'revenue' ? 'Revenue' : 
                             value === 'expenses' ? 'Expenses' : 'Net Profit';
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    fill="url(#colorExpenses)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    fill="url(#colorProfit)"
                  />
                </AreaChart>
              ) : chartType === "line" ? (
                <LineChart 
                  data={metrics.revenueVsExpenses.slice(
                    chartTimeframe === "3m" ? -3 : chartTimeframe === "6m" ? -6 : 0
                  )}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#94a3b8" 
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155', 
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                    labelStyle={{ color: '#e2e8f0', fontWeight: 'bold', marginBottom: '8px' }}
                    formatter={(value: number, name: string) => {
                      const label = name === 'revenue' ? 'Revenue' : 
                                   name === 'expenses' ? 'Expenses' : 'Net Profit';
                      return [formatCurrency(value), label];
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => {
                      return value === 'revenue' ? 'Revenue' : 
                             value === 'expenses' ? 'Expenses' : 'Net Profit';
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              ) : (
                <BarChart 
                  data={metrics.revenueVsExpenses.slice(
                    chartTimeframe === "3m" ? -3 : chartTimeframe === "6m" ? -6 : 0
                  )}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#94a3b8" 
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155', 
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                    labelStyle={{ color: '#e2e8f0', fontWeight: 'bold', marginBottom: '8px' }}
                    formatter={(value: number, name: string) => {
                      const label = name === 'revenue' ? 'Revenue' : 
                                   name === 'expenses' ? 'Expenses' : 'Net Profit';
                      return [formatCurrency(value), label];
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => {
                      return value === 'revenue' ? 'Revenue' : 
                             value === 'expenses' ? 'Expenses' : 'Net Profit';
                    }}
                  />
                  <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="profit" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <FiTrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-sm">No financial data yet</p>
              <p className="text-xs text-gray-500 mt-1">Create and mark invoices as paid to see trends</p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Invoices</h2>
            <Link
              href="/admin/finance/transactions?tab=invoices"
              className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              View All <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentInvoices.slice(0, 5).map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">{invoice.number}</span>
                    <span className={`text-xs ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{invoice.client}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold text-sm">{formatCurrency(invoice.amount)}</p>
                  {invoice.dueDate && (
                    <p className="text-xs text-gray-400">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Payments</h2>
            <Link
              href="/admin/finance/transactions?tab=payments"
              className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              View All <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentPayments.slice(0, 5).map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FiCreditCard className="w-4 h-4 text-green-400" />
                    <span className="text-white font-medium text-sm">{payment.client}</span>
                  </div>
                  <p className="text-xs text-gray-400">{payment.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold text-sm">{formatCurrency(payment.amount)}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(payment.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Expenses</h2>
            <Link
              href="/admin/finance/expenses"
              className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              View All <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentExpenses.length > 0 ? (
              recentExpenses.slice(0, 5).map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FiAlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-white font-medium text-sm">{expense.name}</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {expense.vendor || expense.category} • {expense.isRecurring ? 'Recurring' : 'One-time'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-semibold text-sm">-{formatCurrency(expense.amount)}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(expense.expenseDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <FiAlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-sm">No expenses tracked yet</p>
                <Link href="/admin/finance/expenses" className="text-xs text-red-400 hover:text-red-300 mt-2 inline-block">
                  Add your first expense →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          href="/admin/finance/transactions?tab=invoices&action=new"
          className="p-6 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-xl hover:border-emerald-500/50 transition-colors group"
        >
          <FiPlus className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-semibold text-white mb-1">Create Invoice</h3>
          <p className="text-sm text-gray-400">Generate a new invoice for clients</p>
        </Link>
        
        <Link
          href="/admin/finance/transactions?tab=payments"
          className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl hover:border-blue-500/50 transition-colors group"
        >
          <FiCreditCard className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-semibold text-white mb-1">Record Payment</h3>
          <p className="text-sm text-gray-400">Log a new payment received</p>
        </Link>
        
        <Link
          href="/admin/finance/expenses"
          className="p-6 bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-xl hover:border-red-500/50 transition-colors group"
        >
          <FiDollarSign className="w-8 h-8 text-red-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-semibold text-white mb-1">Track Expenses</h3>
          <p className="text-sm text-gray-400">Manage Vercel, Cursor, and more</p>
        </Link>
        
        <button
          onClick={() => window.print()}
          className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl hover:border-purple-500/50 transition-colors group text-left"
        >
          <FiDownload className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-semibold text-white mb-1">Export Report</h3>
          <p className="text-sm text-gray-400">Download financial reports</p>
        </button>
      </div>
    </div>
  );
}
