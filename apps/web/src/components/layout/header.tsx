'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Bell,
  MessageSquare,
  Plus,
  User,
  LogOut,
  Settings,
  Globe,
  Heart,
  Calendar,
  Shirt,
  UtensilsCrossed,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useQuery } from '@tanstack/react-query';
import { Button, UserAvatar } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { LOCALES } from '@localservices/shared';
import { conversationsApi } from '@/lib/api';
import { notificationStore } from '@/lib/notifications';
import { NotificationBell } from '@/components/notifications/notification-bell';

const navLinks = [
  { href: '/', labelKey: 'nav.home' },
  { href: '/jobs', labelKey: 'nav.browse' },
];

const communityLinks = [
  { href: '/kids-events', labelKey: 'community.kidsEvents', icon: Calendar },
  { href: '/kids-clothes', labelKey: 'community.kidsClothes', icon: Shirt },
  { href: '/local-food', labelKey: 'community.localFood', icon: UtensilsCrossed },
];

export function Header() {
  const pathname = usePathname();
  const { t, locale, setLocale } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [communityMenuOpen, setCommunityMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  // Fetch unread message count
  const { data: conversationsData } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => conversationsApi.list(),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadMessageCount =
    conversationsData?.conversations?.reduce(
      (sum: number, conv: any) => sum + (conv.unreadCount || 0),
      0
    ) || 0;

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'ro' : 'en');
    setLangMenuOpen(false);
  };

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <nav className="container-custom">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <span className="text-lg font-bold text-white">J</span>
            </div>
            <span className="hidden font-semibold sm:inline-block">JuniorHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'hover:text-primary text-sm font-medium transition-colors',
                  pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {t(link.labelKey)}
              </Link>
            ))}

            {/* Community Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCommunityMenuOpen(!communityMenuOpen)}
                className="hover:text-primary text-muted-foreground flex items-center gap-1 text-sm font-medium transition-colors"
              >
                <Heart className="h-4 w-4" />
                {t('community.title')}
                <ChevronDown className="h-3 w-3" />
              </button>

              {communityMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setCommunityMenuOpen(false)} />
                  <div className="bg-popover absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border p-2 shadow-lg">
                    {communityLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setCommunityMenuOpen(false)}
                          className="hover:bg-muted flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition"
                        >
                          <Icon className="text-muted-foreground h-4 w-4" />
                          <span className="font-medium">{t(link.labelKey)}</span>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hidden sm:flex"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}

            {/* Language Switcher */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="hidden sm:flex"
              >
                <Globe className="h-5 w-5" />
              </Button>
              {langMenuOpen && (
                <div className="bg-background absolute right-0 top-full mt-2 w-32 rounded-lg border p-1 shadow-lg">
                  {Object.values(LOCALES).map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLocale(l.code as 'en' | 'ro');
                        setLangMenuOpen(false);
                      }}
                      className={cn(
                        'hover:bg-muted flex w-full items-center space-x-2 rounded-md px-3 py-2 text-sm',
                        locale === l.code && 'bg-muted'
                      )}
                    >
                      <span>{l.flag}</span>
                      <span>{l.nativeName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <>
                {/* Post Job Button */}
                <Link href="/jobs/new" className="hidden sm:block">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('jobs.createJob')}
                  </Button>
                </Link>

                {/* Notifications - Using NotificationBell component */}
                <NotificationBell />

                {/* Messages */}
                <Link href="/messages">
                  <Button variant="ghost" size="icon" className="relative">
                    <MessageSquare className="h-5 w-5" />
                    {unreadMessageCount > 0 && (
                      <span className="bg-primary absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white">
                        {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                      </span>
                    )}
                  </Button>
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 rounded-full border p-1 transition-shadow hover:shadow-md"
                  >
                    <Menu className="ml-2 h-4 w-4" />
                    <UserAvatar src={user?.avatar} name={user?.name || 'User'} size="sm" />
                  </button>

                  {userMenuOpen && (
                    <div className="bg-background absolute right-0 top-full mt-2 w-56 rounded-xl border p-2 shadow-lg">
                      <div className="border-b px-3 py-2">
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-muted-foreground text-sm">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="hover:bg-muted flex items-center space-x-2 rounded-lg px-3 py-2 text-sm"
                        >
                          <User className="h-4 w-4" />
                          <span>{t('nav.profile')}</span>
                        </Link>
                        <Link
                          href="/my-jobs"
                          onClick={() => setUserMenuOpen(false)}
                          className="hover:bg-muted flex items-center space-x-2 rounded-lg px-3 py-2 text-sm"
                        >
                          <Plus className="h-4 w-4" />
                          <span>{t('myJobs.title')}</span>
                        </Link>
                        <Link
                          href="/messages"
                          onClick={() => setUserMenuOpen(false)}
                          className="hover:bg-muted flex items-center space-x-2 rounded-lg px-3 py-2 text-sm"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>{t('nav.messages')}</span>
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="hover:bg-muted flex items-center space-x-2 rounded-lg px-3 py-2 text-sm"
                        >
                          <Settings className="h-4 w-4" />
                          <span>{t('nav.settings')}</span>
                        </Link>
                      </div>
                      <div className="border-t pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          className="text-destructive hover:bg-muted flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-sm"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>{t('auth.logout')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    {t('auth.login')}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">{t('auth.register')}</Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'hover:bg-muted rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    pathname === link.href ? 'bg-muted text-primary' : 'text-muted-foreground'
                  )}
                >
                  {t(link.labelKey)}
                </Link>
              ))}
              {communityLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:bg-muted text-muted-foreground flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
                  >
                    <Icon className="h-4 w-4" />
                    {t(link.labelKey)}
                  </Link>
                );
              })}
              {isAuthenticated && (
                <Link
                  href="/jobs/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-primary flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-white"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t('jobs.createJob')}</span>
                </Link>
              )}
              <button
                onClick={toggleLocale}
                className="text-muted-foreground hover:bg-muted flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium"
              >
                <Globe className="h-4 w-4" />
                <span>{locale === 'en' ? 'Română' : 'English'}</span>
              </button>
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="text-muted-foreground hover:bg-muted flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
