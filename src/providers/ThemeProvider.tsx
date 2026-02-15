"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

interface ThemeContextType {
  theme: "light" | "dark";
  themeMode: "light" | "dark" | "auto";
  reduceAnimations: boolean;
  compactMode: boolean;
  setThemeMode: (mode: "light" | "dark" | "auto") => void;
  setTheme: (theme: "light" | "dark") => void;
  setReduceAnimations: (value: boolean) => void;
  setCompactMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme(resolved: "light" | "dark") {
  const el = document.documentElement;
  el.classList.toggle("dark", resolved === "dark");
  el.classList.toggle("light", resolved === "light");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<"light" | "dark">("dark");
  const [themeMode, setThemeModeState] = useState<"light" | "dark" | "auto">("dark");
  const [reduceAnimations, setReduceAnimationsState] = useState(false);
  const [compactMode, setCompactModeState] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Resolve auto mode to light/dark based on system preference
  const resolveTheme = useCallback((mode: "light" | "dark" | "auto"): "light" | "dark" => {
    if (mode === "auto") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return mode;
  }, []);

  useEffect(() => {
    // Read themeMode from localStorage
    const storedMode = localStorage.getItem("themeMode") as "light" | "dark" | "system" | null;
    let mode: "light" | "dark" | "auto";

    if (storedMode === "system") {
      mode = "auto";
    } else if (storedMode === "light" || storedMode === "dark") {
      mode = storedMode;
    } else {
      // Fallback: read legacy "theme" key
      const legacyTheme = localStorage.getItem("theme");
      if (legacyTheme === "light" || legacyTheme === "dark") {
        mode = legacyTheme;
      } else {
        mode = "dark";
      }
    }

    setThemeModeState(mode);
    const resolved = resolveTheme(mode);
    setThemeState(resolved);
    applyTheme(resolved);

    // Read reduceAnimations
    const storedReduceAnimations = localStorage.getItem("reduceAnimations");
    if (storedReduceAnimations === "true") {
      setReduceAnimationsState(true);
      document.documentElement.setAttribute("data-reduce-motion", "true");
    }

    // Read compactMode
    const storedCompactMode = localStorage.getItem("compactMode");
    if (storedCompactMode === "true") {
      setCompactModeState(true);
      document.documentElement.setAttribute("data-density", "compact");
    }

    setMounted(true);
  }, [resolveTheme]);

  // Listen for system preference changes when in auto mode
  useEffect(() => {
    if (themeMode !== "auto") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const resolved = e.matches ? "dark" : "light";
      setThemeState(resolved);
      applyTheme(resolved);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeMode]);

  const setThemeMode = useCallback((mode: "light" | "dark" | "auto") => {
    setThemeModeState(mode);
    localStorage.setItem("themeMode", mode === "auto" ? "system" : mode);

    const resolved = resolveTheme(mode);
    setThemeState(resolved);
    localStorage.setItem("theme", resolved);
    applyTheme(resolved);
  }, [resolveTheme]);

  // Backward-compatible setTheme: sets mode to the explicit theme
  const setTheme = useCallback((newTheme: "light" | "dark") => {
    setThemeMode(newTheme);
  }, [setThemeMode]);

  const setReduceAnimations = useCallback((value: boolean) => {
    setReduceAnimationsState(value);
    localStorage.setItem("reduceAnimations", String(value));
    if (value) {
      document.documentElement.setAttribute("data-reduce-motion", "true");
    } else {
      document.documentElement.removeAttribute("data-reduce-motion");
    }
  }, []);

  const setCompactMode = useCallback((value: boolean) => {
    setCompactModeState(value);
    localStorage.setItem("compactMode", String(value));
    if (value) {
      document.documentElement.setAttribute("data-density", "compact");
    } else {
      document.documentElement.removeAttribute("data-density");
    }
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        reduceAnimations,
        compactMode,
        setThemeMode,
        setTheme,
        setReduceAnimations,
        setCompactMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
