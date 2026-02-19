'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Lock,
  Globe,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { LOCALES } from '@localservices/shared';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { locale } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDarkMode = mounted ? theme === 'dark' : false;

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const settingsSections: Array<{
    title: string;
    items: Array<{
      icon: typeof User;
      label: string;
      description: string;
      href?: string;
      onClick?: () => void;
      badge?: string;
    }>;
  }> = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile',
          description: 'Manage your personal information',
          href: '/profile/edit',
        },
        {
          icon: Lock,
          label: 'Privacy & Security',
          description: 'Password, 2FA, and privacy settings',
          href: '/settings/security',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Globe,
          label: 'Language',
          description: LOCALES[locale as keyof typeof LOCALES]?.nativeName || 'English',
          href: '/settings/language',
        },
        {
          icon: isDarkMode ? Moon : Sun,
          label: 'Theme',
          description: isDarkMode ? 'Dark mode' : 'Light mode',
          onClick: () => setTheme(isDarkMode ? 'light' : 'dark'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help Center',
          description: 'Get help and support',
          href: '/help',
        },
        {
          icon: Shield,
          label: 'Terms & Privacy',
          description: 'Legal information',
          href: '/terms',
        },
      ],
    },
  ];

  // Add admin section if user is admin
  if (user?.role === 'ADMIN') {
    settingsSections.unshift({
      title: 'Administration',
      items: [
        {
          icon: Shield,
          label: 'Admin Dashboard',
          description: 'Manage platform and users',
          href: '/admin',
          badge: 'ADMIN',
        },
      ],
    });
  }

  // Add "Become a Provider" section for regular users
  if (user?.role === 'USER') {
    settingsSections.splice(1, 0, {
      title: 'Provider',
      items: [
        {
          icon: Shield,
          label: 'Become a Provider',
          description: 'Apply to offer services on the platform',
          href: '/settings/become-provider',
        },
      ],
    });
  }

  return (
    <div className="bg-muted/50 min-h-screen py-8">
      <div className="mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-foreground text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        {/* User Info Card */}
        <Card className="mb-8 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-foreground text-lg font-semibold">{user?.name}</p>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
              <div className="mt-1 flex gap-2">
                {user?.isVerified && <Badge className="bg-green-600">Verified</Badge>}
                {user?.role === 'PROVIDER' && <Badge className="bg-blue-600">Provider</Badge>}
                {user?.role === 'ADMIN' && <Badge className="bg-purple-600">Admin</Badge>}
              </div>
            </div>
          </div>
        </Card>

        {/* Settings Sections */}
        <div className="space-y-8">
          {settingsSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h2 className="text-muted-foreground mb-4 text-sm font-semibold uppercase tracking-wider">
                {section.title}
              </h2>
              <Card className="divide-y">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const content = (
                    <div className="hover:bg-muted/50 flex items-center justify-between p-4 transition">
                      <div className="flex items-center gap-4">
                        <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                          <Icon className="text-muted-foreground h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-foreground font-medium">{item.label}</p>
                            {item.badge && (
                              <Badge className="bg-purple-600 text-xs">{item.badge}</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm">{item.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="text-muted-foreground h-5 w-5" />
                    </div>
                  );

                  return item.onClick ? (
                    <button key={itemIndex} onClick={item.onClick} className="w-full text-left">
                      {content}
                    </button>
                  ) : (
                    <Link key={itemIndex} href={item.href!}>
                      {content}
                    </Link>
                  );
                })}
              </Card>
            </div>
          ))}
        </div>

        {/* Danger Zone */}
        <Card className="border-destructive/30 bg-destructive/5 mt-8 p-6">
          <h2 className="text-destructive mb-4 text-sm font-semibold uppercase tracking-wider">
            Danger Zone
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium">Log Out</p>
                <p className="text-muted-foreground text-sm">Sign out of your account</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </div>
            <div className="border-destructive/30 flex items-center justify-between border-t pt-4">
              <div>
                <p className="text-destructive font-medium">Delete Account</p>
                <p className="text-destructive/80 text-sm">
                  Permanently delete your account and data
                </p>
              </div>
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => toast.error('Feature coming soon')}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </Card>

        {/* App Info */}
        <div className="text-muted-foreground mt-8 text-center text-sm">
          <p>JuniorHub v1.0.0</p>
          <p className="mt-1">Made with care for families</p>
        </div>
      </div>
    </div>
  );
}
