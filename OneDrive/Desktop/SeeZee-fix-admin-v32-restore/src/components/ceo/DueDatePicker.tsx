"use client";

import { Calendar } from "lucide-react";

interface DueDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  required?: boolean;
}

export default function DueDatePicker({ value, onChange, label, required }: DueDatePickerProps) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-2">
          {label}
          {required && <span className="text-red-400"> *</span>}
        </label>
      )}
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={today}
          required={required}
          className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
    </div>
  );
}
