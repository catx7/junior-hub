'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Menu,
  X,
  Search,
  Bell,
  MessageSquare,
  Plus,
  User,
  LogOut,
  Settings,
  Globe,
} from 'lucide-react';
import { Button, UserAvatar } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { LOCALES } from '@localservices/shared';

const navLinks = [
  { href: '/', labelKey: 'nav.home' },
  { href: '/jobs', labelKey: 'nav.browse' },
];

export function Header() {
  const pathname = usePathname();
  const { t, locale, setLocale } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'ro' : 'en');
    setLangMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container-custom">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-white">L</span>
            </div>
            <span className="hidden font-semibold sm:inline-block">
              LocalServices
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === link.href
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
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
                <div className="absolute right-0 top-full mt-2 w-32 rounded-lg border bg-background p-1 shadow-lg">
                  {Object.values(LOCALES).map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLocale(l.code as 'en' | 'ro');
                        setLangMenuOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center space-x-2 rounded-md px-3 py-2 text-sm hover:bg-muted',
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

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                    3
                  </span>
                </Button>

                {/* Messages */}
                <Link href="/messages">
                  <Button variant="ghost" size="icon" className="relative">
                    <MessageSquare className="h-5 w-5" />
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                      2
                    </span>
                  </Button>
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 rounded-full border p-1 transition-shadow hover:shadow-md"
                  >
                    <Menu className="ml-2 h-4 w-4" />
                    <UserAvatar
                      src={user?.avatar}
                      name={user?.name || 'User'}
                      size="sm"
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border bg-background p-2 shadow-lg">
                      <div className="border-b px-3 py-2">
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                        >
                          <User className="h-4 w-4" />
                          <span>{t('nav.profile')}</span>
                        </Link>
                        <Link
                          href="/messages"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>{t('nav.messages')}</span>
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
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
                          className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-muted"
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
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
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
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
                    pathname === link.href
                      ? 'bg-muted text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {t(link.labelKey)}
                </Link>
              ))}
              {isAuthenticated && (
                <Link
                  href="/jobs/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t('jobs.createJob')}</span>
                </Link>
              )}
              <button
                onClick={toggleLocale}
                className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                <Globe className="h-4 w-4" />
                <span>{locale === 'en' ? 'Română' : 'English'}</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
