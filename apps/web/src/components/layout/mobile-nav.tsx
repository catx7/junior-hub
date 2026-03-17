'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, MessageSquare, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/', icon: Home, labelKey: 'nav.home' },
  { href: '/jobs', icon: Search, labelKey: 'nav.browse' },
  { href: '/jobs/new', icon: PlusCircle, labelKey: 'nav.post', authRequired: true },
  { href: '/messages', icon: MessageSquare, labelKey: 'nav.messages', authRequired: true },
  { href: '/profile', icon: User, labelKey: 'nav.profile', authRequired: true },
];

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const visibleTabs = tabs.filter((tab) => !tab.authRequired || isAuthenticated);

  return (
    <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur md:hidden">
      <div className="flex items-center justify-around">
        {visibleTabs.map((tab) => {
          const isActive =
            pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.authRequired && !isAuthenticated ? '/login' : tab.href}
              className={cn(
                'flex min-h-[56px] min-w-[56px] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <tab.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span className="truncate">{t(tab.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
