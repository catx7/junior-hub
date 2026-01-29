'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  MapPin,
  Filter,
  SlidersHorizontal,
  Grid,
  List,
  X,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Input,
  UserAvatar,
  Skeleton,
} from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';
import { useJobs } from '@/hooks/use-jobs';
import { SERVICE_CATEGORIES } from '@localservices/shared';
import { formatPrice, formatRelativeTime, cn } from '@/lib/utils';
import type { ServiceCategory, JobStatus } from '@localservices/shared';

export default function JobsPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ServiceCategory | ''>(
    (searchParams.get('category') as ServiceCategory) || ''
  );
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useJobs({
    status: 'OPEN' as JobStatus,
    category: category || undefined,
    minBudget: minBudget ? Number(minBudget) : undefined,
    maxBudget: maxBudget ? Number(maxBudget) : undefined,
    search: search || undefined,
    sort: sortBy as 'createdAt' | 'budget',
    order: sortBy === 'budget' ? 'desc' : 'desc',
  });

  const jobs = data?.data || [];
  const categories = Object.values(SERVICE_CATEGORIES);

  const clearFilters = () => {
    setCategory('');
    setMinBudget('');
    setMaxBudget('');
    setSearch('');
  };

  const hasFilters = category || minBudget || maxBudget || search;

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="container-custom py-8">
          <h1 className="mb-2 text-3xl font-bold">{t('jobs.title')}</h1>
          <p className="text-muted-foreground">
            Find the perfect service provider for your needs
          </p>
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
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                      'flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted',
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
                        'flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted',
                        category === cat.id && 'bg-muted font-medium'
                      )}
                    >
                      <span
                        className="mr-2 h-3 w-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {t(cat.labelKey)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <h3 className="mb-3 font-semibold">{t('jobs.budget')}</h3>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                    className="w-full"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              {hasFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  <X className="mr-2 h-4 w-4" />
                  {t('common.clear')} Filters
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
                  Filters
                </Button>

                {/* Active Filters */}
                {hasFilters && (
                  <div className="flex flex-wrap gap-2">
                    {category && (
                      <Badge variant="secondary" className="gap-1">
                        {t(
                          SERVICE_CATEGORIES[
                            category as keyof typeof SERVICE_CATEGORIES
                          ]?.labelKey
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
                  className="h-10 rounded-lg border bg-background px-3 text-sm"
                >
                  <option value="createdAt">{t('jobs.sortNewest')}</option>
                  <option value="budget">{t('jobs.sortPriceHigh')}</option>
                </select>

                {/* View Toggle */}
                <div className="flex rounded-lg border bg-background p-1">
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

            {/* Mobile Filters */}
            {showFilters && (
              <Card className="mb-6 p-4 lg:hidden">
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={t('jobs.searchPlaceholder')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Categories */}
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
                        {t(cat.labelKey)}
                      </Button>
                    ))}
                  </div>

                  {/* Budget */}
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min budget"
                      value={minBudget}
                      onChange={(e) => setMinBudget(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max budget"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Results */}
            {isLoading ? (
              <div
                className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'
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
              <div className="rounded-xl border bg-background py-16 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">
                  {t('jobs.noJobsFound')}
                </h3>
                <p className="mb-4 text-muted-foreground">
                  {t('jobs.noJobsFoundDesc')}
                </p>
                {hasFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div
                className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'
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
                          'relative overflow-hidden bg-muted',
                          viewMode === 'grid' ? 'aspect-card' : 'h-32 w-48 shrink-0'
                        )}
                      >
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
                          <Badge
                            className="absolute left-3 top-3"
                            variant="default"
                          >
                            {t('jobs.featured')}
                          </Badge>
                        )}
                      </div>
                      <CardContent
                        className={cn('p-4', viewMode === 'list' && 'flex-1')}
                      >
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

            {/* Pagination placeholder */}
            {jobs.length > 0 && (
              <div className="mt-8 flex justify-center">
                <Button variant="outline">Load More</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
