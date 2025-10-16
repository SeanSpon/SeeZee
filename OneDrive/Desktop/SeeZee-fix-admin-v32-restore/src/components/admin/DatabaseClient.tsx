"use client";

/**
 * Database Client Component
 * Provides a simple interface to browse database models
 */

import { useState } from "react";
import { SectionCard } from "@/components/admin/SectionCard";
import { Database, Table, Eye, Search } from "lucide-react";

interface DatabaseClientProps {
  models: string[];
}

export function DatabaseClient({ models }: DatabaseClientProps) {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Database Browser</h1>
        <p className="text-gray-400">
          Browse and inspect database models (Admin+ only)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Models List */}
        <div className="lg:col-span-1">
          <SectionCard
            title="Available Models"
            icon={Database}
            className="h-fit"
          >
            <div className="space-y-2">
              {models.map((model) => (
                <button
                  key={model}
                  onClick={() => setSelectedModel(model)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedModel === model
                      ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                      : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Table className="h-4 w-4" />
                    <span className="font-medium capitalize">{model}</span>
                  </div>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Model Details */}
        <div className="lg:col-span-2">
          {selectedModel ? (
            <SectionCard
              title={`${selectedModel.charAt(0).toUpperCase()}${selectedModel.slice(1)} Model`}
              icon={Eye}
            >
              <div className="text-center py-12">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">
                  Database browser functionality coming soon
                </p>
                <p className="text-sm text-gray-500">
                  This will show records from the {selectedModel} table
                </p>
              </div>
            </SectionCard>
          ) : (
            <SectionCard
              title="Select a Model"
              icon={Search}
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
        icon={Database}
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