'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  MessageSquare,
  DollarSign,
  Star,
  CheckCircle2,
  Trash2,
  Shield,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { getIdToken } from '@/lib/firebase';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: {
    jobId?: string;
    offerId?: string;
    conversationId?: string;
  };
  isRead: boolean;
  createdAt: string;
}

function formatRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return 'Yesterday';
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'NEW_OFFER':
      return <DollarSign className="h-5 w-5" />;
    case 'NEW_MESSAGE':
      return <MessageSquare className="h-5 w-5" />;
    case 'OFFER_ACCEPTED':
      return <CheckCircle2 className="h-5 w-5" />;
    case 'OFFER_REJECTED':
      return <AlertCircle className="h-5 w-5" />;
    case 'JOB_COMPLETED':
      return <CheckCircle2 className="h-5 w-5" />;
    case 'NEW_REVIEW':
      return <Star className="h-5 w-5" />;
    case 'VERIFICATION_REQUIRED':
    case 'VERIFICATION_APPROVED':
    case 'VERIFICATION_REJECTED':
      return <Shield className="h-5 w-5" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
}

function getNotificationColor(type: string) {
  switch (type) {
    case 'NEW_OFFER':
      return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
    case 'NEW_MESSAGE':
      return 'bg-primary/10 text-primary';
    case 'OFFER_ACCEPTED':
      return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
    case 'OFFER_REJECTED':
      return 'bg-destructive/10 text-destructive';
    case 'JOB_COMPLETED':
      return 'bg-muted text-muted-foreground';
    case 'NEW_REVIEW':
      return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
    case 'VERIFICATION_REQUIRED':
      return 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400';
    case 'VERIFICATION_APPROVED':
      return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
    case 'VERIFICATION_REJECTED':
      return 'bg-destructive/10 text-destructive';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function getNotificationLink(notification: Notification): string {
  const { type, data } = notification;

  if (data?.conversationId) {
    return `/messages/${data.conversationId}`;
  }
  if (data?.jobId) {
    return `/jobs/${data.jobId}`;
  }

  switch (type) {
    case 'NEW_MESSAGE':
      return '/messages';
    case 'NEW_REVIEW':
      return '/profile';
    case 'VERIFICATION_REQUIRED':
    case 'VERIFICATION_APPROVED':
    case 'VERIFICATION_REJECTED':
      return '/settings';
    default:
      return '/';
  }
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const token = await getIdToken();
      const res = await fetch('/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const token = await getIdToken();
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'markAllRead' }),
      });
      if (!res.ok) throw new Error('Failed to mark all as read');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: () => {
      toast.error('Failed to mark notifications as read');
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const token = await getIdToken();
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'clearAll' }),
      });
      if (!res.ok) throw new Error('Failed to clear notifications');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications cleared');
    },
    onError: () => {
      toast.error('Failed to clear notifications');
    },
  });

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      clearAllMutation.mutate();
    }
  };

  if (isAuthLoading) {
    return (
      <div className="bg-muted/50 min-h-screen py-8">
        <div className="mx-auto max-w-3xl px-4">
          <Skeleton className="mb-8 h-12 w-48" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-muted/50 min-h-screen py-8">
        <div className="mx-auto max-w-3xl px-4">
          <Card className="p-12 text-center">
            <Bell className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h2 className="mb-4 text-xl font-semibold">Sign in Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to view your notifications.</p>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const notifications: Notification[] = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="bg-muted/50 min-h-screen py-8">
      <div className="mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-foreground text-3xl font-bold">Notifications</h1>
              <p className="text-muted-foreground mt-1">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                  : 'All caught up!'}
              </p>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  disabled={markAllReadMutation.isPending}
                >
                  {markAllReadMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  disabled={clearAllMutation.isPending}
                >
                  {clearAllMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : error ? (
          <Card className="p-12 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
            <h3 className="text-foreground mb-2 text-lg font-semibold">
              Failed to load notifications
            </h3>
            <p className="text-muted-foreground">Please try again later</p>
          </Card>
        ) : notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Link key={notification.id} href={getNotificationLink(notification)}>
                <Card
                  className={`p-4 transition hover:shadow-md ${
                    !notification.isRead ? 'border-l-primary bg-primary/5/50 border-l-4' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 rounded-full p-2 ${getNotificationColor(notification.type)}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={`font-semibold ${!notification.isRead ? 'text-foreground' : 'text-foreground'}`}
                        >
                          {notification.title}
                          {!notification.isRead && (
                            <Badge className="bg-primary ml-2 text-xs">New</Badge>
                          )}
                        </h3>
                        <span className="text-muted-foreground flex-shrink-0 text-xs">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </div>
                      <p
                        className={`mt-1 text-sm ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}
                      >
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <Bell className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="text-foreground mb-2 text-lg font-semibold">No notifications yet</h3>
            <p className="text-muted-foreground">
              When you receive offers, messages, or updates, they'll appear here
            </p>
          </Card>
        )}

        {/* Info Card */}
        <Card className="bg-primary/5 mt-8 p-6">
          <h3 className="text-foreground mb-2 font-semibold">Notification Settings</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Manage your notification preferences to stay updated on what matters most to you.
          </p>
          <Link href="/settings">
            <Button variant="outline" size="sm">
              Go to Settings
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
