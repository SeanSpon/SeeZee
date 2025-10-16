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
 * Mock notifications for initial render
 */
export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "maintenance",
    title: "New Maintenance Request",
    message: "Tyree has submitted a new maintenance request",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
    read: false,
    actionUrl: "/admin/maintenance",
    actionLabel: "View Request",
  },
  {
    id: "notif-2",
    type: "payment",
    title: "Invoice Paid",
    message: "Invoice #32 has been paid by CloudTech Solutions",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    actionUrl: "/admin/pipeline/invoices",
    actionLabel: "View Invoice",
  },
  {
    id: "notif-3",
    type: "task",
    title: "Task Completed",
    message: "Zach marked task #22 'Update homepage hero' as done",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: true,
    actionUrl: "/admin/tasks",
    actionLabel: "View Task",
  },
];

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
