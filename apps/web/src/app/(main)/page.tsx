import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Star,
  Shield,
  Clock,
  MapPin,
  FileText,
  MessageCircle,
  CheckCircle,
} from 'lucide-react';
import { CategoryIcon } from '@/components/ui/category-icon';
import { Button, Card, CardContent, Badge, UserAvatar } from '@/components/ui';
import { HomeSearchBar } from '@/components/home-search-bar';
import { t } from '@localservices/shared';
import { SERVICE_CATEGORIES } from '@localservices/shared';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import { prisma } from '@localservices/database';

export const revalidate = 60;

async function getRecentJobs() {
  const jobs = await prisma.job.findMany({
    where: {
      status: 'OPEN',
      category: { not: 'LOCAL_FOOD' },
    },
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: {
      poster: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      images: {
        orderBy: { order: 'asc' },
        take: 1,
      },
      promotion: {
        where: {
          isActive: true,
          endDate: { gte: new Date() },
        },
      },
    },
  });

  return jobs.map((job) => ({
    id: job.id,
    title: job.title,
    location: job.location,
    budget: Number(job.budget),
    currency: job.currency,
    category: job.category,
    createdAt: job.createdAt.toISOString(),
    isPromoted: !!job.promotion,
    poster: job.poster,
    image: job.images[0]?.url || null,
  }));
}

const tr = (key: string) => t('ro', key);

export default async function HomePage() {
  const jobs = await getRecentJobs();

  const categories = Object.values(SERVICE_CATEGORIES).filter((c) => c.id !== 'OTHER');

  const stats = [
    { value: '10K+', label: tr('homepage.activeUsers') },
    { value: '5K+', label: tr('homepage.jobsCompletedStat') },
    { value: '4.9', label: tr('homepage.averageRating') },
    { value: '24/7', label: tr('homepage.support') },
  ];

  const features = [
    {
      icon: Shield,
      title: tr('homepage.verifiedProviders'),
      description: tr('homepage.verifiedProvidersDesc'),
    },
    {
      icon: Star,
      title: tr('homepage.ratedReviewed'),
      description: tr('homepage.ratedReviewedDesc'),
    },
    {
      icon: Clock,
      title: tr('homepage.quickResponse'),
      description: tr('homepage.quickResponseDesc'),
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="from-primary/5 to-background relative overflow-hidden bg-gradient-to-b py-20 md:py-32">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              {tr('homepage.trustedByUsers')}
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              {tr('homepage.heroTitle').split(tr('homepage.heroTitleHighlight'))[0]}
              <span className="text-primary">{tr('homepage.heroTitleHighlight')}</span>
              {tr('homepage.heroTitle').split(tr('homepage.heroTitleHighlight'))[1] || ''}
            </h1>
            <p className="text-muted-foreground mb-8 text-lg md:text-xl">
              {tr('homepage.heroDesc')}
            </p>

            <HomeSearchBar />
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
            <h2 className="mb-4 text-3xl font-bold">{tr('jobs.popularCategories')}</h2>
            <p className="text-muted-foreground">{tr('homepage.chooseCategories')}</p>
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
                      <CategoryIcon
                        name={category.icon}
                        className="h-5 w-5"
                        style={{ color: category.color }}
                      />
                    </div>
                    <h3 className="group-hover:text-primary mb-2 text-xl font-semibold">
                      {tr(category.labelKey)}
                    </h3>
                    <p className="text-muted-foreground">{tr(`${category.labelKey}Desc`)}</p>
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

      {/* How It Works Section */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">{tr('homepage.howItWorks')}</h2>
            <p className="text-muted-foreground">{tr('homepage.howItWorksDesc')}</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: FileText,
                step: '1',
                title: tr('homepage.step1Title'),
                desc: tr('homepage.step1Desc'),
              },
              {
                icon: MessageCircle,
                step: '2',
                title: tr('homepage.step2Title'),
                desc: tr('homepage.step2Desc'),
              },
              {
                icon: CheckCircle,
                step: '3',
                title: tr('homepage.step3Title'),
                desc: tr('homepage.step3Desc'),
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
                  <item.icon className="text-primary h-8 w-8" />
                </div>
                <div className="bg-primary absolute -top-2 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full text-xs font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
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
              <h2 className="mb-2 text-3xl font-bold">{tr('jobs.recentJobs')}</h2>
              <p className="text-muted-foreground">{tr('homepage.latestOpportunities')}</p>
            </div>
            <Link href="/jobs">
              <Button variant="outline">
                {tr('common.seeAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {jobs.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center">{tr('jobs.noJobsFound')}</p>
          ) : (
            <div className="grid-cards">
              {jobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
                    <div className="aspect-card bg-muted relative overflow-hidden">
                      {job.image ? (
                        <Image
                          src={job.image}
                          alt={job.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="text-muted-foreground flex h-full items-center justify-center">
                          {tr('homepage.noImage')}
                        </div>
                      )}
                      {job.isPromoted && (
                        <Badge className="absolute left-3 top-3" variant="default">
                          {tr('jobs.featured')}
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
                          {tr(
                            SERVICE_CATEGORIES[job.category as keyof typeof SERVICE_CATEGORIES]
                              ?.labelKey || 'categories.other'
                          )}
                        </Badge>
                        <span className="text-primary text-lg font-semibold">
                          {formatPrice(job.budget, job.currency)}
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
            <h2 className="mb-4 text-3xl font-bold">{tr('homepage.whyChoose')}</h2>
            <p className="text-muted-foreground">{tr('homepage.whyChooseDesc')}</p>
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
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">{tr('homepage.readyToStart')}</h2>
            <p className="mb-8 text-lg opacity-90">{tr('homepage.readyToStartDesc')}</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/jobs">
                <Button size="xl" variant="secondary">
                  {tr('homepage.browseServices')}
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="xl"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  {tr('homepage.becomeProvider')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
