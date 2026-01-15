/**
 * CSV Export Utilities
 */

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV<T extends Record<string, any>>(
  data: T[],
  headers: { key: keyof T; label: string }[]
): string {
  // Create header row
  const headerRow = headers.map((h) => h.label).join(",");

  // Create data rows
  const dataRows = data.map((row) => {
    return headers
      .map((header) => {
        const value = row[header.key];
        // Handle null/undefined
        if (value === null || value === undefined) return "";
        // Handle dates - check for toISOString method instead of instanceof
        if (value && typeof value === "object" && "toISOString" in value && typeof (value as any).toISOString === "function") {
          return `"${(value as Date).toISOString()}"`;
        }
        // Handle strings with commas or quotes
        if (typeof value === "string") {
          const escaped = value.replace(/"/g, '""');
          return `"${escaped}"`;
        }
        // Handle numbers and booleans
        return String(value);
      })
      .join(",");
  });

  // Combine header and data rows
  return [headerRow, ...dataRows].join("\n");
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format currency for CSV
 */
export function formatCurrencyForCSV(value: number): string {
  return value.toFixed(2);
}

/**
 * Format date for CSV
 */
export function formatDateForCSV(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0]; // YYYY-MM-DD format
}


