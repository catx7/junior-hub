'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import { Plus, Briefcase, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { jobsApi } from '@/lib/api';
import { SERVICE_CATEGORIES } from '@localservices/shared';

export default function MyJobsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'posted' | 'active'>('posted');
  const { t } = useTranslation();

  const { data: postedJobs, isLoading: isLoadingPosted } = useQuery({
    queryKey: ['my-jobs', 'posted', user?.id],
    queryFn: () => jobsApi.list({ posterId: user?.id }),
    enabled: !!user?.id,
  });

  const { data: activeJobs, isLoading: isLoadingActive } = useQuery({
    queryKey: ['my-jobs', 'active', user?.id],
    queryFn: () => jobsApi.list({ providerId: user?.id }),
    enabled: !!user?.id,
  });

  const isLoading = activeTab === 'posted' ? isLoadingPosted : isLoadingActive;
  const jobs = activeTab === 'posted' ? postedJobs?.data || [] : activeJobs?.data || [];

  const stats = {
    posted: postedJobs?.data?.length || 0,
    active: activeJobs?.data?.filter((j: any) => j.status === 'IN_PROGRESS').length || 0,
    completed: [...(postedJobs?.data || []), ...(activeJobs?.data || [])].filter(
      (j: any) => j.status === 'COMPLETED'
    ).length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'border-green-600 text-green-600 dark:text-green-400';
      case 'IN_PROGRESS':
        return 'border-blue-600 text-primary';
      case 'PENDING_COMPLETION':
        return 'border-amber-600 text-amber-600';
      case 'COMPLETED':
        return 'border-gray-600 text-muted-foreground';
      case 'CANCELLED':
        return 'border-red-600 text-red-600';
      default:
        return 'border-gray-400 text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    return status === 'PENDING_COMPLETION' ? t('myJobs.pendingCompletion') : status;
  };

  return (
    <div className="bg-muted/50 min-h-screen py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-3xl font-bold">{t('myJobs.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('myJobs.subtitle')}</p>
          </div>
          <Link href="/jobs/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('myJobs.postNewJob')}
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{t('myJobs.postedJobs')}</p>
                <p className="text-foreground text-3xl font-bold">{stats.posted}</p>
              </div>
              <div className="bg-primary/10 rounded-full p-3">
                <Briefcase className="text-primary h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{t('myJobs.activeJobs')}</p>
                <p className="text-foreground text-3xl font-bold">{stats.active}</p>
              </div>
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/20">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{t('myJobs.completed')}</p>
                <p className="text-foreground text-3xl font-bold">{stats.completed}</p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b">
          <button
            onClick={() => setActiveTab('posted')}
            className={`pb-3 text-sm font-medium transition ${
              activeTab === 'posted'
                ? 'border-primary text-primary border-b-2'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('myJobs.postedByMe')} ({stats.posted})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 text-sm font-medium transition ${
              activeTab === 'active'
                ? 'border-primary text-primary border-b-2'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('myJobs.workingOn')} ({activeJobs?.data?.length || 0})
          </button>
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="flex gap-6">
                  <Skeleton className="h-32 w-48 flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job: any) => {
              const categoryInfo =
                SERVICE_CATEGORIES[job.category as keyof typeof SERVICE_CATEGORIES];
              return (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <Card className="p-6 transition hover:shadow-lg">
                    <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                      {/* Image */}
                      <div className="bg-muted relative h-32 w-full flex-shrink-0 overflow-hidden rounded-lg md:w-48">
                        {job.images && job.images.length > 0 && job.images[0].url ? (
                          <SafeImage
                            src={job.images[0].url}
                            alt={job.title}
                            fill
                            className="object-cover"
                            fallback={
                              <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                                <Briefcase className="h-12 w-12" />
                              </div>
                            }
                          />
                        ) : (
                          <div className="text-muted-foreground flex h-full items-center justify-center">
                            <Briefcase className="h-12 w-12" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="text-foreground mb-2 text-xl font-semibold">
                              {job.title}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              <Badge
                                style={{
                                  backgroundColor: `${categoryInfo?.color}20`,
                                  color: categoryInfo?.color,
                                }}
                              >
                                {categoryInfo?.label || job.category}
                              </Badge>
                              <Badge variant="outline" className={getStatusColor(job.status)}>
                                {getStatusLabel(job.status)}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-primary text-2xl font-bold">
                              ${job.budget?.min || job.budget || 0}
                              {job.budget?.max &&
                                job.budget.max !== job.budget.min &&
                                ` - $${job.budget.max}`}
                            </p>
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-3 line-clamp-2">{job.description}</p>

                        <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                          <span>📍 {job.location}</span>
                          <span>
                            📅{' '}
                            {new Date(job.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span>
                            💬 {job._count?.offers || 0} {t('jobs.offers').toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              {activeTab === 'posted' ? (
                <Briefcase className="text-muted-foreground h-8 w-8" />
              ) : (
                <Clock className="text-muted-foreground h-8 w-8" />
              )}
            </div>
            <h3 className="text-foreground mb-2 text-lg font-semibold">
              {activeTab === 'posted' ? t('myJobs.noJobsPosted') : t('myJobs.noActiveJobs')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {activeTab === 'posted' ? t('myJobs.postFirstJob') : t('myJobs.notWorkingOnJobs')}
            </p>
            {activeTab === 'posted' && (
              <Link href="/jobs/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('myJobs.postNewJob')}
                </Button>
              </Link>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
