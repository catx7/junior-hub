'use client';

import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface ProfileStep {
  key: string;
  labelKey: string;
  completed: boolean;
  href: string;
}

export function ProfileCompleteness() {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) return null;

  const steps: ProfileStep[] = [
    {
      key: 'avatar',
      labelKey: 'profileCompleteness.addPhoto',
      completed: !!user.avatar,
      href: '/settings/profile',
    },
    {
      key: 'bio',
      labelKey: 'profileCompleteness.addBio',
      completed: !!user.bio,
      href: '/settings/profile',
    },
    {
      key: 'location',
      labelKey: 'profileCompleteness.addLocation',
      completed: !!user.address,
      href: '/settings/profile',
    },
    {
      key: 'phone',
      labelKey: 'profileCompleteness.addPhone',
      completed: !!user.phone,
      href: '/settings/profile',
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const totalCount = steps.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  // Don't show if profile is complete
  if (percentage === 100) return null;

  return (
    <div className="border-border bg-card rounded-xl border p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t('profileCompleteness.title')}</h3>
        <span className="text-muted-foreground text-xs">{percentage}%</span>
      </div>

      {/* Progress bar */}
      <div className="bg-muted mb-4 h-2 overflow-hidden rounded-full">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            percentage < 50 ? 'bg-orange-500' : percentage < 100 ? 'bg-primary' : 'bg-green-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step) => (
          <Link
            key={step.key}
            href={step.href}
            className={cn(
              'flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition',
              step.completed ? 'text-muted-foreground' : 'hover:bg-muted text-foreground'
            )}
          >
            {step.completed ? (
              <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
            ) : (
              <Circle className="text-muted-foreground h-4 w-4 shrink-0" />
            )}
            <span className={cn(step.completed && 'line-through')}>{t(step.labelKey)}</span>
            {!step.completed && <ChevronRight className="text-muted-foreground ml-auto h-3 w-3" />}
          </Link>
        ))}
      </div>
    </div>
  );
}
