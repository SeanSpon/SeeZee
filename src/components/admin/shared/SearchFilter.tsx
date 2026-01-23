"use client";

import { useState, useEffect, useCallback } from "react";
import { FiSearch, FiX, FiFilter } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

interface FilterOption {
  label: string;
  value: string;
}

interface Filter {
  id: string;
  label: string;
  options: FilterOption[];
}

interface SearchFilterProps {
  searchPlaceholder?: string;
  onSearchChange: (query: string) => void;
  filters?: Filter[];
  onFilterChange?: (filterId: string, value: string) => void;
  activeFilters?: Record<string, string>;
}

export function SearchFilter({
  searchPlaceholder = "Search...",
  onSearchChange,
  filters = [],
  onFilterChange,
  activeFilters = {},
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    onSearchChange(debouncedQuery);
  }, [debouncedQuery, onSearchChange]);

  const activeFilterCount = Object.values(activeFilters).filter(
    (v) => v && v !== "all"
  ).length;

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-11 pr-10 py-2.5 rounded-lg border border-white/[0.08] bg-slate-900/50 text-white placeholder:text-slate-500 focus:border-white/[0.15] focus:outline-none transition-colors text-sm"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-slate-500 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        {filters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all text-sm ${
              showFilters || activeFilterCount > 0
                ? "border-sky-500/30 bg-sky-500/10 text-sky-400"
                : "border-white/[0.08] bg-slate-900/50 text-slate-400 hover:border-white/[0.15] hover:text-white"
            }`}
          >
            <FiFilter className="h-4 w-4" />
            <span className="font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded bg-sky-500 text-white text-xs font-semibold">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && filters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filters.map((filter) => (
                  <div key={filter.id}>
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
                      {filter.label}
                    </label>
                    <select
                      value={activeFilters[filter.id] || "all"}
                      onChange={(e) =>
                        onFilterChange?.(filter.id, e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg border border-white/[0.08] bg-slate-900/50 text-white text-sm focus:border-white/[0.15] focus:outline-none transition-colors"
                    >
                      <option value="all">All {filter.label}</option>
                      {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <button
                  onClick={() => {
                    filters.forEach((filter) => {
                      onFilterChange?.(filter.id, "all");
                    });
                  }}
                  className="mt-4 text-sm text-sky-400 hover:text-sky-300 transition-colors font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
















