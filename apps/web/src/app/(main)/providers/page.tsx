'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, MapPin, Filter, Star, X, Clock, Shield, Award, Navigation } from 'lucide-react';
import { Button, Card, CardContent, Badge, Input, UserAvatar, Skeleton } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/hooks/use-auth';
import { useProviders } from '@/hooks/use-providers';
import { JOB_CATEGORIES } from '@localservices/shared';
import { formatPrice, formatRelativeTime, cn } from '@/lib/utils';
import type { ServiceCategory } from '@localservices/shared';

export default function ProvidersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Skeleton className="h-12 w-48" />
        </div>
      }
    >
      <ProvidersPageContent />
    </Suspense>
  );
}

const LANGUAGE_OPTIONS = [
  { value: 'ro', labelKey: 'providers.langRo' },
  { value: 'en', labelKey: 'providers.langEn' },
  { value: 'hu', labelKey: 'providers.langHu' },
  { value: 'de', labelKey: 'providers.langDe' },
];

const CERTIFICATION_OPTIONS = [
  { value: 'first_aid', labelKey: 'providers.certFirstAid' },
  { value: 'cpr', labelKey: 'providers.certCpr' },
  { value: 'pedagogy', labelKey: 'providers.certPedagogy' },
];

function ProvidersPageContent() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ServiceCategory | ''>(
    (searchParams.get('category') as ServiceCategory) || ''
  );
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [minRating, setMinRating] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [specialNeeds, setSpecialNeeds] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [geoLocation, setGeoLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState('50');

  const { data, isLoading } = useProviders({
    category: category || undefined,
    search: search || undefined,
    minRate: minRate ? Number(minRate) : undefined,
    maxRate: maxRate ? Number(maxRate) : undefined,
    minRating: minRating ? Number(minRating) : undefined,
    minExperience: minExperience ? Number(minExperience) : undefined,
    languages: selectedLanguages.length > 0 ? selectedLanguages.join(',') : undefined,
    certifications: selectedCerts.length > 0 ? selectedCerts.join(',') : undefined,
    specialNeeds: specialNeeds || undefined,
    sort: sortBy,
    lat: geoLocation?.lat,
    lng: geoLocation?.lng,
    radius: geoLocation ? Number(radius) : undefined,
  });

  const allProviders = data?.data || [];
  const total = data?.pagination?.total || 0;
  const providers = allProviders;
  const categories = Object.values(JOB_CATEGORIES);

  const clearFilters = () => {
    setCategory('');
    setMinRate('');
    setMaxRate('');
    setMinRating('');
    setMinExperience('');
    setSelectedLanguages([]);
    setSelectedCerts([]);
    setSpecialNeeds(false);
    setSearch('');
    setGeoLocation(null);
  };

  const hasFilters =
    category ||
    minRate ||
    maxRate ||
    minRating ||
    minExperience ||
    selectedLanguages.length > 0 ||
    selectedCerts.length > 0 ||
    specialNeeds ||
    search ||
    geoLocation;

  const handleNearMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeoLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setSortBy('distance');
        },
        () => {
          // Geolocation denied - do nothing
        }
      );
    }
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const toggleCert = (cert: string) => {
    setSelectedCerts((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  return (
    <div className="bg-muted/20 min-h-screen">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container-custom py-8">
          <h1 className="mb-2 text-3xl font-bold">{t('providers.title')}</h1>
          <p className="text-muted-foreground">{t('providers.subtitle')}</p>
          {!isLoading && total > 0 && (
            <p className="text-muted-foreground mt-1 text-sm">
              {total === 1
                ? t('providers.resultCountSingular')
                : t('providers.resultCount', { count: total })}
            </p>
          )}
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Search */}
              <div>
                <h3 className="mb-3 font-semibold">{t('common.search')}</h3>
                <div className="relative">
                  <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <Input
                    placeholder={t('providers.searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Near Me */}
              <div>
                <Button
                  variant={geoLocation ? 'default' : 'outline'}
                  onClick={handleNearMe}
                  className="w-full"
                  size="sm"
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  {t('providers.nearMe')}
                </Button>
                {geoLocation && (
                  <div className="mt-2">
                    <label className="text-muted-foreground mb-1 block text-xs">
                      {t('providers.radius')}: {radius} {t('providers.km')}
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="200"
                      step="5"
                      value={radius}
                      onChange={(e) => setRadius(e.target.value)}
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              {/* Categories */}
              <div>
                <h3 className="mb-3 font-semibold">{t('providers.category')}</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setCategory('')}
                    className={cn(
                      'hover:bg-muted flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors',
                      !category && 'bg-muted font-medium'
                    )}
                  >
                    {t('providers.allCategories')}
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
                      <span className="mr-2 text-lg">{cat.icon}</span>
                      <span className="text-xs">{t(cat.labelKey)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hourly Rate */}
              <div>
                <h3 className="mb-3 font-semibold">{t('providers.priceRange')}</h3>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder={t('providers.minRate')}
                    value={minRate}
                    onChange={(e) => setMinRate(e.target.value)}
                    className="w-full"
                  />
                  <Input
                    type="number"
                    placeholder={t('providers.maxRate')}
                    value={maxRate}
                    onChange={(e) => setMaxRate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Minimum Rating */}
              <div>
                <h3 className="mb-3 font-semibold">{t('providers.minRating')}</h3>
                <div className="flex gap-1">
                  {[4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() =>
                        setMinRating(minRating === String(rating) ? '' : String(rating))
                      }
                      className={cn(
                        'flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm transition-colors',
                        minRating === String(rating)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'hover:bg-muted'
                      )}
                    >
                      <Star className="h-3 w-3 fill-current" />
                      {rating}+
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <h3 className="mb-3 font-semibold">{t('providers.experience')}</h3>
                <Input
                  type="number"
                  placeholder={t('providers.minExperience')}
                  value={minExperience}
                  onChange={(e) => setMinExperience(e.target.value)}
                  min="0"
                  className="w-full"
                />
              </div>

              {/* Languages */}
              <div>
                <h3 className="mb-3 font-semibold">{t('providers.languages')}</h3>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => toggleLanguage(lang.value)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs transition-colors',
                        selectedLanguages.includes(lang.value)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'hover:bg-muted'
                      )}
                    >
                      {t(lang.labelKey)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h3 className="mb-3 font-semibold">{t('providers.certifications')}</h3>
                <div className="flex flex-wrap gap-2">
                  {CERTIFICATION_OPTIONS.map((cert) => (
                    <button
                      key={cert.value}
                      onClick={() => toggleCert(cert.value)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs transition-colors',
                        selectedCerts.includes(cert.value)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'hover:bg-muted'
                      )}
                    >
                      {t(cert.labelKey)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Needs */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={specialNeeds}
                  onChange={(e) => setSpecialNeeds(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm">{t('providers.specialNeeds')}</span>
              </label>

              {/* Clear Filters */}
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  <X className="mr-2 h-4 w-4" />
                  {t('providers.clearFilters')}
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
                  {t('providers.filters')}
                  {hasFilters && (
                    <span className="bg-primary ml-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white">
                      !
                    </span>
                  )}
                </Button>

                {/* Active Filter Tags */}
                {hasFilters && (
                  <div className="hidden flex-wrap gap-2 lg:flex">
                    {geoLocation && (
                      <Badge variant="secondary" className="gap-1">
                        <Navigation className="h-3 w-3" />
                        {radius} {t('providers.km')}
                        <button onClick={() => setGeoLocation(null)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {minRating && (
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3 w-3" />
                        {minRating}+
                        <button onClick={() => setMinRating('')}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Near Me Button - Mobile */}
                <Button
                  variant={geoLocation ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleNearMe}
                  className="lg:hidden"
                >
                  <Navigation className="mr-1 h-4 w-4" />
                  {t('providers.nearMe')}
                </Button>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-background h-10 rounded-lg border px-3 text-sm"
                >
                  <option value="rating">{t('providers.sortRating')}</option>
                  <option value="experience">{t('providers.sortExperience')}</option>
                  <option value="rate">{t('providers.sortRate')}</option>
                  <option value="lastActive">{t('providers.sortLastActive')}</option>
                  {geoLocation && <option value="distance">{t('jobs.sortDistance')}</option>}
                </select>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <Card className="mb-6 p-4 lg:hidden">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <Input
                      placeholder={t('providers.searchPlaceholder')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Categories chips */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={!category ? 'default' : 'outline'}
                      onClick={() => setCategory('')}
                    >
                      {t('providers.allCategories')}
                    </Button>
                    {categories.map((cat) => (
                      <Button
                        key={cat.id}
                        size="sm"
                        variant={category === cat.id ? 'default' : 'outline'}
                        onClick={() => setCategory(cat.id as ServiceCategory)}
                      >
                        <span className="mr-1">{cat.icon}</span>
                        <span className="text-xs">{t(cat.labelKey)}</span>
                      </Button>
                    ))}
                  </div>

                  {/* Rate Range */}
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder={t('providers.minRate')}
                      value={minRate}
                      onChange={(e) => setMinRate(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder={t('providers.maxRate')}
                      value={maxRate}
                      onChange={(e) => setMaxRate(e.target.value)}
                    />
                  </div>

                  {/* Rating chips */}
                  <div className="flex gap-1">
                    {[4, 3, 2, 1].map((rating) => (
                      <button
                        key={rating}
                        onClick={() =>
                          setMinRating(minRating === String(rating) ? '' : String(rating))
                        }
                        className={cn(
                          'flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm',
                          minRating === String(rating)
                            ? 'border-primary bg-primary/10 text-primary'
                            : ''
                        )}
                      >
                        <Star className="h-3 w-3 fill-current" />
                        {rating}+
                      </button>
                    ))}
                  </div>

                  {hasFilters && (
                    <Button variant="outline" onClick={clearFilters} className="w-full" size="sm">
                      <X className="mr-2 h-4 w-4" />
                      {t('providers.clearFilters')}
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {/* Results */}
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="mb-2 h-5 w-3/4" />
                        <Skeleton className="mb-2 h-4 w-1/2" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : providers.length === 0 ? (
              <div className="bg-background rounded-xl border py-16 text-center">
                <Search className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-2 text-lg font-semibold">{t('providers.noProvidersFound')}</h3>
                <p className="text-muted-foreground mb-4">{t('providers.noProvidersFoundDesc')}</p>
                {hasFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    {t('providers.clearFilters')}
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {providers.map((provider: any) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            )}

            {/* Guest sign-up prompt */}
            {!isAuthenticated && providers.length > 0 && (
              <div className="mt-8 rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-8 text-center dark:from-blue-950/30 dark:to-indigo-950/30">
                <h3 className="mb-2 text-lg font-semibold">{t('providers.wantToContact')}</h3>
                <p className="text-muted-foreground mb-4">{t('providers.signUpToContact')}</p>
                <Link href="/register">
                  <Button>{t('providers.signUpFree')}</Button>
                </Link>
              </div>
            )}

            {/* Load More */}
            {providers.length > 0 && providers.length < total && (
              <div className="mt-8 flex justify-center">
                <Button variant="outline">{t('providers.loadMore')}</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Provider Card Component ---

function ProviderCard({ provider }: { provider: any }) {
  const { t } = useTranslation();
  const profile = provider.profile;

  const getLastActiveText = () => {
    if (!provider.lastActiveAt) return null;
    const diff = Date.now() - new Date(provider.lastActiveAt).getTime();
    const hours = diff / (1000 * 60 * 60);
    if (hours < 24) return t('providers.activeToday');
    if (hours < 168) return t('providers.activeThisWeek');
    return t('providers.lastActive', { time: formatRelativeTime(provider.lastActiveAt) });
  };

  const lastActiveText = getLastActiveText();

  const profileHref = `/profile/${provider.id}`;

  return (
    <Link href={profileHref}>
      <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
        <CardContent className="p-6">
          {/* Top row: Avatar + Name + Badges */}
          <div className="mb-4 flex items-start gap-4">
            <UserAvatar src={provider.avatar} name={provider.name} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="group-hover:text-primary truncate font-semibold">{provider.name}</h3>
                {provider.isVerified && <Shield className="text-primary h-4 w-4 shrink-0" />}
              </div>

              {/* Headline */}
              {profile?.headline && (
                <p className="text-muted-foreground line-clamp-1 text-sm">{profile.headline}</p>
              )}

              {/* Rating */}
              <div className="mt-1 flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {provider.rating > 0 ? provider.rating.toFixed(1) : '-'}
                </span>
                <span className="text-muted-foreground text-xs">
                  {provider.reviewCount > 0
                    ? provider.reviewCount === 1
                      ? t('providers.reviewCountSingular')
                      : t('providers.reviewCount', { count: provider.reviewCount })
                    : t('providers.noReviews')}
                </span>
              </div>
            </div>
          </div>

          {/* Hourly Rate */}
          {profile?.hourlyRate && (
            <div className="text-primary mb-3 text-lg font-semibold">
              {formatPrice(profile.hourlyRate, profile.currency || 'RON')}
              <span className="text-muted-foreground text-sm font-normal">
                /{t('providers.hourlyRate', { rate: '' }).replace('/hr', 'hr').trim() || 'hr'}
              </span>
            </div>
          )}

          {/* Location & Distance */}
          {(provider.address || provider.distance !== undefined) && (
            <div className="text-muted-foreground mb-3 flex items-center text-sm">
              <MapPin className="mr-1 h-3 w-3 shrink-0" />
              <span className="truncate">
                {provider.address}
                {provider.distance !== undefined && (
                  <span className="ml-1">({provider.distance} km)</span>
                )}
              </span>
            </div>
          )}

          {/* Experience & Response Time */}
          <div className="mb-3 flex flex-wrap gap-2">
            {profile?.yearsExperience && (
              <Badge variant="secondary" className="text-xs">
                {profile.yearsExperience === 1
                  ? t('providers.yearExp')
                  : t('providers.yearsExp', { years: profile.yearsExperience })}
              </Badge>
            )}
            {profile?.responseTimeMin && (
              <Badge variant="secondary" className="text-xs">
                <Clock className="mr-1 h-3 w-3" />
                {profile.responseTimeMin < 60
                  ? `${profile.responseTimeMin}min`
                  : `${Math.round(profile.responseTimeMin / 60)}h`}
              </Badge>
            )}
            {provider.rating >= 4.8 && provider.reviewCount >= 10 && (
              <Badge className="bg-yellow-100 text-xs text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                <Award className="mr-1 h-3 w-3" />
                {t('providers.topProvider')}
              </Badge>
            )}
          </div>

          {/* Languages */}
          {profile?.languages && profile.languages.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {profile.languages.slice(0, 3).map((lang: string) => (
                <span key={lang} className="bg-muted rounded px-2 py-0.5 text-xs">
                  {lang.toUpperCase()}
                </span>
              ))}
              {profile.languages.length > 3 && (
                <span className="text-muted-foreground text-xs">
                  +{profile.languages.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Bio excerpt */}
          {provider.bio && (
            <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">{provider.bio}</p>
          )}

          {/* Last Active */}
          {lastActiveText && (
            <div className="text-muted-foreground flex items-center text-xs">
              <span
                className={cn(
                  'mr-2 inline-block h-2 w-2 rounded-full',
                  lastActiveText === t('providers.activeToday') ? 'bg-green-500' : 'bg-gray-400'
                )}
              />
              {lastActiveText}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
