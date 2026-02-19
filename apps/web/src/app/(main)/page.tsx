'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Shield, Clock, MapPin, Search } from 'lucide-react';
import { Button, Card, CardContent, Badge, UserAvatar } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/hooks/use-auth';
import { useJobs } from '@/hooks/use-jobs';
import { SERVICE_CATEGORIES, JOB_STATUSES } from '@localservices/shared';
import { formatPrice, formatRelativeTime } from '@/lib/utils';

export default function HomePage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { data: jobsData, isLoading } = useJobs({ status: 'OPEN', limit: 6 });

  const categories = Object.values(SERVICE_CATEGORIES).filter((c) => c.id !== 'OTHER');

  const stats = [
    { value: '10K+', label: t('homepage.activeUsers') },
    { value: '5K+', label: t('homepage.jobsCompletedStat') },
    { value: '4.9', label: t('homepage.averageRating') },
    { value: '24/7', label: t('homepage.support') },
  ];

  const features = [
    {
      icon: Shield,
      title: t('homepage.verifiedProviders'),
      description: t('homepage.verifiedProvidersDesc'),
    },
    {
      icon: Star,
      title: t('homepage.ratedReviewed'),
      description: t('homepage.ratedReviewedDesc'),
    },
    {
      icon: Clock,
      title: t('homepage.quickResponse'),
      description: t('homepage.quickResponseDesc'),
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="from-primary/5 to-background relative overflow-hidden bg-gradient-to-b py-20 md:py-32">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              {t('homepage.trustedByUsers')}
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Find Trusted <span className="text-primary">Local Services</span> Near You
            </h1>
            <p className="text-muted-foreground mb-8 text-lg md:text-xl">
              {t('homepage.heroDesc')}
            </p>

            {/* Search Bar */}
            <div className="mx-auto max-w-2xl">
              <div className="dark:bg-card flex flex-col gap-3 rounded-2xl bg-white p-2 shadow-lg sm:flex-row">
                <div className="relative flex-1">
                  <Search className="text-muted-foreground absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={t('jobs.searchPlaceholder')}
                    className="bg-muted/50 focus:ring-primary h-12 w-full rounded-xl pl-12 pr-4 focus:outline-none focus:ring-2"
                  />
                </div>
                <div className="relative flex-1">
                  <MapPin className="text-muted-foreground absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={t('homepage.locationPlaceholder')}
                    className="bg-muted/50 focus:ring-primary h-12 w-full rounded-xl pl-12 pr-4 focus:outline-none focus:ring-2"
                  />
                </div>
                <Link href="/jobs">
                  <Button size="lg" className="h-12 w-full sm:w-auto">
                    {t('common.search')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="bg-primary/10 absolute -left-20 -top-20 h-72 w-72 rounded-full blur-3xl" />
        <div className="bg-secondary/10 absolute -bottom-20 -right-20 h-72 w-72 rounded-full blur-3xl" />
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">{t('jobs.popularCategories')}</h2>
            <p className="text-muted-foreground">{t('homepage.chooseCategories')}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.id} href={`/jobs?category=${category.id}`} className="group">
                <Card className="h-full overflow-hidden transition-all hover:shadow-lg">
                  <div
                    className="h-48 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(https://images.unsplash.com/photo-${
                        category.id === 'BABYSITTING'
                          ? '1503454537195-1dcabb73ffb9'
                          : category.id === 'HOUSE_CLEANING'
                            ? '1581578731548-c64695cc6952'
                            : '1504674900247-0877df9cc836'
                      }?w=400)`,
                    }}
                  />
                  <CardContent className="p-6">
                    <div
                      className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <span style={{ color: category.color }}>{category.icon}</span>
                    </div>
                    <h3 className="group-hover:text-primary mb-2 text-xl font-semibold">
                      {t(category.labelKey)}
                    </h3>
                    <p className="text-muted-foreground">{t(`${category.labelKey}Desc`)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted/30 py-16">
        <div className="container-custom">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-primary text-3xl font-bold md:text-4xl">{stat.value}</div>
                <div className="text-muted-foreground mt-1 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Jobs Section */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold">{t('jobs.recentJobs')}</h2>
              <p className="text-muted-foreground">{t('homepage.latestOpportunities')}</p>
            </div>
            <Link href="/jobs">
              <Button variant="outline">
                {t('common.seeAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid-cards">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-card bg-muted animate-pulse" />
                  <CardContent className="p-4">
                    <div className="bg-muted mb-2 h-4 w-3/4 animate-pulse rounded" />
                    <div className="bg-muted h-3 w-1/2 animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid-cards">
              {jobsData?.data?.map((job: any) => (
                <Link
                  key={job.id}
                  href={
                    isAuthenticated
                      ? `/jobs/${job.id}`
                      : '/register?message=Create an account to view job details and make offers'
                  }
                >
                  <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
                    <div className="aspect-card bg-muted relative overflow-hidden">
                      {job.images?.[0] ? (
                        <Image
                          src={job.images[0].url}
                          alt={job.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="text-muted-foreground flex h-full items-center justify-center">
                          {t('homepage.noImage')}
                        </div>
                      )}
                      {job.isPromoted && (
                        <Badge className="absolute left-3 top-3" variant="default">
                          {t('jobs.featured')}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <Badge
                          variant="outline"
                          style={{
                            borderColor:
                              SERVICE_CATEGORIES[job.category as keyof typeof SERVICE_CATEGORIES]
                                ?.color,
                            color:
                              SERVICE_CATEGORIES[job.category as keyof typeof SERVICE_CATEGORIES]
                                ?.color,
                          }}
                        >
                          {t(
                            SERVICE_CATEGORIES[job.category as keyof typeof SERVICE_CATEGORIES]
                              ?.labelKey || 'categories.other'
                          )}
                        </Badge>
                        <span className="text-primary text-lg font-semibold">
                          {formatPrice(Number(job.budget), job.currency)}
                        </span>
                      </div>
                      <h3 className="group-hover:text-primary mb-1 line-clamp-2 font-semibold">
                        {job.title}
                      </h3>
                      <div className="text-muted-foreground mb-3 flex items-center text-sm">
                        <MapPin className="mr-1 h-3 w-3" />
                        {job.location}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <UserAvatar
                            src={job.poster?.avatar}
                            name={job.poster?.name || 'User'}
                            size="sm"
                          />
                          <span className="text-muted-foreground text-sm">{job.poster?.name}</span>
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {formatRelativeTime(job.createdAt)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">{t('homepage.whyChoose')}</h2>
            <p className="text-muted-foreground">{t('homepage.whyChooseDesc')}</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
                  <feature.icon className="text-primary h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="from-primary to-primary/80 rounded-3xl bg-gradient-to-r p-8 text-center text-white md:p-16">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">{t('homepage.readyToStart')}</h2>
            <p className="mb-8 text-lg opacity-90">{t('homepage.readyToStartDesc')}</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/jobs">
                <Button size="xl" variant="secondary">
                  {t('homepage.browseServices')}
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="xl"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  {t('homepage.becomeProvider')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
