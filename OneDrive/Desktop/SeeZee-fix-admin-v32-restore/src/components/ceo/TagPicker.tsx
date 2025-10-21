"use client";

import { X } from "lucide-react";
import { useState, KeyboardEvent } from "react";

interface TagPickerProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagPicker({ value, onChange, placeholder }: TagPickerProps) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && input === "" && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 p-3 bg-slate-800/50 border border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-purple-500">
        {value.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="hover:bg-purple-500/30 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={value.length === 0 ? placeholder || "Type and press Enter..." : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
        />
      </div>
      <p className="text-xs text-slate-500 mt-1">
        Press Enter or comma to add tags. Backspace to remove.
      </p>
    </div>
  );
}
