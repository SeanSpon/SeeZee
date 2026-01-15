/**
 * Production-ready logger utility
 * Prevents console spam in production while keeping error logs
 */

export const log = (...args: any[]) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(...args);
  }
};

export const warn = (...args: any[]) => {
  if (process.env.NODE_ENV !== "production") {
    console.warn(...args);
  }
};

export const error = (...args: any[]) => {
  // Always log errors (sent to monitoring in production)
  console.error(...args);
};

export const info = (...args: any[]) => {
  console.info(...args);
};

// Development-only debug logs
export const debug = (...args: any[]) => {
  if (process.env.NODE_ENV === "development" && process.env.DEBUG) {
    console.log("[DEBUG]", ...args);
  }
};
