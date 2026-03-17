'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  MapPin,
  Calendar,
  MessageSquare,
  ArrowLeft,
  Shield,
  Briefcase,
  CheckCircle,
  Clock,
  Globe,
  Award,
  Baby,
  Car,
  Heart,
  Camera,
  CircleDot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { getIdToken } from '@/lib/firebase';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

interface ProviderProfile {
  headline: string | null;
  yearsExperience: number | null;
  hourlyRate: number | null;
  currency: string;
  languages: string[];
  certifications: string[];
  ageRangeMin: number | null;
  ageRangeMax: number | null;
  maxChildren: number | null;
  hasCar: boolean;
  hasDriverLicense: boolean;
  serviceRadius: number | null;
  specialNeeds: boolean;
  smokingStatus: string | null;
  petsOk: boolean;
  photos: string[];
  responseTimeMin: number | null;
  responseRate: number | null;
}

interface UserProfile {
  id: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  role: string;
  lastActiveAt: string | null;
  memberSince: string;
  jobsPosted: number;
  jobsCompleted: number;
  providerProfile?: ProviderProfile;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  job: {
    id: string;
    title: string;
    category: string;
    posterId: string;
    providerId: string | null;
  };
}

interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

const LANGUAGE_LABELS: Record<string, string> = {
  ro: 'Romana',
  en: 'English',
  hu: 'Magyar',
  de: 'Deutsch',
  fr: 'Francais',
  es: 'Espanol',
  it: 'Italiano',
  ru: 'Русский',
};

const CERTIFICATION_LABELS: Record<string, { label: string; icon: string }> = {
  first_aid: { label: 'First Aid', icon: '🏥' },
  cpr: { label: 'CPR', icon: '❤️' },
  pedagogy: { label: 'Pedagogy', icon: '📚' },
  childcare: { label: 'Childcare', icon: '👶' },
  nutrition: { label: 'Nutrition', icon: '🥗' },
  psychology: { label: 'Psychology', icon: '🧠' },
};

function getLastActiveLabel(lastActiveAt: string | null, t: (key: string) => string): string {
  if (!lastActiveAt) return '';
  const now = new Date();
  const lastActive = new Date(lastActiveAt);
  const diffMs = now.getTime() - lastActive.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffHours < 24) return t('providerProfile.activeToday');
  if (diffDays < 7) return t('providerProfile.activeThisWeek');
  return t('providerProfile.lastSeen').replace('{{days}}', Math.floor(diffDays).toString());
}

function formatResponseTime(minutes: number | null, t: (key: string) => string): string {
  if (!minutes) return '';
  if (minutes < 60)
    return t('providerProfile.respondsMinutes').replace('{{min}}', minutes.toString());
  const hours = Math.round(minutes / 60);
  return t('providerProfile.respondsHours').replace('{{hours}}', hours.toString());
}

function getAgeRangeLabel(min: number | null, max: number | null): string {
  if (min !== null && max !== null) return `${min}-${max} ani`;
  if (min !== null) return `${min}+ ani`;
  if (max !== null) return `0-${max} ani`;
  return '';
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { user: currentUser, isAuthenticated } = useAuth();
  const isOwnProfile = currentUser?.id === userId;
  const { t } = useTranslation();

  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useQuery<UserProfile>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('User not found');
        throw new Error('Failed to fetch user');
      }
      return res.json();
    },
    enabled: !!userId,
  });

  const { data: reviewsData, isLoading: isReviewsLoading } = useQuery<ReviewsResponse>({
    queryKey: ['user', userId, 'reviews'],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/reviews`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      return res.json();
    },
    enabled: !!userId,
  });

  const handleStartConversation = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      const token = await getIdToken();
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ participantId: userId }),
      });

      if (!res.ok) throw new Error('Failed to create conversation');

      const conversation = await res.json();
      router.push(`/messages/${conversation.id}`);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  if (isProfileLoading) {
    return (
      <div className="bg-muted/50 min-h-screen py-8">
        <div className="mx-auto max-w-4xl px-4">
          <Skeleton className="mb-6 h-8 w-32" />
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

  if (profileError || !profile) {
    return (
      <div className="bg-muted/50 min-h-screen py-8">
        <div className="mx-auto max-w-4xl px-4">
          <Card className="p-12 text-center">
            <h2 className="mb-4 text-xl font-semibold">{t('profile.userNotFound')}</h2>
            <p className="text-muted-foreground mb-6">{t('profile.userNotFoundDesc')}</p>
            <Link href="/">
              <Button>{t('profile.goHome')}</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const pp = profile.providerProfile;
  const isProvider = profile.role === 'PROVIDER' || profile.role === 'ADMIN';
  const memberSince = new Date(profile.memberSince).toLocaleDateString('ro-RO', {
    month: 'long',
    year: 'numeric',
  });
  const lastActiveLabel = getLastActiveLabel(profile.lastActiveAt, t);
  const responseTimeLabel = pp ? formatResponseTime(pp.responseTimeMin, t) : '';

  const ratingDistribution = reviewsData?.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const totalRatings = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-muted/50 min-h-screen py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center text-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.back')}
        </button>

        {/* Profile Header */}
        <Card className="mb-6 p-6">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            <div className="relative">
              <Avatar className="h-24 w-24 md:h-32 md:w-32">
                {profile.avatar ? (
                  <Image src={profile.avatar} alt={profile.name} fill className="object-cover" />
                ) : (
                  <div className="bg-primary flex h-full w-full items-center justify-center text-3xl font-bold text-white md:text-4xl">
                    {profile.name.charAt(0)}
                  </div>
                )}
              </Avatar>
              {profile.isVerified && (
                <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-green-500">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-foreground text-2xl font-bold">{profile.name}</h1>
                    {profile.isVerified && (
                      <Badge variant="outline" className="border-green-600 text-green-600">
                        <Shield className="mr-1 h-3 w-3" />
                        {t('profile.verified')}
                      </Badge>
                    )}
                  </div>

                  {/* Provider headline */}
                  {pp?.headline && (
                    <p className="text-muted-foreground mt-1 text-base">{pp.headline}</p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{profile.rating?.toFixed(1) || '0.0'}</span>
                      <span className="text-muted-foreground">
                        ({profile.reviewCount} {t('profile.reviews')})
                      </span>
                    </div>

                    {/* Hourly rate */}
                    {pp?.hourlyRate && (
                      <span className="text-primary font-semibold">
                        {pp.hourlyRate} {pp.currency}/h
                      </span>
                    )}
                  </div>

                  {/* Last active + response time */}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                    {lastActiveLabel && (
                      <span className="flex items-center gap-1">
                        <CircleDot
                          className={cn(
                            'h-3 w-3',
                            lastActiveLabel === t('providerProfile.activeToday')
                              ? 'text-green-500'
                              : 'text-muted-foreground'
                          )}
                        />
                        <span className="text-muted-foreground">{lastActiveLabel}</span>
                      </span>
                    )}
                    {responseTimeLabel && (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {responseTimeLabel}
                      </span>
                    )}
                    {pp?.responseRate != null && pp.responseRate > 0 && (
                      <span className="text-muted-foreground text-xs">
                        ({Math.round(pp.responseRate)}% {t('providerProfile.responseRate')})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {!isOwnProfile && (
                    <Button onClick={handleStartConversation}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {t('profile.sendMessage')}
                    </Button>
                  )}
                  {isOwnProfile && (
                    <Link href="/profile/edit">
                      <Button variant="outline">{t('profile.editProfile')}</Button>
                    </Link>
                  )}
                </div>
              </div>

              {profile.bio && <p className="text-muted-foreground mt-4">{profile.bio}</p>}

              <div className="text-muted-foreground mt-4 flex flex-wrap gap-4 text-sm">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
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

        {/* Provider Details Section */}
        {isProvider && pp && (
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Experience & Skills */}
            <Card className="p-5">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <Briefcase className="text-primary h-4 w-4" />
                {t('providerProfile.experienceTitle')}
              </h3>
              <div className="space-y-3">
                {pp.yearsExperience != null && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('providerProfile.experience')}</span>
                    <span className="font-medium">
                      {pp.yearsExperience} {t('providerProfile.years')}
                    </span>
                  </div>
                )}
                {(pp.ageRangeMin != null || pp.ageRangeMax != null) && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Baby className="h-3.5 w-3.5" />
                      {t('providerProfile.ageGroups')}
                    </span>
                    <span className="font-medium">
                      {getAgeRangeLabel(pp.ageRangeMin, pp.ageRangeMax)}
                    </span>
                  </div>
                )}
                {pp.maxChildren != null && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t('providerProfile.maxChildren')}
                    </span>
                    <span className="font-medium">{pp.maxChildren}</span>
                  </div>
                )}
                {pp.specialNeeds && (
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="h-3.5 w-3.5 text-pink-500" />
                    <span>{t('providerProfile.specialNeedsExperience')}</span>
                  </div>
                )}
                {pp.serviceRadius && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t('providerProfile.serviceRadius')}
                    </span>
                    <span className="font-medium">{pp.serviceRadius} km</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Languages & Certifications */}
            <Card className="p-5">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <Globe className="text-primary h-4 w-4" />
                {t('providerProfile.languagesTitle')}
              </h3>
              {pp.languages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {pp.languages.map((lang) => (
                    <Badge key={lang} variant="secondary">
                      {LANGUAGE_LABELS[lang] || lang}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">{t('providerProfile.noLanguages')}</p>
              )}

              {pp.certifications.length > 0 && (
                <>
                  <h3 className="mb-3 mt-5 flex items-center gap-2 font-semibold">
                    <Award className="text-primary h-4 w-4" />
                    {t('providerProfile.certificationsTitle')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {pp.certifications.map((cert) => {
                      const info = CERTIFICATION_LABELS[cert];
                      return (
                        <Badge key={cert} variant="outline" className="gap-1">
                          {info?.icon || '📄'} {info?.label || cert}
                        </Badge>
                      );
                    })}
                  </div>
                </>
              )}
            </Card>

            {/* Additional Info */}
            <Card className="p-5 md:col-span-2">
              <h3 className="mb-4 font-semibold">{t('providerProfile.additionalInfo')}</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {pp.hasCar && (
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="text-primary h-4 w-4" />
                    <span>{t('providerProfile.hasCar')}</span>
                  </div>
                )}
                {pp.hasDriverLicense && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{t('providerProfile.hasLicense')}</span>
                  </div>
                )}
                {pp.smokingStatus && (
                  <div className="flex items-center gap-2 text-sm">
                    <span>{pp.smokingStatus === 'non_smoker' ? '🚭' : '🚬'}</span>
                    <span>
                      {pp.smokingStatus === 'non_smoker'
                        ? t('providerProfile.nonSmoker')
                        : t('providerProfile.smoker')}
                    </span>
                  </div>
                )}
                {pp.petsOk && (
                  <div className="flex items-center gap-2 text-sm">
                    <span>🐾</span>
                    <span>{t('providerProfile.petsOk')}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Photo Gallery */}
        {pp?.photos && pp.photos.length > 0 && (
          <Card className="mb-6 p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Camera className="text-primary h-4 w-4" />
              {t('providerProfile.photos')}
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {pp.photos.map((photo, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={photo}
                    alt={`${profile.name} photo ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card className="p-4 text-center">
            <p className="text-primary text-3xl font-bold">{profile.jobsCompleted}</p>
            <p className="text-muted-foreground text-sm">{t('profile.jobsCompleted')}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-primary text-3xl font-bold">{profile.jobsPosted}</p>
            <p className="text-muted-foreground text-sm">{t('profile.jobsPosted')}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-primary text-3xl font-bold">{profile.rating?.toFixed(1) || '0.0'}</p>
            <p className="text-muted-foreground text-sm">{t('profile.rating')}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-primary text-3xl font-bold">{profile.reviewCount}</p>
            <p className="text-muted-foreground text-sm">{t('profile.reviews')}</p>
          </Card>
        </div>

        {/* Reviews Section */}
        <Card className="p-6">
          <h2 className="mb-6 text-lg font-semibold">{t('reviews.title')}</h2>

          {/* Rating Distribution */}
          {totalRatings > 0 && (
            <div className="mb-6 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingDistribution[rating as keyof typeof ratingDistribution];
                const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-muted-foreground w-3 text-sm">{rating}</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                      <div
                        className="h-full bg-yellow-400 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground w-8 text-right text-sm">{count}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Reviews List */}
          {isReviewsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : reviewsData?.reviews && reviewsData.reviews.length > 0 ? (
            <div className="space-y-4">
              {reviewsData.reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      {review.author.avatar ? (
                        <Image
                          src={review.author.avatar}
                          alt={review.author.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="bg-muted text-muted-foreground flex h-full w-full items-center justify-center text-sm font-semibold">
                          {review.author.name.charAt(0)}
                        </div>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/profile/${review.author.id}`}
                            className="font-medium hover:underline"
                          >
                            {review.author.name}
                          </Link>
                          <Badge
                            variant="outline"
                            className={
                              review.authorId === review.job.posterId
                                ? 'border-primary text-primary'
                                : 'border-green-500 text-green-500'
                            }
                          >
                            {review.authorId === review.job.posterId
                              ? t('reviews.client')
                              : t('reviews.provider')}
                          </Badge>
                        </div>
                        <span className="text-muted-foreground text-sm">
                          {new Date(review.createdAt).toLocaleDateString('ro-RO', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-muted text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <Link
                        href={`/jobs/${review.job.id}`}
                        className="text-muted-foreground mt-1 flex items-center text-sm hover:underline"
                      >
                        <Briefcase className="mr-1 h-3 w-3" />
                        {review.job.title}
                      </Link>
                      {review.comment && <p className="text-foreground mt-2">{review.comment}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              <Star className="text-muted-foreground/50 mx-auto mb-2 h-12 w-12" />
              <p>{t('reviews.noReviewsYet')}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
