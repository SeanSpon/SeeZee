'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface StepInputProps {
  name: string;
  type: 'text' | 'email' | 'tel' | 'url' | 'select' | 'multiselect' | 'textarea' | 'date' | 'boolean';
  value: any;
  options?: string[];
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export function StepInput({
  name,
  type,
  value: initialValue,
  options = [],
  placeholder,
  error,
  required = false
}: StepInputProps) {
  const [localValue, setLocalValue] = useState(initialValue || '');

  // Text, Email, Tel, URL inputs
  if (['text', 'email', 'tel', 'url', 'date'].includes(type)) {
    return (
      <div className="space-y-2">
        <input
          type={type}
          name={name}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-#ef4444 focus:border-#ef4444 transition-all"
        />
        {error && (
          <p className="text-sm text-red-400 flex items-center gap-1">
            <span className="text-lg">⚠</span> {error}
          </p>
        )}
      </div>
    );
  }

  // Textarea
  if (type === 'textarea') {
    return (
      <div className="space-y-2">
        <textarea
          name={name}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={placeholder}
          required={required}
          rows={4}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-#ef4444 focus:border-#ef4444 transition-all resize-none"
        />
        {error && (
          <p className="text-sm text-red-400 flex items-center gap-1">
            <span className="text-lg">⚠</span> {error}
          </p>
        )}
      </div>
    );
  }

  // Select
  if (type === 'select') {
    return (
      <div className="space-y-2">
        <select
          name={name}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          required={required}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-#ef4444 focus:border-#ef4444 transition-all cursor-pointer"
        >
          <option value="">Select an option...</option>
          {options.map((option) => (
            <option key={option} value={option} className="bg-gray-900">
              {option}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-red-400 flex items-center gap-1">
            <span className="text-lg">⚠</span> {error}
          </p>
        )}
      </div>
    );
  }

  // Multi-select (chip-based)
  if (type === 'multiselect') {
    const selected = Array.isArray(localValue) ? localValue : [];

    const toggleOption = (option: string) => {
      if (selected.includes(option)) {
        setLocalValue(selected.filter((v) => v !== option));
      } else {
        setLocalValue([...selected, option]);
      }
    };

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const isSelected = selected.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleOption(option)}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                  ${isSelected
                    ? 'bg-#ef4444/20 text-#ef4444 border-2 border-#ef4444 shadow-lg shadow-#ef4444/25'
                    : 'bg-gray-800 text-white/70 border border-gray-700 hover:bg-gray-700 hover:text-white hover:border-gray-600'
                  }
                `}
              >
                {option}
                {isSelected && <X className="inline ml-1" size={14} />}
              </button>
            );
          })}
        </div>
        {selected.length > 0 && (
          <div className="text-sm text-white/60">
            Selected {selected.length} {selected.length === 1 ? 'option' : 'options'}
          </div>
        )}
        {error && (
          <p className="text-sm text-red-400 flex items-center gap-1">
            <span className="text-lg">⚠</span> {error}
          </p>
        )}
        {/* Hidden input to submit array value */}
        <input type="hidden" name={name} value={JSON.stringify(selected)} />
      </div>
    );
  }

  // Boolean (yes/no toggle)
  if (type === 'boolean') {
    const boolValue = localValue === true || localValue === 'true';

    return (
      <div className="space-y-2">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setLocalValue(true)}
            className={`
              flex-1 px-6 py-4 rounded-lg font-semibold transition-all duration-200
              ${boolValue
                ? 'bg-#ef4444/20 text-#ef4444 border-2 border-#ef4444 shadow-lg shadow-#ef4444/25'
                : 'bg-gray-800 text-white/70 border border-gray-700 hover:bg-gray-700 hover:border-gray-600'
              }
            `}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setLocalValue(false)}
            className={`
              flex-1 px-6 py-4 rounded-lg font-semibold transition-all duration-200
              ${!boolValue
                ? 'bg-gray-700/50 text-gray-300 border-2 border-gray-600'
                : 'bg-gray-800 text-white/70 border border-gray-700 hover:bg-gray-700 hover:border-gray-600'
              }
            `}
          >
            No
          </button>
        </div>
        <input type="hidden" name={name} value={String(boolValue)} />
        {error && (
          <p className="text-sm text-red-400 flex items-center gap-1">
            <span className="text-lg">⚠</span> {error}
          </p>
        )}
      </div>
    );
  }

  return null;
}
