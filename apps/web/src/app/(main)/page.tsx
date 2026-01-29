'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Shield, Clock, MapPin, Search } from 'lucide-react';
import { Button, Card, CardContent, Badge, UserAvatar } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';
import { useJobs } from '@/hooks/use-jobs';
import { SERVICE_CATEGORIES, JOB_STATUSES } from '@localservices/shared';
import { formatPrice, formatRelativeTime } from '@/lib/utils';

export default function HomePage() {
  const { t } = useTranslation();
  const { data: jobsData, isLoading } = useJobs({ status: 'OPEN', limit: 6 });

  const categories = Object.values(SERVICE_CATEGORIES).filter(
    (c) => c.id !== 'OTHER'
  );

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '5K+', label: 'Jobs Completed' },
    { value: '4.9', label: 'Average Rating' },
    { value: '24/7', label: 'Support' },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Verified Providers',
      description: 'All service providers are verified for your safety and peace of mind.',
    },
    {
      icon: Star,
      title: 'Rated & Reviewed',
      description: 'Read real reviews from other users before making a decision.',
    },
    {
      icon: Clock,
      title: 'Quick Response',
      description: 'Get offers within hours and start your project fast.',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              Trusted by 10,000+ users
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Find Trusted{' '}
              <span className="text-primary">Local Services</span> Near You
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Connect with babysitters, house cleaners, local food vendors, and more.
              Post a job and receive offers from verified providers.
            </p>

            {/* Search Bar */}
            <div className="mx-auto max-w-2xl">
              <div className="flex flex-col gap-3 rounded-2xl bg-white p-2 shadow-lg dark:bg-card sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t('jobs.searchPlaceholder')}
                    className="h-12 w-full rounded-xl bg-muted/50 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Location"
                    className="h-12 w-full rounded-xl bg-muted/50 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Link href="/jobs">
                  <Button size="lg" className="h-12 w-full sm:w-auto">
                    Search
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">{t('jobs.popularCategories')}</h2>
            <p className="text-muted-foreground">
              Choose from our most popular service categories
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/jobs?category=${category.id}`}
                className="group"
              >
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
                    <h3 className="mb-2 text-xl font-semibold group-hover:text-primary">
                      {t(category.labelKey)}
                    </h3>
                    <p className="text-muted-foreground">
                      {t(`${category.labelKey}Desc`)}
                    </p>
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
                <div className="text-3xl font-bold text-primary md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
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
              <p className="text-muted-foreground">
                Latest opportunities from our community
              </p>
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
                  <div className="aspect-card animate-pulse bg-muted" />
                  <CardContent className="p-4">
                    <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid-cards">
              {jobsData?.data?.map((job: any) => (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
                    <div className="relative aspect-card overflow-hidden bg-muted">
                      {job.images?.[0] ? (
                        <Image
                          src={job.images[0].url}
                          alt={job.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          No image
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
                              SERVICE_CATEGORIES[
                                job.category as keyof typeof SERVICE_CATEGORIES
                              ]?.color,
                            color:
                              SERVICE_CATEGORIES[
                                job.category as keyof typeof SERVICE_CATEGORIES
                              ]?.color,
                          }}
                        >
                          {t(
                            SERVICE_CATEGORIES[
                              job.category as keyof typeof SERVICE_CATEGORIES
                            ]?.labelKey || 'categories.other'
                          )}
                        </Badge>
                        <span className="text-lg font-semibold text-primary">
                          {formatPrice(Number(job.budget), job.currency)}
                        </span>
                      </div>
                      <h3 className="mb-1 line-clamp-2 font-semibold group-hover:text-primary">
                        {job.title}
                      </h3>
                      <div className="mb-3 flex items-center text-sm text-muted-foreground">
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
                          <span className="text-sm text-muted-foreground">
                            {job.poster?.name}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
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
            <h2 className="mb-4 text-3xl font-bold">Why Choose LocalServices?</h2>
            <p className="text-muted-foreground">
              We make finding local services easy and safe
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <feature.icon className="h-8 w-8 text-primary" />
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
          <div className="rounded-3xl bg-gradient-to-r from-primary to-primary/80 p-8 text-center text-white md:p-16">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mb-8 text-lg opacity-90">
              Join thousands of users finding trusted local services every day.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/jobs">
                <Button size="xl" variant="secondary">
                  Browse Services
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="xl"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  Become a Provider
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
