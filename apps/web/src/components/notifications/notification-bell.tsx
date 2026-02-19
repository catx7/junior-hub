'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  MessageSquare,
  Star,
  Briefcase,
  DollarSign,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { getIdToken } from '@/lib/firebase';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data: serverData } = useQuery({
    queryKey: ['notifications-bell'],
    queryFn: async () => {
      const token = await getIdToken();
      if (!token) return { notifications: [], unreadCount: 0 };
      const res = await fetch('/api/notifications?limit=10', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return { notifications: [], unreadCount: 0 };
      return res.json();
    },
    refetchInterval: 30000,
    staleTime: 15000,
    enabled: isAuthenticated,
  });

  const notifications: Notification[] = (serverData?.notifications || []).map((n: any) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.message,
    data: n.data,
    isRead: n.isRead,
    createdAt: n.createdAt,
  }));

  const unreadCount = serverData?.unreadCount || 0;

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const token = await getIdToken();
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'markAllRead' }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-bell'] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const token = await getIdToken();
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'markRead', notificationIds: [notificationId] }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-bell'] });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_MESSAGE':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'NEW_OFFER':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'OFFER_ACCEPTED':
        return <CheckCircle2 className="h-5 w-5 text-purple-500" />;
      case 'OFFER_REJECTED':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'NEW_REVIEW':
        return <Star className="h-5 w-5 text-yellow-500" />;
      default:
        return <Briefcase className="text-primary h-5 w-5" />;
    }
  };

  const getNotificationLink = (notification: Notification): string => {
    if (notification.data?.conversationId) {
      return `/messages/${notification.data.conversationId}`;
    }
    if (notification.data?.jobId) {
      return `/jobs/${notification.data.jobId}`;
    }
    switch (notification.type) {
      case 'NEW_MESSAGE':
        return '/messages';
      case 'NEW_REVIEW':
        return '/profile';
      default:
        return '/';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    markAllReadMutation.mutate();
  };

  const formatTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:bg-muted relative rounded-full p-2 transition"
        aria-label="Notifications"
      >
        <Bell className="text-muted-foreground h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="bg-card absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-primary text-sm hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.slice(0, 10).map((notification) => (
                  <Link
                    key={notification.id}
                    href={getNotificationLink(notification)}
                    onClick={() => handleNotificationClick(notification)}
                    className={`hover:bg-muted/50 flex items-start gap-3 px-4 py-3 transition ${
                      !notification.isRead ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="mt-1 flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
                        {notification.title}
                      </p>
                      <p className="text-muted-foreground truncate text-sm">{notification.body}</p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="bg-primary/50 mt-2 h-2 w-2 flex-shrink-0 rounded-full" />
                    )}
                  </Link>
                ))
              ) : (
                <div className="text-muted-foreground px-4 py-8 text-center">
                  <Bell className="text-muted-foreground/50 mx-auto mb-2 h-12 w-12" />
                  <p>No notifications yet</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t px-4 py-3">
                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-primary block text-center text-sm hover:underline"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
