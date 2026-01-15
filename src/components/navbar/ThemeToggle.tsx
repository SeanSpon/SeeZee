"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
      aria-label="Toggle theme"
    >
      {/* Sun icon (visible in dark mode) */}
      <Sun 
        className={`h-5 w-5 transition-all duration-300 ${
          theme === "dark" 
            ? "rotate-0 scale-100 text-yellow-400" 
            : "rotate-90 scale-0 text-gray-400"
        }`}
        style={{
          position: theme === "dark" ? "relative" : "absolute",
          top: theme === "dark" ? "auto" : "50%",
          left: theme === "dark" ? "auto" : "50%",
          transform: theme === "dark" ? "none" : "translate(-50%, -50%)",
        }}
      />
      
      {/* Moon icon (visible in light mode) */}
      <Moon 
        className={`h-5 w-5 transition-all duration-300 ${
          theme === "light" 
            ? "rotate-0 scale-100 text-blue-600" 
            : "-rotate-90 scale-0 text-gray-400"
        }`}
        style={{
          position: theme === "light" ? "relative" : "absolute",
          top: theme === "light" ? "auto" : "50%",
          left: theme === "light" ? "auto" : "50%",
          transform: theme === "light" ? "none" : "translate(-50%, -50%)",
        }}
      />
    </button>
  );
}
