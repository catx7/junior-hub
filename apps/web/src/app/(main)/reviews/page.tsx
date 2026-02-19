'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Star, ArrowLeft, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { getIdToken } from '@/lib/firebase';

type Tab = 'received' | 'written';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  authorId: string;
  targetId: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  target?: {
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

export default function ReviewsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('received');
  const { t } = useTranslation();

  // Reviews received by the user
  const { data: receivedData, isLoading: isReceivedLoading } = useQuery({
    queryKey: ['reviews', 'received', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/users/${user!.id}/reviews?limit=50`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Reviews written by the user
  const { data: writtenData, isLoading: isWrittenLoading } = useQuery({
    queryKey: ['reviews', 'written', user?.id],
    queryFn: async () => {
      const token = await getIdToken();
      const res = await fetch(`/api/reviews/written?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch written reviews');
      return res.json();
    },
    enabled: !!user?.id,
  });

  if (isAuthLoading) {
    return (
      <div className="bg-muted/50 min-h-screen py-8">
        <div className="mx-auto max-w-3xl px-4">
          <Skeleton className="mb-6 h-8 w-48" />
          <Skeleton className="mb-4 h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="mt-4 h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-muted/50 flex min-h-screen items-center justify-center">
        <Card className="p-6 text-center">
          <p>{t('reviews.loginToViewReviews')}</p>
          <Link href="/login">
            <Button className="mt-4">{t('auth.login')}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const receivedReviews: Review[] = receivedData?.reviews || [];
  const writtenReviews: Review[] = writtenData?.reviews || [];
  const ratingDistribution: Record<number, number> = receivedData?.ratingDistribution || {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  const totalRatings = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);
  const isLoading = tab === 'received' ? isReceivedLoading : isWrittenLoading;
  const reviews = tab === 'received' ? receivedReviews : writtenReviews;

  return (
    <div className="bg-muted/50 min-h-screen py-8">
      <div className="mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/profile"
            className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('reviews.backToProfile')}
          </Link>
          <h1 className="text-foreground text-2xl font-bold">{t('reviews.myReviews')}</h1>
          <p className="text-muted-foreground mt-1">
            {user.rating?.toFixed(1) || '0.0'} {t('reviews.rating').toLowerCase()} -{' '}
            {user.reviewCount || 0} {t('profile.reviews').toLowerCase()}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={tab === 'received' ? 'default' : 'outline'}
            onClick={() => setTab('received')}
          >
            {t('reviews.received')} ({receivedReviews.length})
          </Button>
          <Button
            variant={tab === 'written' ? 'default' : 'outline'}
            onClick={() => setTab('written')}
          >
            {t('reviews.written')} ({writtenReviews.length})
          </Button>
        </div>

        {/* Rating Distribution (only for received) */}
        {tab === 'received' && totalRatings > 0 && (
          <Card className="mb-6 p-6">
            <h2 className="text-foreground mb-4 text-sm font-semibold">
              {t('reviews.ratingDistribution')}
            </h2>
            <div className="space-y-2">
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
          </Card>
        )}

        {/* Reviews List */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => {
              // For received reviews, the "other person" is the author
              // For written reviews, the "other person" is the target
              const otherPerson = tab === 'received' ? review.author : review.target;
              const roleLabel =
                tab === 'received'
                  ? review.authorId === review.job.posterId
                    ? t('reviews.client')
                    : t('reviews.provider')
                  : review.targetId === review.job.posterId
                    ? t('reviews.client')
                    : t('reviews.provider');
              const roleColor =
                tab === 'received'
                  ? review.authorId === review.job.posterId
                    ? 'border-blue-500 text-blue-500'
                    : 'border-green-500 text-green-500'
                  : review.targetId === review.job.posterId
                    ? 'border-blue-500 text-blue-500'
                    : 'border-green-500 text-green-500';

              return (
                <Card key={review.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Link href={`/profile/${otherPerson?.id}`}>
                      <Avatar className="h-10 w-10">
                        {otherPerson?.avatar ? (
                          <Image
                            src={otherPerson.avatar}
                            alt={otherPerson.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="bg-muted text-muted-foreground flex h-full w-full items-center justify-center text-sm font-semibold">
                            {otherPerson?.name?.charAt(0) || '?'}
                          </div>
                        )}
                      </Avatar>
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/profile/${otherPerson?.id}`}
                            className="font-medium hover:underline"
                          >
                            {otherPerson?.name || 'Unknown'}
                          </Link>
                          <Badge variant="outline" className={roleColor}>
                            {roleLabel}
                          </Badge>
                        </div>
                        <span className="text-muted-foreground text-sm">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
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
                                : 'fill-gray-200 text-gray-200'
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
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="py-12 text-center">
            <Star className="text-muted-foreground/50 mx-auto mb-3 h-12 w-12" />
            <p className="text-muted-foreground">
              {tab === 'received' ? t('reviews.noReviewsReceived') : t('reviews.noReviewsWritten')}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
