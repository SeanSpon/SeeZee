"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiExternalLink,
  FiRepeat,
  FiCalendar,
  FiPieChart,
  FiBarChart2,
  FiList,
  FiGrid,
} from "react-icons/fi";
import { AddExpenseModal } from "./AddExpenseModal";

interface Expense {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  category: string;
  status: string;
  vendor: string | null;
  isRecurring: boolean;
  frequency: string | null;
  nextDueDate: string | null;
  expenseDate: string;
  paidAt: string | null;
  receiptUrl: string | null;
  notes: string | null;
  tags: string[];
  createdAt: string;
}

interface ExpenseStats {
  overview: {
    thisMonthTotal: number;
    lastMonthTotal: number;
    thisYearTotal: number;
    totalMonthlyRecurring: number;
    monthOverMonthGrowth: number;
    totalExpenseCount: number;
    recurringExpenseCount: number;
  };
  byCategoryThisMonth: Record<string, number>;
  byVendorThisMonth: Record<string, number>;
  monthlyTrend: Array<{ month: string; total: number; count: number }>;
  topVendors: Array<{ vendor: string; amount: number }>;
  categoryBreakdown: Array<{ category: string; amount: number }>;
  upcomingRecurring: Expense[];
}

const CATEGORY_COLORS: Record<string, string> = {
  SOFTWARE: "#3b82f6",
  HOSTING: "#8b5cf6",
  TOOLS: "#10b981",
  MARKETING: "#f59e0b",
  SUBSCRIPTIONS: "#06b6d4",
  OFFICE: "#6366f1",
  PAYROLL: "#ec4899",
  UTILITIES: "#84cc16",
  TRAVEL: "#f97316",
  MEALS: "#14b8a6",
  EQUIPMENT: "#a855f7",
  LEGAL: "#64748b",
  INSURANCE: "#0ea5e9",
  EDUCATION: "#22c55e",
  OTHER: "#6b7280",
};

const CATEGORY_ICONS: Record<string, string> = {
  SOFTWARE: "💻",
  HOSTING: "🌐",
  TOOLS: "🛠️",
  MARKETING: "📣",
  SUBSCRIPTIONS: "🔄",
  OFFICE: "📎",
  PAYROLL: "👥",
  UTILITIES: "⚡",
  TRAVEL: "✈️",
  MEALS: "🍔",
  EQUIPMENT: "🖥️",
  LEGAL: "⚖️",
  INSURANCE: "🛡️",
  EDUCATION: "📚",
  OTHER: "📦",
};

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Simple bar chart component
function BarChart({ data, maxValue }: { data: Array<{ label: string; value: number; color: string }>; maxValue: number }) {
  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">{item.label}</span>
            <span className="text-white font-medium">{formatCurrency(item.value)}</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / maxValue) * 100}%` }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="h-full rounded-full"
              style={{ backgroundColor: item.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Simple donut chart component
function DonutChart({ data, total }: { data: Array<{ label: string; value: number; color: string }>; total: number }) {
  let currentAngle = 0;
  const segments = data.map((item) => {
    const angle = (item.value / total) * 360;
    const segment = {
      ...item,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
    };
    currentAngle += angle;
    return segment;
  });

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {segments.map((segment, i) => {
            const start = (segment.startAngle * Math.PI) / 180;
            const end = (segment.endAngle * Math.PI) / 180;
            const largeArc = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
            
            const x1 = 50 + 40 * Math.cos(start);
            const y1 = 50 + 40 * Math.sin(start);
            const x2 = 50 + 40 * Math.cos(end);
            const y2 = 50 + 40 * Math.sin(end);
            
            return (
              <path
                key={i}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={segment.color}
                className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
              />
            );
          })}
          <circle cx="50" cy="50" r="25" fill="#0f172a" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xs text-gray-400">Total</div>
            <div className="text-sm font-bold text-white">{formatCurrency(total)}</div>
          </div>
        </div>
      </div>
      <div className="space-y-2 flex-1">
        {data.slice(0, 5).map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-400 flex-1">{item.label}</span>
            <span className="text-white">{formatCurrency(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Monthly trend line chart
function TrendChart({ data }: { data: Array<{ month: string; total: number }> }) {
  const maxValue = Math.max(...data.map((d) => d.total), 1);
  const height = 120;
  const width = 100;
  
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - (d.total / maxValue) * height,
  }));

  const pathD = points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    return `${acc} L ${point.x} ${point.y}`;
  }, "");

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height + 20}`} className="w-full h-32">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1="0"
            y1={height - ratio * height}
            x2={width}
            y2={height - ratio * height}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="0.5"
          />
        ))}
        
        {/* Line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
        
        {/* Gradient */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        
        {/* Points */}
        {points.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill="#dc2626"
              className="cursor-pointer"
            />
            <text
              x={point.x}
              y={height + 15}
              textAnchor="middle"
              className="text-[6px] fill-gray-500"
            >
              {data[i].month.slice(0, 3)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function ExpenseManager() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [activeTab, setActiveTab] = useState<"expenses" | "analytics">("expenses");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [expensesRes, statsRes] = await Promise.all([
        fetch("/api/admin/expenses"),
        fetch("/api/admin/expenses/stats"),
      ]);

      const expensesData = await expensesRes.json();
      const statsData = await statsRes.json();

      if (expensesRes.ok) setExpenses(expensesData.expenses || []);
      if (statsRes.ok) setStats(statsData);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      const res = await fetch(`/api/admin/expenses/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(expenses.map((e) => e.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Expense Tracker</h2>
          <p className="text-gray-400">
            Track and manage all your business expenses
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            title="Refresh"
          >
            <FiRefreshCw className={`w-5 h-5 text-gray-400 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              setEditExpense(null);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <FiDollarSign className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-xs text-gray-400">This Month</span>
            </div>
            <h3 className="text-2xl font-bold text-white">
              {formatCurrency(stats.overview.thisMonthTotal)}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              {stats.overview.monthOverMonthGrowth >= 0 ? (
                <FiTrendingUp className="w-3 h-3 text-red-400" />
              ) : (
                <FiTrendingDown className="w-3 h-3 text-green-400" />
              )}
              <span className={`text-xs ${stats.overview.monthOverMonthGrowth >= 0 ? "text-red-400" : "text-green-400"}`}>
                {stats.overview.monthOverMonthGrowth >= 0 ? "+" : ""}
                {stats.overview.monthOverMonthGrowth.toFixed(1)}% vs last month
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FiRepeat className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs text-gray-400">{stats.overview.recurringExpenseCount} recurring</span>
            </div>
            <h3 className="text-2xl font-bold text-white">
              {formatCurrency(stats.overview.totalMonthlyRecurring)}
            </h3>
            <p className="text-xs text-gray-400 mt-1">Monthly Recurring</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <FiCalendar className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-xs text-gray-400">YTD</span>
            </div>
            <h3 className="text-2xl font-bold text-white">
              {formatCurrency(stats.overview.thisYearTotal)}
            </h3>
            <p className="text-xs text-gray-400 mt-1">Year to Date</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <FiList className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white">
              {stats.overview.totalExpenseCount}
            </h3>
            <p className="text-xs text-gray-400 mt-1">Total Expenses</p>
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab("expenses")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === "expenses"
              ? "bg-red-500/20 text-red-400"
              : "text-gray-400 hover:bg-white/5"
          }`}
        >
          <FiList className="w-4 h-4" />
          Expenses
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === "analytics"
              ? "bg-red-500/20 text-red-400"
              : "text-gray-400 hover:bg-white/5"
          }`}
        >
          <FiPieChart className="w-4 h-4" />
          Analytics
        </button>
      </div>

      {activeTab === "expenses" && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search expenses, vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-red-500/50 transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-red-500/50 transition-colors"
              >
                <option value="all" className="bg-gray-900">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-gray-900">
                    {CATEGORY_ICONS[cat]} {cat}
                  </option>
                ))}
              </select>
              <div className="flex bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 transition-colors ${
                    viewMode === "list" ? "bg-red-500/20 text-red-400" : "text-gray-400"
                  }`}
                >
                  <FiList className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 transition-colors ${
                    viewMode === "grid" ? "bg-red-500/20 text-red-400" : "text-gray-400"
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Expenses List/Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
              <FiDollarSign className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No expenses found</h3>
              <p className="text-gray-400 mb-4">
                {searchQuery || categoryFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Start tracking your business expenses"}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Add Your First Expense
              </button>
            </div>
          ) : viewMode === "list" ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr className="text-left text-sm text-gray-400">
                    <th className="p-4">Expense</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Vendor</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <motion.tr
                      key={expense.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">
                            {CATEGORY_ICONS[expense.category] || "📦"}
                          </span>
                          <div>
                            <p className="text-white font-medium flex items-center gap-2">
                              {expense.name}
                              {expense.isRecurring && (
                                <FiRepeat className="w-3 h-3 text-blue-400" />
                              )}
                            </p>
                            {expense.description && (
                              <p className="text-xs text-gray-500 truncate max-w-xs">
                                {expense.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${CATEGORY_COLORS[expense.category]}20`,
                            color: CATEGORY_COLORS[expense.category],
                          }}
                        >
                          {expense.category}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300">{expense.vendor || "-"}</td>
                      <td className="p-4 text-gray-400 text-sm">
                        {formatDate(expense.expenseDate)}
                      </td>
                      <td className="p-4 text-right text-white font-medium">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          {expense.receiptUrl && (
                            <a
                              href={expense.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                              title="View Receipt"
                            >
                              <FiExternalLink className="w-4 h-4 text-gray-400" />
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setEditExpense(expense);
                              setShowAddModal(true);
                            }}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExpenses.map((expense) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-red-500/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {CATEGORY_ICONS[expense.category] || "📦"}
                      </span>
                      <div>
                        <p className="text-white font-medium flex items-center gap-2">
                          {expense.name}
                          {expense.isRecurring && (
                            <FiRepeat className="w-3 h-3 text-blue-400" />
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{expense.vendor || expense.category}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditExpense(expense);
                          setShowAddModal(true);
                        }}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <FiEdit2 className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="text-xs text-gray-500">{formatDate(expense.expenseDate)}</div>
                    <div className="text-xl font-bold text-white">
                      {formatCurrency(expense.amount)}
                    </div>
                  </div>
                  {expense.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {expense.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-white/5 text-gray-400 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "analytics" && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <FiBarChart2 className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-semibold text-white">Monthly Trend</h3>
            </div>
            <TrendChart data={stats.monthlyTrend} />
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
              {stats.monthlyTrend.slice(-3).map((month) => (
                <div key={month.month} className="text-center">
                  <p className="text-xs text-gray-500">{month.month}</p>
                  <p className="text-sm font-medium text-white">{formatCurrency(month.total)}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <FiPieChart className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">By Category (This Month)</h3>
            </div>
            <DonutChart
              data={Object.entries(stats.byCategoryThisMonth).map(([category, amount]) => ({
                label: category,
                value: amount,
                color: CATEGORY_COLORS[category] || "#6b7280",
              }))}
              total={stats.overview.thisMonthTotal}
            />
          </motion.div>

          {/* Top Vendors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <FiTrendingUp className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Top Vendors</h3>
            </div>
            <BarChart
              data={stats.topVendors.slice(0, 6).map((v, i) => ({
                label: v.vendor,
                value: v.amount,
                color: Object.values(CATEGORY_COLORS)[i % Object.values(CATEGORY_COLORS).length],
              }))}
              maxValue={Math.max(...stats.topVendors.map((v) => v.amount), 1)}
            />
          </motion.div>

          {/* Upcoming Recurring */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <FiRepeat className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Upcoming Recurring</h3>
            </div>
            {stats.upcomingRecurring.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming recurring expenses</p>
            ) : (
              <div className="space-y-3">
                {stats.upcomingRecurring.slice(0, 5).map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span>{CATEGORY_ICONS[expense.category]}</span>
                      <div>
                        <p className="text-white text-sm">{expense.name}</p>
                        <p className="text-xs text-gray-500">{expense.vendor}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{formatCurrency(expense.amount)}</p>
                      <p className="text-xs text-gray-500">
                        {expense.nextDueDate ? formatDate(expense.nextDueDate) : expense.frequency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditExpense(null);
        }}
        onSuccess={fetchData}
        editExpense={editExpense}
      />
    </div>
  );
}
