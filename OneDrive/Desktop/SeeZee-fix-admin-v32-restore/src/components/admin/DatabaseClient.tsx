"use client";

/**
 * Database Client Component
 * Provides a simple interface to browse database models
 */

import { useState, useEffect } from "react";
import { SectionCard } from "@/components/admin/SectionCard";
import { Database, Table, Eye, Search, RefreshCw, Loader2 } from "lucide-react";
import { query, getModelCount } from "@/server/actions/database";

interface DatabaseClientProps {
  models: string[];
}

export function DatabaseClient({ models }: DatabaseClientProps) {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recordCount, setRecordCount] = useState(0);

  // Fetch records when model is selected
  useEffect(() => {
    if (!selectedModel) return;

    const fetchRecords = async () => {
      setLoading(true);
      try {
        const [dataResult, countResult] = await Promise.all([
          query(selectedModel, 50),
          getModelCount(selectedModel)
        ]);
        
        if (dataResult.success) {
          setRecords(dataResult.data || []);
        }
        
        if (countResult.success) {
          setRecordCount(countResult.count);
        }
      } catch (error) {
        console.error("Failed to fetch records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [selectedModel]);

  const handleRefresh = () => {
    if (selectedModel) {
      setSelectedModel(null);
      setTimeout(() => setSelectedModel(selectedModel), 0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-3 relative">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red glow-on-hover inline-block mb-2">
          System Database
        </span>
        <h1 className="text-4xl font-heading font-bold gradient-text">Database Browser</h1>
        <p className="max-w-2xl text-base text-gray-300 leading-relaxed">
          Browse and inspect database models (Admin+ only)
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Models List */}
        <div className="lg:col-span-1">
          <div className="glass-effect rounded-2xl border-2 border-gray-700 p-6 hover:border-trinity-red/30 transition-all duration-300 h-fit">
            <h2 className="text-xl font-heading font-semibold text-white mb-4">Available Models</h2>
            <div className="space-y-2">
              {models.map((model) => (
                <button
                  key={model}
                  onClick={() => setSelectedModel(model)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                    selectedModel === model
                      ? "glass-effect border-trinity-red/50 text-trinity-red hover:shadow-medium"
                      : "glass-effect border-gray-700 text-gray-300 hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Table className="h-4 w-4" />
                    <span className="font-medium capitalize">{model}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Model Details */}
        <div className="lg:col-span-2">
          {selectedModel ? (
            <div className="glass-effect rounded-2xl border-2 border-gray-700 p-6 hover:border-trinity-red/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-heading font-semibold text-white capitalize">
                  {selectedModel}
                </h2>
                <button
                  onClick={handleRefresh}
                  className="p-2 rounded-lg border border-gray-700 bg-gray-800/50 hover:border-trinity-red/50 hover:bg-gray-700 transition-colors"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 text-gray-400 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 text-purple-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-400">Loading records...</p>
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No records found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    The {selectedModel} table is empty
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-400 pb-2 border-b border-white/10">
                    <span>Showing {records.length} of {recordCount} total records</span>
                  </div>
                  
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {records.map((record, idx) => (
                      <div
                        key={record.id || idx}
                        className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                      >
                        <div className="grid grid-cols-1 gap-2">
                          {Object.entries(record).map(([key, value]) => {
                            // Skip rendering complex objects or null values
                            if (value === null || typeof value === 'object') {
                              if (value instanceof Date) {
                                return (
                                  <div key={key} className="flex justify-between text-sm">
                                    <span className="text-gray-400 font-medium">{key}:</span>
                                    <span className="text-gray-300">{new Date(value).toLocaleString()}</span>
                                  </div>
                                );
                              }
                              return null;
                            }
                            
                            return (
                              <div key={key} className="flex justify-between text-sm">
                                <span className="text-gray-400 font-medium">{key}:</span>
                                <span className="text-gray-300 truncate max-w-md ml-4">
                                  {typeof value === 'boolean' ? (value ? '✓' : '✗') : String(value)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <SectionCard
              title="Select a Model"
            >
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">
                  Select a model from the list to browse its data
                </p>
              </div>
            </SectionCard>
          )}
        </div>
      </div>

      {/* Info Card */}
      <SectionCard
        title="Database Information"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 p-4 rounded-lg">
            <h3 className="font-semibold text-white mb-2">Total Models</h3>
            <p className="text-2xl font-bold text-blue-400">{models.length}</p>
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <h3 className="font-semibold text-white mb-2">Database Type</h3>
            <p className="text-lg text-gray-300">PostgreSQL</p>
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <h3 className="font-semibold text-white mb-2">Provider</h3>
            <p className="text-lg text-gray-300">Neon</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}