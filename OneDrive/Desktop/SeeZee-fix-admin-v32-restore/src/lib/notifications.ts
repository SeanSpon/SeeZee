/**
 * Notifications system for SeeZee Admin v3.0
 */

export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "maintenance"
  | "payment"
  | "task";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

/**
 * Mock notifications removed - notifications now come from database via API
 * @deprecated Use /api/notifications instead
 */

/**
 * Get notification icon and color
 */
export function getNotificationStyle(type: NotificationType): {
  icon: string;
  color: string;
} {
  switch (type) {
    case "success":
      return { icon: "✓", color: "text-green-400" };
    case "warning":
      return { icon: "⚠", color: "text-yellow-400" };
    case "error":
      return { icon: "✕", color: "text-red-400" };
    case "maintenance":
      return { icon: "🔧", color: "text-blue-400" };
    case "payment":
      return { icon: "💰", color: "text-green-400" };
    case "task":
      return { icon: "✓", color: "text-teal-400" };
    default:
      return { icon: "ℹ", color: "text-slate-400" };
  }
}
