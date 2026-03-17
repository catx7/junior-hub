'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Briefcase, Star, Bell, Settings, Shield, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Check if user is admin
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-border border-t-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4"></div>
          <p className="text-muted-foreground">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-8 text-center">
          <Shield className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this page.
          </p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const adminSections = [
    {
      title: 'User Management',
      description: 'View, edit, and manage all users',
      icon: Users,
      href: '/admin/users',
      color: 'bg-blue-500',
    },
    {
      title: 'Job Management',
      description: 'Monitor and moderate all job postings',
      icon: Briefcase,
      href: '/admin/jobs',
      color: 'bg-green-500',
    },
    {
      title: 'Review Management',
      description: 'Manage and moderate user reviews',
      icon: Star,
      href: '/admin/reviews',
      color: 'bg-yellow-50 dark:bg-yellow-900/200',
    },
    {
      title: 'Push Notifications',
      description: 'Send notifications to users',
      icon: Bell,
      href: '/admin/notifications',
      color: 'bg-purple-500',
    },
    {
      title: 'Provider Verification',
      description: 'Review and approve provider applications',
      icon: Shield,
      href: '/admin/verification',
      color: 'bg-orange-500',
    },
    {
      title: 'Analytics',
      description: 'View platform statistics and insights',
      icon: TrendingUp,
      href: '/admin/analytics',
      color: 'bg-pink-500',
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-muted/500',
    },
  ];

  return (
    <div className="bg-muted/50 min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <Shield className="text-primary h-8 w-8" />
            <h1 className="text-foreground text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Manage and monitor all aspects of JuniorHub platform
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Users</p>
                <p className="text-foreground text-3xl font-bold">-</p>
              </div>
              <Users className="h-10 w-10 text-blue-500" />
            </div>
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">↑ View details</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Jobs</p>
                <p className="text-foreground text-3xl font-bold">-</p>
              </div>
              <Briefcase className="h-10 w-10 text-green-500" />
            </div>
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">↑ View details</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Reviews</p>
                <p className="text-foreground text-3xl font-bold">-</p>
              </div>
              <Star className="h-10 w-10 text-yellow-500" />
            </div>
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">↑ View details</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Platform Health</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">Good</p>
              </div>
              <Activity className="h-10 w-10 text-green-500" />
            </div>
            <p className="text-muted-foreground mt-2 text-sm">All systems operational</p>
          </Card>
        </div>

        {/* Admin Sections */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.href} href={section.href}>
                <Card className="group overflow-hidden transition hover:shadow-lg">
                  <div className="p-6">
                    <div className={`mb-4 inline-flex rounded-lg ${section.color} p-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-foreground group-hover:text-primary mb-2 text-xl font-semibold">
                      {section.title}
                    </h3>
                    <p className="text-muted-foreground">{section.description}</p>
                  </div>
                  <div className="bg-muted/50 border-t px-6 py-3">
                    <span className="text-primary text-sm font-medium group-hover:underline">
                      Manage →
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card className="mt-8 p-6">
          <h2 className="mb-4 text-lg font-semibold">Recent Admin Activity</h2>
          <div className="space-y-3">
            <div className="bg-muted/50 flex items-start gap-3 rounded-lg p-3">
              <Activity className="mt-1 h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">System initialized</p>
                <p className="text-muted-foreground text-xs">Admin dashboard is ready to use</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Warning Banner */}
        <Card className="mt-6 border-l-4 border-l-yellow-500 bg-yellow-50 p-6 dark:bg-yellow-900/20">
          <div className="flex items-start gap-3">
            <Shield className="mt-1 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-400">
                Admin Privileges
              </h3>
              <p className="mt-1 text-sm text-yellow-800 dark:text-yellow-400">
                You have full access to platform data. Please use these tools responsibly and in
                accordance with privacy regulations.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
