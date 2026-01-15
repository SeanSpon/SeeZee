"use client";

import { useState, useEffect } from "react";
import { Save, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProjectRevenueSplitProps {
  projectId: string;
}

export function ProjectRevenueSplit({ projectId }: ProjectRevenueSplitProps) {
  const [businessPercent, setBusinessPercent] = useState(50);
  const [ownerPercent, setOwnerPercent] = useState(25);
  const [robardsPercent, setRobardsPercent] = useState(25);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRevenueSplit();
  }, [projectId]);

  const loadRevenueSplit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ceo/projects/${projectId}/revenue-split`);
      if (!response.ok) throw new Error("Failed to load revenue split");
      const data = await response.json();
      if (data.revenueSplit) {
        setBusinessPercent(Number(data.revenueSplit.businessPercent));
        setOwnerPercent(Number(data.revenueSplit.ownerPercent));
        setRobardsPercent(Number(data.revenueSplit.robardsPercent));
      }
    } catch (error) {
      console.error("Failed to load revenue split:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const total = businessPercent + ownerPercent + robardsPercent;
    if (total !== 100) {
      toast("Percentages must sum to 100%", "error");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/ceo/projects/${projectId}/revenue-split`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessPercent,
          ownerPercent,
          robardsPercent,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save revenue split");
      }

      toast("Revenue split saved successfully!", "success");
    } catch (error: any) {
      toast(error.message || "Failed to save revenue split", "error");
    } finally {
      setSaving(false);
    }
  };

  const updatePercent = (type: "business" | "owner" | "robards", value: number) => {
    const numValue = Math.max(0, Math.min(100, value));
    let newBusiness = businessPercent;
    let newOwner = ownerPercent;
    let newRobards = robardsPercent;

    if (type === "business") {
      newBusiness = numValue;
    } else if (type === "owner") {
      newOwner = numValue;
    } else {
      newRobards = numValue;
    }

    // Adjust others to maintain 100% total
    const remainder = 100 - (newBusiness + newOwner + newRobards);
    if (remainder !== 0) {
      // Distribute remainder proportionally
      const total = newOwner + newRobards;
      if (total > 0) {
        newOwner += (remainder * newOwner) / total;
        newRobards += (remainder * newRobards) / total;
      } else {
        newOwner += remainder / 2;
        newRobards += remainder / 2;
      }
    }

    setBusinessPercent(Math.round(newBusiness));
    setOwnerPercent(Math.round(newOwner));
    setRobardsPercent(Math.round(newRobards));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const total = businessPercent + ownerPercent + robardsPercent;

  return (
    <div className="glass p-6 rounded-lg border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-purple-400" />
          Revenue Split Configuration
        </h3>
        <button
          onClick={handleSave}
          disabled={saving || total !== 100}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Business Account: {businessPercent}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={businessPercent}
            onChange={(e) => updatePercent("business", Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Owner (You): {ownerPercent}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={ownerPercent}
            onChange={(e) => updatePercent("owner", Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Robards: {robardsPercent}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={robardsPercent}
            onChange={(e) => updatePercent("robards", Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="p-4 bg-slate-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Total:</span>
            <span
              className={`text-lg font-bold ${
                total === 100 ? "text-green-400" : "text-red-400"
              }`}
            >
              {total}%
            </span>
          </div>
          {total !== 100 && (
            <p className="text-xs text-red-400 mt-2">
              Percentages must sum to exactly 100%
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

