'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import { useSearchParams } from 'next/navigation';
import { Search, MapPin, Filter, SlidersHorizontal, Grid, List, X } from 'lucide-react';
import { CategoryIcon } from '@/components/ui/category-icon';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Input,
  UserAvatar,
  Skeleton,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  Breadcrumb,
} from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/hooks/use-auth';
import { useJobs } from '@/hooks/use-jobs';
import { SERVICE_CATEGORIES, JOB_CATEGORIES } from '@localservices/shared';
import { formatPrice, formatRelativeTime, cn } from '@/lib/utils';
import type { ServiceCategory, JobStatus } from '@localservices/shared';

type JobType = 'SERVICE_REQUEST' | 'SERVICE_OFFERING';

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Skeleton className="h-12 w-48" />
        </div>
      }
    >
      <JobsPageContent />
    </Suspense>
  );
}

function JobsPageContent() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ServiceCategory | ''>(
    (searchParams.get('category') as ServiceCategory) || ''
  );
  const [jobType, setJobType] = useState<JobType | ''>('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useJobs({
    status: 'OPEN' as JobStatus,
    category: category || undefined,
    jobType: jobType || undefined,
    minBudget: minBudget ? Number(minBudget) : undefined,
    maxBudget: maxBudget ? Number(maxBudget) : undefined,
    search: search || undefined,
    sort: sortBy as 'createdAt' | 'budget',
    order: sortBy === 'budget' ? 'desc' : 'desc',
  } as any);

  const jobs = data?.data || [];
  const categories = Object.values(JOB_CATEGORIES);

  const clearFilters = () => {
    setCategory('');
    setJobType('');
    setMinBudget('');
    setMaxBudget('');
    setSearch('');
  };

  const hasFilters = category || jobType || minBudget || maxBudget || search;

  return (
    <div className="bg-muted/20 min-h-screen">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container-custom py-8">
          <Breadcrumb
            items={[{ label: 'Acasă', href: '/' }, { label: 'Anunțuri' }]}
            className="mb-4"
          />
          <h1 className="mb-2 text-3xl font-bold">{t('jobs.title')}</h1>
          <p className="text-muted-foreground">{t('jobs.browseSubtitle')}</p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Search */}
              <div>
                <h3 className="mb-3 font-semibold">{t('common.search')}</h3>
                <div className="relative">
                  <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <Input
                    placeholder={t('jobs.searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="mb-3 font-semibold">{t('jobs.category')}</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setCategory('')}
                    className={cn(
                      'hover:bg-muted flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors',
                      !category && 'bg-muted font-medium'
                    )}
                  >
                    {t('categories.all')}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id as ServiceCategory)}
                      className={cn(
                        'hover:bg-muted flex w-full items-center rounded-lg px-3 py-2 transition-colors',
                        category === cat.id && 'bg-muted font-medium'
                      )}
                    >
                      <CategoryIcon name={cat.icon} className="mr-2 h-5 w-5" />
                      <span className="text-sm">{t(cat.labelKey)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Type */}
              <div>
                <h3 className="mb-3 font-semibold">{t('jobs.type')}</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setJobType('')}
                    className={cn(
                      'hover:bg-muted flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors',
                      !jobType && 'bg-muted font-medium'
                    )}
                  >
                    {t('jobs.allTypes')}
                  </button>
                  <button
                    onClick={() => setJobType('SERVICE_REQUEST')}
                    className={cn(
                      'hover:bg-muted flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors',
                      jobType === 'SERVICE_REQUEST' && 'bg-muted font-medium'
                    )}
                  >
                    <span className="mr-2 inline-block h-2 w-2 rounded-full bg-blue-500" />
                    {t('jobs.serviceRequests')}
                  </button>
                  <button
                    onClick={() => setJobType('SERVICE_OFFERING')}
                    className={cn(
                      'hover:bg-muted flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors',
                      jobType === 'SERVICE_OFFERING' && 'bg-muted font-medium'
                    )}
                  >
                    <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
                    {t('jobs.serviceOfferings')}
                  </button>
                </div>
              </div>

              {/* Budget */}
              <div>
                <h3 className="mb-3 font-semibold">{t('jobs.budget')}</h3>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder={t('jobs.min')}
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                    className="w-full"
                  />
                  <Input
                    type="number"
                    placeholder={t('jobs.max')}
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  <X className="mr-2 h-4 w-4" />
                  {t('jobs.clearFilters')}
                </Button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {/* Mobile Filter Button */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {t('jobs.filters')}
                </Button>

                {/* Active Filters */}
                {hasFilters && (
                  <div className="flex flex-wrap gap-2">
                    {category && (
                      <Badge variant="secondary" className="gap-1">
                        {t(
                          SERVICE_CATEGORIES[category as keyof typeof SERVICE_CATEGORIES]?.labelKey
                        )}
                        <button onClick={() => setCategory('')}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {(minBudget || maxBudget) && (
                      <Badge variant="secondary" className="gap-1">
                        ${minBudget || '0'} - ${maxBudget || '∞'}
                        <button
                          onClick={() => {
                            setMinBudget('');
                            setMaxBudget('');
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-background h-10 rounded-lg border px-3 text-sm"
                >
                  <option value="createdAt">{t('jobs.sortNewest')}</option>
                  <option value="budget">{t('jobs.sortPriceHigh')}</option>
                </select>

                {/* View Toggle */}
                <div className="bg-background flex rounded-lg border p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'rounded-md p-2 transition-colors',
                      viewMode === 'grid' && 'bg-muted'
                    )}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'rounded-md p-2 transition-colors',
                      viewMode === 'list' && 'bg-muted'
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Filters Drawer */}
            <Drawer open={showFilters} onOpenChange={setShowFilters}>
              <DrawerContent side="bottom" className="max-h-[85vh]">
                <DrawerHeader>
                  <DrawerTitle>{t('jobs.filters')}</DrawerTitle>
                </DrawerHeader>
                <div className="space-y-6 overflow-y-auto p-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <Input
                      placeholder={t('jobs.searchPlaceholder')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Categories */}
                  <div>
                    <h3 className="mb-3 font-semibold">{t('jobs.category')}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={!category ? 'default' : 'outline'}
                        onClick={() => setCategory('')}
                      >
                        {t('categories.all')}
                      </Button>
                      {categories.map((cat) => (
                        <Button
                          key={cat.id}
                          size="sm"
                          variant={category === cat.id ? 'default' : 'outline'}
                          onClick={() => setCategory(cat.id as ServiceCategory)}
                        >
                          <CategoryIcon name={cat.icon} className="mr-1 h-4 w-4" />
                          <span className="text-sm">{t(cat.labelKey)}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Job Type */}
                  <div>
                    <h3 className="mb-3 font-semibold">{t('jobs.type')}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={!jobType ? 'default' : 'outline'}
                        onClick={() => setJobType('')}
                      >
                        {t('jobs.allTypes')}
                      </Button>
                      <Button
                        size="sm"
                        variant={jobType === 'SERVICE_REQUEST' ? 'default' : 'outline'}
                        onClick={() => setJobType('SERVICE_REQUEST')}
                      >
                        {t('jobs.serviceRequests')}
                      </Button>
                      <Button
                        size="sm"
                        variant={jobType === 'SERVICE_OFFERING' ? 'default' : 'outline'}
                        onClick={() => setJobType('SERVICE_OFFERING')}
                      >
                        {t('jobs.serviceOfferings')}
                      </Button>
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <h3 className="mb-3 font-semibold">{t('jobs.budget')}</h3>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder={t('jobs.minBudget')}
                        value={minBudget}
                        onChange={(e) => setMinBudget(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder={t('jobs.maxBudget')}
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {hasFilters && (
                      <Button variant="outline" onClick={clearFilters} className="flex-1">
                        {t('jobs.clearFilters')}
                      </Button>
                    )}
                    <DrawerClose asChild>
                      <Button className="flex-1">{t('common.apply')}</Button>
                    </DrawerClose>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>

            {/* Result Count */}
            {!isLoading && (
              <p className="text-muted-foreground mb-4 text-sm">
                {jobs.length > 0 ? `${jobs.length} ${t('jobs.title').toLowerCase()}` : null}
              </p>
            )}

            {/* Results */}
            {isLoading ? (
              <div
                className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                    : 'space-y-4'
                )}
              >
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-card" />
                    <CardContent className="p-4">
                      <Skeleton className="mb-2 h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-background rounded-xl border py-16 text-center">
                <Search className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-2 text-lg font-semibold">{t('jobs.noJobsFound')}</h3>
                <p className="text-muted-foreground mb-4">{t('jobs.noJobsFoundDesc')}</p>
                {hasFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    {t('jobs.clearFilters')}
                  </Button>
                )}
              </div>
            ) : (
              <div
                className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                    : 'space-y-4'
                )}
              >
                {jobs.map((job: any) => (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <Card
                      className={cn(
                        'group overflow-hidden transition-all hover:shadow-lg',
                        viewMode === 'list' && 'flex'
                      )}
                    >
                      <div
                        className={cn(
                          'bg-muted relative overflow-hidden',
                          viewMode === 'grid' ? 'aspect-card' : 'h-32 w-48 shrink-0'
                        )}
                      >
                        {job.images?.[0]?.url ? (
                          <SafeImage
                            src={job.images[0].url}
                            alt={job.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            fallback={
                              <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                                {t('jobs.noImage')}
                              </div>
                            }
                          />
                        ) : (
                          <div className="text-muted-foreground flex h-full items-center justify-center">
                            {t('jobs.noImage')}
                          </div>
                        )}
                        {job.isPromoted && (
                          <Badge className="absolute left-3 top-3" variant="default">
                            {t('jobs.featured')}
                          </Badge>
                        )}
                      </div>
                      <CardContent className={cn('p-4', viewMode === 'list' && 'flex-1')}>
                        <div className="mb-2 flex flex-wrap items-start justify-between gap-1">
                          <div className="flex flex-wrap gap-1">
                            <Badge
                              className={
                                job.jobType === 'SERVICE_OFFERING'
                                  ? 'bg-green-600 text-xs'
                                  : 'bg-blue-600 text-xs'
                              }
                            >
                              {job.jobType === 'SERVICE_OFFERING'
                                ? t('jobs.offering')
                                : t('jobs.request')}
                            </Badge>
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
                              <CategoryIcon
                                name={
                                  SERVICE_CATEGORIES[
                                    job.category as keyof typeof SERVICE_CATEGORIES
                                  ]?.icon
                                }
                                className="mr-1 h-3 w-3"
                              />
                              <span className="text-xs">
                                {t(
                                  SERVICE_CATEGORIES[
                                    job.category as keyof typeof SERVICE_CATEGORIES
                                  ]?.labelKey || 'categories.other'
                                )}
                              </span>
                            </Badge>
                          </div>
                          <span className="text-primary text-lg font-semibold">
                            {job.budget
                              ? `${formatPrice(Number(job.budget), job.currency)}${
                                  job.pricingType === 'HOURLY'
                                    ? t('jobs.perHrSuffix')
                                    : job.pricingType === 'PER_LOCATION'
                                      ? t('jobs.perVisitSuffix')
                                      : ''
                                }`
                              : job.jobType === 'SERVICE_OFFERING'
                                ? t('jobs.contactForPrice')
                                : t('jobs.openBudget')}
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
                            <span className="text-muted-foreground text-sm">
                              {job.poster?.name}
                            </span>
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

            {/* Sign up prompt for guests */}
            {!isAuthenticated && jobs.length > 0 && (
              <div className="bg-primary/5 dark:bg-primary/10 mt-8 rounded-xl border p-8 text-center">
                <h3 className="mb-2 text-lg font-semibold">{t('jobs.wantToSeeMore')}</h3>
                <p className="text-muted-foreground mb-4">{t('jobs.signUpBrowseDesc')}</p>
                <Link href="/register">
                  <Button>{t('jobs.signUpFree')}</Button>
                </Link>
              </div>
            )}

            {/* Pagination placeholder */}
            {jobs.length > 0 && (
              <div className="mt-8 flex justify-center">
                <Button variant="outline">{t('jobs.loadMore')}</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
