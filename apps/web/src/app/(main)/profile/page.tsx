'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Edit2,
  Star,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { jobsApi } from '@/lib/api';
import { useTranslation } from '@/hooks/use-translation';

export default function ProfilePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { t } = useTranslation();

  // Fetch user's jobs (posted and as provider)
  const { data: postedJobs, isLoading: isPostedJobsLoading } = useQuery({
    queryKey: ['jobs', 'posted', user?.id],
    queryFn: () => jobsApi.list({ posterId: user?.id }),
    enabled: !!user?.id,
  });

  const { data: providerJobs, isLoading: isProviderJobsLoading } = useQuery({
    queryKey: ['jobs', 'provider', user?.id],
    queryFn: () => jobsApi.list({ providerId: user?.id }),
    enabled: !!user?.id,
  });

  const isLoading = isAuthLoading || isPostedJobsLoading || isProviderJobsLoading;

  if (isAuthLoading) {
    return (
      <div className="bg-muted/50 min-h-screen py-8">
        <div className="mx-auto max-w-4xl px-4">
          <Card className="mb-6 p-6">
            <div className="flex gap-6">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-6">
          <p className="text-center">{t('profile.loginToView')}</p>
          <Link href="/login">
            <Button className="mt-4 w-full">{t('auth.login')}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Calculate statistics
  const allJobs = [...(postedJobs?.jobs || []), ...(providerJobs?.jobs || [])];
  const jobsCompleted = allJobs.filter((job: any) => job.status === 'COMPLETED').length;
  const jobsPosted = postedJobs?.jobs?.length || 0;
  const inProgressJobs =
    providerJobs?.jobs?.filter((job: any) => job.status === 'IN_PROGRESS') || [];

  // Get recent jobs (combine posted and provider jobs, sort by date)
  const recentJobs = allJobs
    .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="bg-muted/50 min-h-screen py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Profile Header */}
        <Card className="mb-6 p-6">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            <div className="relative">
              <Avatar className="h-24 w-24 md:h-32 md:w-32">
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.name} fill />
                ) : (
                  <div className="bg-primary flex h-full w-full items-center justify-center text-3xl font-bold text-white md:text-4xl">
                    {user.name.charAt(0)}
                  </div>
                )}
              </Avatar>
              {user.isVerified && (
                <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-green-500">
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-foreground text-2xl font-bold">{user.name}</h1>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{user.rating}</span>
                    </div>
                    <span className="text-muted-foreground">
                      ({user.reviewCount} {t('profile.reviews')})
                    </span>
                    {user.isVerified && (
                      <Badge variant="outline" className="border-green-600 text-green-600">
                        {t('profile.verified')}
                      </Badge>
                    )}
                  </div>
                </div>
                <Link href="/profile/edit">
                  <Button variant="outline" size="sm">
                    <Edit2 className="mr-2 h-4 w-4" />
                    {t('profile.editProfile')}
                  </Button>
                </Link>
              </div>

              {user.bio && <p className="text-muted-foreground mt-4">{user.bio}</p>}

              <div className="text-muted-foreground mt-4 flex flex-wrap gap-4 text-sm">
                {user.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {user.address}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {user.phone}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {t('profile.memberSince', { date: memberSince })}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card className="p-4 text-center">
            {isLoading ? (
              <Skeleton className="mx-auto h-10 w-20" />
            ) : (
              <p className="text-primary text-3xl font-bold">{jobsCompleted}</p>
            )}
            <p className="text-muted-foreground text-sm">{t('profile.jobsCompleted')}</p>
          </Card>
          <Card className="p-4 text-center">
            {isLoading ? (
              <Skeleton className="mx-auto h-10 w-20" />
            ) : (
              <p className="text-primary text-3xl font-bold">{jobsPosted}</p>
            )}
            <p className="text-muted-foreground text-sm">{t('profile.jobsPosted')}</p>
          </Card>
          <Card className="p-4 text-center">
            {isLoading ? (
              <Skeleton className="mx-auto h-10 w-20" />
            ) : (
              <p className="text-primary text-3xl font-bold">{user.rating?.toFixed(1) || '0.0'}</p>
            )}
            <p className="text-muted-foreground text-sm">{t('profile.rating')}</p>
          </Card>
          <Card className="p-4 text-center">
            {isLoading ? (
              <Skeleton className="mx-auto h-10 w-20" />
            ) : (
              <p className="text-primary text-3xl font-bold">{user.reviewCount || 0}</p>
            )}
            <p className="text-muted-foreground text-sm">{t('profile.reviews')}</p>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activity */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t('profile.recentJobs')}</h2>
              <Link href="/my-jobs" className="text-primary text-sm hover:underline">
                {t('profile.viewAll')}
              </Link>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </>
              ) : recentJobs.length > 0 ? (
                recentJobs.map((job: any) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="hover:bg-muted/50 flex items-center justify-between rounded-lg p-3 transition"
                  >
                    <div>
                      <p className="text-foreground font-medium">{job.title}</p>
                      <p className="text-muted-foreground text-sm">
                        {new Date(job.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${job.budget?.min || 0} - ${job.budget?.max || 0}
                      </p>
                      <Badge
                        variant="outline"
                        className={
                          job.status === 'COMPLETED'
                            ? 'border-green-600 text-green-600'
                            : job.status === 'IN_PROGRESS'
                              ? 'border-primary text-primary'
                              : 'border-muted-foreground text-muted-foreground'
                        }
                      >
                        {job.status === 'COMPLETED'
                          ? t('jobStatus.completed')
                          : job.status === 'IN_PROGRESS'
                            ? t('jobStatus.inProgress')
                            : job.status}
                      </Badge>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  {t('profile.noJobsYet')}
                </p>
              )}
            </div>
          </Card>

          {/* Quick Links */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">{t('profile.quickLinks')}</h2>
            <div className="space-y-2">
              {[
                { href: '/my-jobs', label: t('profile.myJobs'), icon: Briefcase },
                { href: '/reviews', label: t('profile.myReviews'), icon: Star },
                { href: '/settings', label: t('profile.settings'), icon: Settings },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:bg-muted/50 flex items-center justify-between rounded-lg p-3 transition"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="text-muted-foreground h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="text-muted-foreground h-5 w-5" />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
