// Firebase Cloud Messaging (FCM) for push notifications
import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { app } from './firebase';

let messaging: ReturnType<typeof getMessaging> | null = null;

// Initialize messaging only in browser
export function initializeMessaging() {
  if (typeof window === 'undefined') return null;

  if (!messaging) {
    try {
      messaging = getMessaging(app);
    } catch (error) {
      console.error('Failed to initialize Firebase Messaging:', error);
      return null;
    }
  }

  return messaging;
}

// Request permission and get FCM token
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      return null;
    }

    const messaging = initializeMessaging();
    if (!messaging) return null;

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error('VAPID key not configured');
      return null;
    }

    const token = await getToken(messaging, { vapidKey });

    // Send token to backend to store for this user
    await saveTokenToServer(token);

    return token;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
}

// Save FCM token to server
async function saveTokenToServer(token: string): Promise<void> {
  try {
    await fetch('/api/notifications/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      credentials: 'include',
    });
  } catch (error) {
    console.error('Failed to save FCM token:', error);
  }
}

// Listen for foreground messages
export function onForegroundMessage(callback: (payload: MessagePayload) => void) {
  const messaging = initializeMessaging();
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    callback(payload);

    // Show notification manually for foreground messages
    if (payload.notification) {
      showLocalNotification(
        payload.notification.title || 'New Notification',
        payload.notification.body || '',
        payload.data
      );
    }
  });
}

// Show local notification
export function showLocalNotification(
  title: string,
  body: string,
  data?: Record<string, string>
): void {
  if (typeof window === 'undefined' || Notification.permission !== 'granted') {
    return;
  }

  const notification = new Notification(title, {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data,
    tag: data?.type || 'default',
    requireInteraction: true,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();

    // Handle navigation based on notification type
    if (data?.type === 'new_message' && data.conversationId) {
      window.location.href = `/messages/${data.conversationId}`;
    } else if (data?.type === 'new_offer' && data.jobId) {
      window.location.href = `/jobs/${data.jobId}`;
    } else if (data?.type === 'offer_accepted' && data.jobId) {
      window.location.href = `/jobs/${data.jobId}`;
    }
  };
}

// Notification types
export interface NotificationData {
  type:
    | 'new_message'
    | 'new_offer'
    | 'offer_accepted'
    | 'offer_rejected'
    | 'job_completed'
    | 'new_review';
  title: string;
  body: string;
  jobId?: string;
  conversationId?: string;
  userId?: string;
}

// In-app notification store
interface InAppNotification {
  id: string;
  type: NotificationData['type'];
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: Date;
}

class NotificationStore {
  private notifications: InAppNotification[] = [];
  private listeners: Set<(notifications: InAppNotification[]) => void> = new Set();

  add(notification: Omit<InAppNotification, 'id' | 'isRead' | 'createdAt'>) {
    const newNotification: InAppNotification = {
      ...notification,
      id: crypto.randomUUID(),
      isRead: false,
      createdAt: new Date(),
    };

    this.notifications.unshift(newNotification);
    this.notifyListeners();
  }

  markAsRead(id: string) {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.isRead = true;
      this.notifyListeners();
    }
  }

  markAllAsRead() {
    this.notifications.forEach((n) => (n.isRead = true));
    this.notifyListeners();
  }

  getAll(): InAppNotification[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  subscribe(listener: (notifications: InAppNotification[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.getAll()));
  }
}

export const notificationStore = new NotificationStore();
