'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Users, User, Briefcase, Bell, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getIdToken } from '@/lib/firebase';

// API functions
async function sendNotification(data: {
  title: string;
  body: string;
  type: string;
  targetType: 'all' | 'specific';
  userId?: string;
  jobId?: string;
}) {
  const token = await getIdToken();
  const res = await fetch('/api/admin/notifications/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to send notification');
  return res.json();
}

async function fetchUsers() {
  const token = await getIdToken();
  const res = await fetch('/api/admin/users', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

async function fetchJobs() {
  const res = await fetch('/api/jobs');
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

export default function AdminNotificationsPage() {
  const queryClient = useQueryClient();
  const [notificationData, setNotificationData] = useState({
    title: '',
    body: '',
    type: 'info',
    targetType: 'all' as 'all' | 'specific',
    userId: '',
    jobId: '',
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchUsers,
  });

  const { data: jobsData } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: fetchJobs,
  });

  const jobs = jobsData?.jobs || [];

  const sendNotificationMutation = useMutation({
    mutationFn: sendNotification,
    onSuccess: (data) => {
      toast.success(`Notification sent to ${data.sentCount} user(s)`);
      setNotificationData({
        title: '',
        body: '',
        type: 'info',
        targetType: 'all',
        userId: '',
        jobId: '',
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send notification');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!notificationData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!notificationData.body.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (notificationData.targetType === 'specific' && !notificationData.userId) {
      toast.error('Please select a user');
      return;
    }

    sendNotificationMutation.mutate(notificationData);
  };

  const notificationTemplates = [
    {
      title: 'New Job Alert',
      body: 'Check out new jobs in your area!',
      type: 'new_job',
    },
    {
      title: 'Special Offer',
      body: 'Limited time offer on premium features',
      type: 'promotion',
    },
    {
      title: 'System Update',
      body: "We've added new features to improve your experience",
      type: 'info',
    },
    {
      title: 'Payment Reminder',
      body: "Don't forget to complete your payment",
      type: 'reminder',
    },
  ];

  return (
    <div className="bg-muted/50 min-h-screen py-8">
      <div className="mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-foreground text-3xl font-bold">Push Notifications</h1>
          <p className="text-muted-foreground mt-1">Send notifications to users</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Notification Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="mb-6 text-xl font-semibold">Create Notification</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Target Selection */}
                <div>
                  <Label className="mb-3 block">Send To</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setNotificationData({ ...notificationData, targetType: 'all', userId: '' })
                      }
                      className={`flex items-center gap-3 rounded-lg border-2 p-4 transition ${
                        notificationData.targetType === 'all'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-border'
                      }`}
                    >
                      <Users className="h-6 w-6" />
                      <div className="text-left">
                        <p className="font-medium">All Users</p>
                        <p className="text-muted-foreground text-sm">{users.length} users</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setNotificationData({ ...notificationData, targetType: 'specific' })
                      }
                      className={`flex items-center gap-3 rounded-lg border-2 p-4 transition ${
                        notificationData.targetType === 'specific'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-border'
                      }`}
                    >
                      <User className="h-6 w-6" />
                      <div className="text-left">
                        <p className="font-medium">Specific User</p>
                        <p className="text-muted-foreground text-sm">Select user</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* User Selection (if specific) */}
                {notificationData.targetType === 'specific' && (
                  <div>
                    <Label htmlFor="userId">Select User</Label>
                    <select
                      id="userId"
                      value={notificationData.userId}
                      onChange={(e) =>
                        setNotificationData({ ...notificationData, userId: e.target.value })
                      }
                      className="mt-2 w-full rounded-lg border px-4 py-3"
                      required
                    >
                      <option value="">Choose a user...</option>
                      {users.map((user: any) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Notification Type */}
                <div>
                  <Label htmlFor="type">Notification Type</Label>
                  <select
                    id="type"
                    value={notificationData.type}
                    onChange={(e) =>
                      setNotificationData({ ...notificationData, type: e.target.value })
                    }
                    className="mt-2 w-full rounded-lg border px-4 py-3"
                  >
                    <option value="info">Info</option>
                    <option value="new_job">New Job</option>
                    <option value="promotion">Promotion</option>
                    <option value="reminder">Reminder</option>
                    <option value="warning">Warning</option>
                  </select>
                </div>

                {/* Link to Job (optional) */}
                <div>
                  <Label htmlFor="jobId">Link to Job (Optional)</Label>
                  <select
                    id="jobId"
                    value={notificationData.jobId}
                    onChange={(e) =>
                      setNotificationData({ ...notificationData, jobId: e.target.value })
                    }
                    className="mt-2 w-full rounded-lg border px-4 py-3"
                  >
                    <option value="">None</option>
                    {jobs.map((job: any) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={notificationData.title}
                    onChange={(e) =>
                      setNotificationData({ ...notificationData, title: e.target.value })
                    }
                    placeholder="Notification title..."
                    maxLength={100}
                    className="mt-2"
                    required
                  />
                  <p className="text-muted-foreground mt-1 text-right text-xs">
                    {notificationData.title.length}/100
                  </p>
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="body">Message</Label>
                  <textarea
                    id="body"
                    value={notificationData.body}
                    onChange={(e) =>
                      setNotificationData({ ...notificationData, body: e.target.value })
                    }
                    placeholder="Notification message..."
                    rows={4}
                    maxLength={500}
                    className="mt-2 w-full resize-none rounded-lg border px-4 py-3"
                    required
                  />
                  <p className="text-muted-foreground mt-1 text-right text-xs">
                    {notificationData.body.length}/500
                  </p>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={sendNotificationMutation.isPending}
                >
                  <Send className="mr-2 h-5 w-5" />
                  {sendNotificationMutation.isPending ? 'Sending...' : 'Send Notification'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Templates */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Quick Templates</h3>
              <div className="space-y-2">
                {notificationTemplates.map((template, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      setNotificationData({
                        ...notificationData,
                        title: template.title,
                        body: template.body,
                        type: template.type,
                      })
                    }
                    className="hover:bg-muted/50 w-full rounded-lg border p-3 text-left transition"
                  >
                    <p className="text-sm font-medium">{template.title}</p>
                    <p className="text-muted-foreground line-clamp-1 text-xs">{template.body}</p>
                  </button>
                ))}
              </div>
            </Card>

            {/* Preview */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Preview</h3>
              <div className="bg-muted/50 rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <Bell className="mt-1 h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">
                      {notificationData.title || 'Notification Title'}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {notificationData.body || 'Your message will appear here...'}
                    </p>
                    <p className="text-muted-foreground mt-2 text-xs">Just now</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Stats */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Total Users</span>
                  <span className="font-semibold">{users.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Active Jobs</span>
                  <span className="font-semibold">{jobs.length}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Notifications */}
        <Card className="mt-6 p-6">
          <h2 className="mb-4 text-lg font-semibold">Recent Notifications</h2>
          <div className="space-y-3">
            <div className="bg-muted/50 flex items-start gap-3 rounded-lg p-3">
              <CheckCircle2 className="mt-1 h-5 w-5 text-green-500" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Notification system ready</p>
                  <Badge>Active</Badge>
                </div>
                <p className="text-muted-foreground text-xs">
                  System is configured and ready to send notifications
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
