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
  const { t, locale } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDarkMode = mounted ? theme === 'dark' : false;

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      toast.error(t('common.error'));
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
      title: t('settings.account'),
      items: [
        {
          icon: User,
          label: t('nav.profile'),
          description: t('settings.manageProfile'),
          href: '/profile/edit',
        },
        {
          icon: Lock,
          label: t('settings.privacySecurity'),
          description: t('settings.privacySecurityDesc'),
          href: '/settings/security',
        },
      ],
    },
    {
      title: t('settings.title'),
      items: [
        {
          icon: Globe,
          label: t('settings.language'),
          description: LOCALES[locale as keyof typeof LOCALES]?.nativeName || 'English',
          href: '/settings/language',
        },
        {
          icon: isDarkMode ? Moon : Sun,
          label: t('settings.theme'),
          description: isDarkMode ? t('settings.darkMode') : t('settings.lightMode'),
          onClick: () => setTheme(isDarkMode ? 'light' : 'dark'),
        },
      ],
    },
    {
      title: t('settings.help'),
      items: [
        {
          icon: HelpCircle,
          label: t('settings.help'),
          description: t('settings.help'),
          href: '/help',
        },
        {
          icon: Shield,
          label: t('settings.privacy'),
          description: t('settings.legalInfo'),
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
          label: t('settings.adminDashboard'),
          description: t('settings.adminDashboardDesc'),
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
          label: t('settings.becomeProvider'),
          description: t('settings.becomeProviderDesc'),
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
          <h1 className="text-foreground text-3xl font-bold">{t('settings.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('settings.pageSubtitle')}</p>
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
                {user?.isVerified && (
                  <Badge className="bg-green-600">{t('profile.verified')}</Badge>
                )}
                {user?.role === 'PROVIDER' && (
                  <Badge className="bg-blue-600">{t('reviews.provider')}</Badge>
                )}
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
            {t('settings.dangerZone')}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium">{t('auth.logout')}</p>
                <p className="text-muted-foreground text-sm">{t('settings.logOutDesc')}</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                {t('auth.logout')}
              </Button>
            </div>
            <div className="border-destructive/30 flex items-center justify-between border-t pt-4">
              <div>
                <p className="text-destructive font-medium">{t('settings.deleteAccount')}</p>
                <p className="text-destructive/80 text-sm">{t('settings.deleteAccountFull')}</p>
              </div>
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => toast.error(t('settings.featureComingSoon'))}
              >
                {t('settings.deleteAccount')}
              </Button>
            </div>
          </div>
        </Card>

        {/* App Info */}
        <div className="text-muted-foreground mt-8 text-center text-sm">
          <p>{t('settings.appVersion')}</p>
          <p className="mt-1">{t('settings.madeWithCare')}</p>
        </div>
      </div>
    </div>
  );
}
