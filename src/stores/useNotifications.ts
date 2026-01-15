import { create } from 'zustand';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  href?: string;
}

interface NotificationsState {
  notifications: Notification[];
  count: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

// Mock notifications for demo
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Project Updated',
    message: 'Your website project has been updated',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    href: '/client/projects',
  },
  {
    id: '2',
    title: 'New Message',
    message: 'You have a new message from your project manager',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    href: '/client/messages',
  },
  {
    id: '3',
    title: 'Invoice Ready',
    message: 'Your invoice for this month is ready',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    href: '/client/invoices',
  },
];

export const useNotifications = create<NotificationsState>((set) => ({
  notifications: MOCK_NOTIFICATIONS,
  count: MOCK_NOTIFICATIONS.filter(n => !n.read).length,
  
  addNotification: (notification) => set((state) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date(),
      read: false,
    };
    return {
      notifications: [newNotification, ...state.notifications],
      count: state.count + 1,
    };
  }),
  
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ),
    count: Math.max(0, state.count - 1),
  })),
  
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    count: 0,
  })),
  
  clearAll: () => set({
    notifications: [],
    count: 0,
  }),
}));
