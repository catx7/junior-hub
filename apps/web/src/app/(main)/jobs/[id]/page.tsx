'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import { useParams, useRouter } from 'next/navigation';
import {
  MapPin,
  Calendar,
  Clock,
  Star,
  MessageSquare,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Trash2,
  Edit,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useJob, useDeleteJob, useUpdateJobStatus } from '@/hooks/use-jobs';
import { useAuth } from '@/hooks/use-auth';
import { offersApi, reviewsApi } from '@/lib/api';
import { getIdToken } from '@/lib/firebase';
import { SERVICE_CATEGORIES } from '@localservices/shared';
import { Check, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');

  const jobId = params.id as string;
  const { t } = useTranslation();
  const { data: job, isLoading, error } = useJob(jobId);
  const deleteJobMutation = useDeleteJob();

  const createOfferMutation = useMutation({
    mutationFn: (data: { price: number; message: string }) => offersApi.create(jobId, data),
    onSuccess: (data: any) => {
      toast.success(t('jobs.offerSubmittedMsg'));
      setShowOfferModal(false);
      setOfferPrice('');
      setOfferMessage('');
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (data.conversationId) {
        router.push(`/messages/${data.conversationId}`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || t('errors.serverError'));
    },
  });

  // Booking request mutation (for SERVICE_OFFERING jobs)
  const createBookingMutation = useMutation({
    mutationFn: async (data: { preferredDate: string; message: string }) => {
      const token = await getIdToken();
      const res = await fetch(`/api/jobs/${jobId}/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Failed to submit booking request');
      }
      return res.json();
    },
    onSuccess: (data: any) => {
      toast.success(t('jobs.bookingRequestSentMsg'));
      setShowBookingModal(false);
      setBookingDate('');
      setBookingMessage('');
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['bookingRequests', jobId] });
      if (data.conversationId) {
        router.push(`/messages/${data.conversationId}`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || t('errors.serverError'));
    },
  });

  // Fetch booking requests (for SERVICE_OFFERING jobs)
  const { data: bookingData } = useQuery({
    queryKey: ['bookingRequests', jobId],
    queryFn: async () => {
      const token = await getIdToken();
      const res = await fetch(`/api/jobs/${jobId}/booking`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch booking requests');
      return res.json();
    },
    enabled: !!user && !!jobId && !!job?.jobType && job.jobType === 'SERVICE_OFFERING',
  });

  const acceptBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const token = await getIdToken();
      const res = await fetch(`/api/booking/${bookingId}/accept`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Failed to accept booking');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success(t('jobs.bookingAccepted'));
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['bookingRequests', jobId] });
    },
    onError: (error: any) => {
      toast.error(error.message || t('errors.serverError'));
    },
  });

  const rejectBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const token = await getIdToken();
      const res = await fetch(`/api/booking/${bookingId}/reject`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Failed to reject booking');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success(t('jobs.bookingRejected'));
      queryClient.invalidateQueries({ queryKey: ['bookingRequests', jobId] });
    },
    onError: (error: any) => {
      toast.error(error.message || t('errors.serverError'));
    },
  });

  // Fetch offers for this job (for owner)
  const { data: offersData } = useQuery({
    queryKey: ['offers', jobId],
    queryFn: async () => {
      const token = await getIdToken();
      const res = await fetch(`/api/jobs/${jobId}/offers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch offers');
      return res.json();
    },
    enabled: !!user && !!jobId,
  });

  const acceptOfferMutation = useMutation({
    mutationFn: (offerId: string) => offersApi.accept(offerId),
    onSuccess: (data) => {
      toast.success(t('jobs.offerAcceptedMsg'));
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['offers', jobId] });
      // Redirect to the conversation
      if (data.conversation?.id) {
        router.push(`/messages/${data.conversation.id}`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || t('errors.serverError'));
    },
  });

  const rejectOfferMutation = useMutation({
    mutationFn: (offerId: string) => offersApi.reject(offerId),
    onSuccess: () => {
      toast.success(t('jobs.offerRejectedMsg'));
      queryClient.invalidateQueries({ queryKey: ['offers', jobId] });
    },
    onError: (error: any) => {
      toast.error(error.message || t('errors.serverError'));
    },
  });

  const updateStatusMutation = useUpdateJobStatus();

  const createReviewMutation = useMutation({
    mutationFn: (data: { rating: number; comment: string }) => reviewsApi.create(jobId, data),
    onSuccess: () => {
      toast.success(t('reviews.reviewSubmitted'));
      setReviewRating(0);
      setReviewComment('');
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', jobId] });
    },
    onError: (error: any) => {
      toast.error(error.message || t('errors.serverError'));
    },
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', jobId],
    queryFn: async () => {
      const token = await getIdToken();
      const res = await fetch(`/api/jobs/${jobId}/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch reviews');
      return res.json();
    },
    enabled: !!jobId,
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating < 1 || reviewRating > 5) {
      toast.error(t('jobs.selectRating'));
      return;
    }
    if (!reviewComment || reviewComment.trim().length < 10) {
      toast.error(t('jobs.addComment'));
      return;
    }
    createReviewMutation.mutate({ rating: reviewRating, comment: reviewComment.trim() });
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) {
      toast.error(t('jobs.selectDate'));
      return;
    }
    if (!bookingMessage || bookingMessage.trim().length < 10) {
      toast.error(t('jobs.addMessage'));
      return;
    }
    createBookingMutation.mutate({ preferredDate: bookingDate, message: bookingMessage.trim() });
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(offerPrice);

    if (!price || price <= 0) {
      toast.error(t('jobs.enterValidPrice'));
      return;
    }

    if (!offerMessage || offerMessage.trim().length < 10) {
      toast.error(t('jobs.addMessage'));
      return;
    }

    createOfferMutation.mutate({ price, message: offerMessage.trim() });
  };

  const handleDeleteJob = async () => {
    try {
      await deleteJobMutation.mutateAsync(jobId);
      toast.success(t('jobs.jobDeleted'));
      router.push('/jobs');
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const nextImage = () => {
    if (job?.images && job.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % job.images.length);
    }
  };

  const prevImage = () => {
    if (job?.images && job.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + job.images.length) % job.images.length);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-muted/50 min-h-screen">
        <div className="bg-muted h-[400px]">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="bg-muted/50 flex min-h-screen items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="mb-2 text-xl font-bold">{t('jobs.jobNotFound')}</h2>
          <p className="text-muted-foreground mb-6">{t('jobs.jobNotFoundDesc')}</p>
          <Link href="/jobs">
            <Button>{t('jobs.browseJobs')}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const categoryInfo = SERVICE_CATEGORIES[job.category as keyof typeof SERVICE_CATEGORIES];
  const isGuest = !user;
  const isOwner = user?.id === job.posterId;
  const isProvider = user?.id === job.providerId;
  const isServiceOffering = job.jobType === 'SERVICE_OFFERING';

  const formatPrice = (budget: number | null | undefined) => {
    if (!budget || budget === 0)
      return isServiceOffering ? t('jobs.contactPrice') : t('jobs.openBudgetLabel');
    const formatted = `$${Number(budget).toFixed(2)}`;
    if (isServiceOffering) {
      if (job.pricingType === 'HOURLY') return `${formatted}/hr`;
      if (job.pricingType === 'PER_LOCATION') return `${formatted}/visit`;
    }
    return formatted;
  };
  const canDelete = isOwner && job.status !== 'IN_PROGRESS' && job.status !== 'PENDING_COMPLETION';
  const scheduledInFuture = job.scheduledAt && new Date(job.scheduledAt) > new Date();
  const myReview = (reviewsData || []).find((r: any) => r.author?.id === user?.id);
  const images = job.images || [];

  return (
    <div className="bg-muted/50 min-h-screen">
      {/* Image Gallery */}
      <div className="bg-muted relative h-[400px]">
        {images.length > 0 && images[currentImageIndex]?.url ? (
          <>
            <SafeImage
              src={images[currentImageIndex].url}
              alt={job.title}
              fill
              className="object-cover"
              fallback={
                <div className="bg-muted flex h-full w-full items-center justify-center">
                  <p className="text-muted-foreground">{t('jobs.imageUnavailable')}</p>
                </div>
              }
            />

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg transition hover:bg-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg transition hover:bg-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Pagination Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {images.map((_: unknown, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-2 w-2 rounded-full transition ${
                      idx === currentImageIndex ? 'w-6 bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-muted flex h-full items-center justify-center">
            <p className="text-muted-foreground">{t('jobs.noImagesAvailable')}</p>
          </div>
        )}

        {/* Action Buttons */}
        {!isGuest && (
          <div className="absolute right-4 top-4 flex gap-2">
            {isOwner && (
              <>
                <Link href={`/jobs/${jobId}/edit`}>
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg transition hover:bg-white">
                    <Edit className="h-5 w-5" />
                  </button>
                </Link>
                {canDelete && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="hover:text-destructive flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg transition hover:bg-white"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </>
            )}
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg transition hover:bg-white"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg transition hover:bg-white">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Header */}
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <Badge className={isServiceOffering ? 'bg-green-600' : 'bg-primary'}>
                  {isServiceOffering ? t('jobs.serviceOffering') : t('jobs.serviceRequest')}
                </Badge>
                <Badge
                  style={{
                    backgroundColor: `${categoryInfo?.color}20`,
                    color: categoryInfo?.color,
                  }}
                >
                  {categoryInfo?.label || job.category}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    job.status === 'OPEN'
                      ? 'border-green-600 text-green-600'
                      : job.status === 'IN_PROGRESS'
                        ? 'text-primary border-blue-600'
                        : job.status === 'PENDING_COMPLETION'
                          ? 'border-amber-600 text-amber-600'
                          : job.status === 'COMPLETED'
                            ? 'text-muted-foreground border-gray-600'
                            : 'text-destructive border-red-600'
                  }
                >
                  {job.status === 'PENDING_COMPLETION' ? t('jobs.pendingCompletion') : job.status}
                </Badge>
              </div>
              <h1 className="text-foreground mb-2 text-3xl font-bold">{job.title}</h1>
              <p className="text-primary text-3xl font-bold">{formatPrice(job.budget)}</p>
            </div>

            {/* Meta Info */}
            <div className="text-muted-foreground flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{job.location || t('jobs.locationNotSpecified')}</span>
              </div>
              {job.scheduledAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>
                    {new Date(job.scheduledAt).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>
                  {t('jobs.posted')}{' '}
                  {new Date(job.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Description */}
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold">{t('jobs.description')}</h2>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {job.description}
              </p>
            </Card>

            {/* Offers Section (visible to job owner, SERVICE_REQUEST only) */}
            {!isServiceOffering &&
              isOwner &&
              job.status === 'OPEN' &&
              offersData?.offers?.length > 0 && (
                <Card className="p-6">
                  <h2 className="mb-4 text-xl font-semibold">
                    {t('jobs.offers')} ({offersData.offers.length})
                  </h2>
                  <div className="space-y-4">
                    {offersData.offers.map((offer: any) => (
                      <div
                        key={offer.id}
                        className="flex items-start justify-between rounded-lg border p-4"
                      >
                        <div className="flex gap-4">
                          <Link href={`/profile/${offer.provider?.id}`}>
                            <Avatar className="h-12 w-12">
                              {offer.provider?.avatar ? (
                                <SafeImage
                                  src={offer.provider.avatar}
                                  alt={offer.provider.name}
                                  fill
                                  className="object-cover"
                                  fallback={
                                    <div className="bg-primary flex h-full w-full items-center justify-center text-lg font-bold text-white">
                                      {offer.provider?.name?.charAt(0) || '?'}
                                    </div>
                                  }
                                />
                              ) : (
                                <div className="bg-primary flex h-full w-full items-center justify-center text-lg font-bold text-white">
                                  {offer.provider?.name?.charAt(0) || '?'}
                                </div>
                              )}
                            </Avatar>
                          </Link>
                          <div>
                            <Link
                              href={`/profile/${offer.provider?.id}`}
                              className="font-semibold hover:underline"
                            >
                              {offer.provider?.name}
                            </Link>
                            <div className="text-muted-foreground flex items-center gap-1 text-sm">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{offer.provider?.rating?.toFixed(1) || '0.0'}</span>
                              {offer.provider?.isVerified && (
                                <Badge variant="outline" className="ml-1 text-xs">
                                  {t('jobs.verified')}
                                </Badge>
                              )}
                            </div>
                            <p className="text-primary mt-2 text-2xl font-bold">
                              ${Number(offer.price).toFixed(2)}
                            </p>
                            <p className="text-muted-foreground mt-1 text-sm">{offer.message}</p>
                            <p className="text-muted-foreground mt-1 text-xs">
                              {new Date(offer.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {offer.conversationId && (
                            <Link href={`/messages/${offer.conversationId}`}>
                              <Button size="sm" variant="ghost">
                                <MessageSquare className="h-4 w-4" />
                                <span className="ml-1">{t('jobs.message')}</span>
                              </Button>
                            </Link>
                          )}
                          <Button
                            size="sm"
                            onClick={() => acceptOfferMutation.mutate(offer.id)}
                            disabled={
                              acceptOfferMutation.isPending || rejectOfferMutation.isPending
                            }
                          >
                            {acceptOfferMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                            <span className="ml-1">{t('jobs.accept')}</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectOfferMutation.mutate(offer.id)}
                            disabled={
                              acceptOfferMutation.isPending || rejectOfferMutation.isPending
                            }
                          >
                            {rejectOfferMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                            <span className="ml-1">{t('jobs.reject')}</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

            {/* Booking Requests Section (for SERVICE_OFFERING, visible to owner) */}
            {isServiceOffering &&
              isOwner &&
              job.status === 'OPEN' &&
              bookingData?.bookingRequests?.length > 0 && (
                <Card className="p-6">
                  <h2 className="mb-4 text-xl font-semibold">
                    {t('jobs.bookingRequests')} ({bookingData.bookingRequests.length})
                  </h2>
                  <div className="space-y-4">
                    {bookingData.bookingRequests.map((booking: any) => (
                      <div
                        key={booking.id}
                        className="flex items-start justify-between rounded-lg border p-4"
                      >
                        <div className="flex gap-4">
                          <Link href={`/profile/${booking.client?.id}`}>
                            <Avatar className="h-12 w-12">
                              {booking.client?.avatar ? (
                                <SafeImage
                                  src={booking.client.avatar}
                                  alt={booking.client.name}
                                  fill
                                  className="object-cover"
                                  fallback={
                                    <div className="bg-primary flex h-full w-full items-center justify-center text-lg font-bold text-white">
                                      {booking.client?.name?.charAt(0) || '?'}
                                    </div>
                                  }
                                />
                              ) : (
                                <div className="bg-primary flex h-full w-full items-center justify-center text-lg font-bold text-white">
                                  {booking.client?.name?.charAt(0) || '?'}
                                </div>
                              )}
                            </Avatar>
                          </Link>
                          <div>
                            <Link
                              href={`/profile/${booking.client?.id}`}
                              className="font-semibold hover:underline"
                            >
                              {booking.client?.name}
                            </Link>
                            <div className="text-muted-foreground flex items-center gap-1 text-sm">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{booking.client?.rating?.toFixed(1) || '0.0'}</span>
                            </div>
                            <p className="text-primary mt-2 text-sm font-medium">
                              <Calendar className="mr-1 inline h-3 w-3" />
                              {new Date(booking.preferredDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                            <p className="text-muted-foreground mt-1 text-sm">{booking.message}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={
                                  booking.status === 'ACCEPTED'
                                    ? 'border-green-500 text-green-500'
                                    : booking.status === 'REJECTED'
                                      ? 'border-red-500 text-red-500'
                                      : 'border-amber-500 text-amber-500'
                                }
                              >
                                {booking.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {booking.status === 'PENDING' && (
                          <div className="flex gap-2">
                            {booking.conversationId && (
                              <Link href={`/messages/${booking.conversationId}`}>
                                <Button size="sm" variant="ghost">
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                            <Button
                              size="sm"
                              onClick={() => acceptBookingMutation.mutate(booking.id)}
                              disabled={
                                acceptBookingMutation.isPending || rejectBookingMutation.isPending
                              }
                            >
                              {acceptBookingMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                              <span className="ml-1">{t('jobs.accept')}</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectBookingMutation.mutate(booking.id)}
                              disabled={
                                acceptBookingMutation.isPending || rejectBookingMutation.isPending
                              }
                            >
                              {rejectBookingMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                              <span className="ml-1">{t('jobs.reject')}</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

            {/* Offers Count (for non-owners or when no detailed offers, only for SERVICE_REQUEST) */}
            {!isServiceOffering && (!isOwner || job.status !== 'OPEN') && (
              <div className="text-muted-foreground text-sm">
                {`${job._count?.offers || 0} ${job._count?.offers === 1 ? t('jobs.offerSingular') : t('jobs.offerPlural')} ${t('jobs.submitted')}`}
              </div>
            )}

            {/* Provider: Mark as Complete (when IN_PROGRESS) */}
            {isProvider && job.status === 'IN_PROGRESS' && (
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-2">
                    <CheckCircle2 className="text-primary h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{t('jobs.jobInProgress')}</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {t('jobs.markAsCompleteDesc')}
                    </p>
                    {scheduledInFuture && (
                      <p className="mt-2 text-sm text-amber-600">
                        {t('jobs.availableAfter', {
                          date: new Date(job.scheduledAt).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          }),
                        })}
                      </p>
                    )}
                    <Button
                      className="mt-4"
                      disabled={!!scheduledInFuture || updateStatusMutation.isPending}
                      onClick={() =>
                        updateStatusMutation.mutate({ id: jobId, status: 'PENDING_COMPLETION' })
                      }
                    >
                      {updateStatusMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      {t('jobs.markComplete')}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Poster: Confirm or Reject Completion (when PENDING_COMPLETION) */}
            {isOwner && job.status === 'PENDING_COMPLETION' && (
              <Card className="border-amber-200 bg-amber-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-amber-100 p-2">
                    <AlertCircle className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{t('jobs.completionRequested')}</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {t('jobs.completionRequestedDesc')}
                    </p>
                    <div className="mt-4 flex gap-3">
                      <Button
                        disabled={updateStatusMutation.isPending}
                        onClick={() =>
                          updateStatusMutation.mutate({ id: jobId, status: 'COMPLETED' })
                        }
                      >
                        {updateStatusMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="mr-2 h-4 w-4" />
                        )}
                        {t('jobs.confirmCompletion')}
                      </Button>
                      <Button
                        variant="outline"
                        disabled={updateStatusMutation.isPending}
                        onClick={() =>
                          updateStatusMutation.mutate({ id: jobId, status: 'IN_PROGRESS' })
                        }
                      >
                        <X className="mr-2 h-4 w-4" />
                        {t('jobs.notYetComplete')}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Provider: Waiting for confirmation (when PENDING_COMPLETION) */}
            {isProvider && job.status === 'PENDING_COMPLETION' && (
              <Card className="border-amber-200 bg-amber-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-amber-100 p-2">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{t('jobs.waitingForConfirmation')}</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {t('jobs.waitingForConfirmationDesc')}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Review Form (poster, when COMPLETED and no review yet) */}
            {isOwner && job.status === 'COMPLETED' && !myReview && (
              <Card className="p-6">
                <h2 className="mb-4 text-xl font-semibold">{t('jobs.leaveReview')}</h2>
                <p className="text-muted-foreground mb-4 text-sm">
                  {t('jobs.rateProviderExperience')}
                </p>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">{t('reviews.rating')}</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1"
                        >
                          <Star
                            className={`h-8 w-8 transition ${
                              star <= (hoverRating || reviewRating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground/50'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">{t('reviews.comment')}</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="focus:ring-primary w-full resize-none rounded-lg border px-4 py-3 focus:border-transparent focus:ring-2"
                      rows={4}
                      placeholder={t('jobs.reviewPlaceholder')}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={createReviewMutation.isPending}>
                    {createReviewMutation.isPending
                      ? t('jobs.submitting')
                      : t('reviews.submitReview')}
                  </Button>
                </form>
              </Card>
            )}

            {/* Provider: Review form (when COMPLETED and no review yet) */}
            {isProvider && job.status === 'COMPLETED' && !myReview && (
              <Card className="p-6">
                <h2 className="mb-4 text-xl font-semibold">{t('jobs.leaveReview')}</h2>
                <p className="text-muted-foreground mb-4 text-sm">
                  {t('jobs.ratePosterExperience')}
                </p>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">{t('reviews.rating')}</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1"
                        >
                          <Star
                            className={`h-8 w-8 transition ${
                              star <= (hoverRating || reviewRating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground/50'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">{t('reviews.comment')}</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="focus:ring-primary w-full resize-none rounded-lg border px-4 py-3 focus:border-transparent focus:ring-2"
                      rows={4}
                      placeholder={t('jobs.reviewPlaceholder')}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={createReviewMutation.isPending}>
                    {createReviewMutation.isPending
                      ? t('jobs.submitting')
                      : t('reviews.submitReview')}
                  </Button>
                </form>
              </Card>
            )}

            {/* Display Reviews (when COMPLETED) */}
            {job.status === 'COMPLETED' && reviewsData && reviewsData.length > 0 && (
              <Card className="p-6">
                <h2 className="mb-4 text-xl font-semibold">{t('reviews.title')}</h2>
                <div className="space-y-4">
                  {reviewsData.map((review: any) => (
                    <div key={review.id} className="rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {review.author?.avatar ? (
                            <SafeImage
                              src={review.author.avatar}
                              alt={review.author.name}
                              fill
                              className="object-cover"
                              fallback={
                                <div className="bg-primary flex h-full w-full items-center justify-center text-sm font-bold text-white">
                                  {review.author?.name?.charAt(0) || '?'}
                                </div>
                              }
                            />
                          ) : (
                            <div className="bg-primary flex h-full w-full items-center justify-center text-sm font-bold text-white">
                              {review.author?.name?.charAt(0) || '?'}
                            </div>
                          )}
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{review.author?.name}</p>
                            <Badge
                              variant="outline"
                              className={
                                review.authorId === job.posterId
                                  ? 'border-blue-500 text-blue-500'
                                  : 'border-green-500 text-green-500'
                              }
                            >
                              {review.authorId === job.posterId
                                ? t('reviews.client')
                                : t('reviews.provider')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground/50'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-muted-foreground ml-auto text-xs">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-3 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Poster Card */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">{t('jobs.postedBy')}</h3>
              <Link href={`/users/${job.poster?.id}`} className="mb-4 flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {job.poster?.avatar ? (
                    <SafeImage
                      src={job.poster.avatar}
                      alt={job.poster.name || 'User'}
                      fill
                      fallback={
                        <div className="bg-primary flex h-full w-full items-center justify-center text-xl font-bold text-white">
                          {job.poster?.name?.charAt(0) || 'U'}
                        </div>
                      }
                    />
                  ) : (
                    <div className="bg-primary flex h-full w-full items-center justify-center text-xl font-bold text-white">
                      {job.poster?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{job.poster?.name || 'Unknown'}</p>
                  <div className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{job.poster?.rating?.toFixed(1) || '0.0'}</span>
                    <span>
                      ({job.poster?.reviewCount || 0} {t('profile.reviews')})
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {t('profile.memberSince', {
                      date: new Date(job.poster?.createdAt || new Date()).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          year: 'numeric',
                        }
                      ),
                    })}
                  </p>
                </div>
              </Link>

              {isGuest && job.status === 'OPEN' && (
                <div className="space-y-3">
                  <Link
                    href={`/register?message=Create an account to ${isServiceOffering ? 'book services' : 'make offers and contact providers'}`}
                  >
                    <Button className="w-full" size="lg">
                      {isServiceOffering ? t('jobs.signUpToBook') : t('jobs.signUpToMakeOffer')}
                    </Button>
                  </Link>
                  <p className="text-muted-foreground text-center text-xs">
                    {t('jobs.alreadyHaveAccount')}{' '}
                    <Link href="/login" className="text-primary hover:underline">
                      {t('auth.login')}
                    </Link>
                  </p>
                </div>
              )}

              {!isGuest && !isOwner && job.status === 'OPEN' && !isServiceOffering && (
                <div className="space-y-3">
                  <Button className="w-full" size="lg" onClick={() => setShowOfferModal(true)}>
                    {t('jobs.makeOffer')}
                  </Button>
                  {offersData?.offers?.[0]?.conversationId && (
                    <Link href={`/messages/${offersData.offers[0].conversationId}`}>
                      <Button variant="outline" className="w-full" size="lg">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {t('jobs.message')}
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              {!isGuest && !isOwner && job.status === 'OPEN' && isServiceOffering && (
                <div className="space-y-3">
                  {bookingData?.bookingRequests?.length > 0 ? (
                    <>
                      <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center text-sm text-green-700">
                        {t('jobs.bookingRequestSent')} ({bookingData.bookingRequests[0].status})
                      </div>
                      {bookingData.bookingRequests[0].conversationId && (
                        <Link href={`/messages/${bookingData.bookingRequests[0].conversationId}`}>
                          <Button variant="outline" className="w-full" size="lg">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            {t('jobs.messageProvider')}
                          </Button>
                        </Link>
                      )}
                    </>
                  ) : (
                    <Button className="w-full" size="lg" onClick={() => setShowBookingModal(true)}>
                      <Calendar className="mr-2 h-4 w-4" />
                      {t('jobs.requestBooking')}
                    </Button>
                  )}
                </div>
              )}
            </Card>

            {/* Quick Info */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">{t('jobs.jobDetails')}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('jobs.category')}</span>
                  <span className="font-medium">{categoryInfo?.label || job.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {isServiceOffering ? t('jobs.price') : t('jobs.budget')}
                  </span>
                  <span className="font-medium">{formatPrice(job.budget)}</span>
                </div>
                {isServiceOffering && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('jobs.type')}</span>
                    <span className="font-medium">{t('jobs.serviceOffering')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('jobs.location')}</span>
                  <span className="font-medium">{job.location || t('jobs.notSpecified')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('jobs.status')}</span>
                  <Badge
                    variant="outline"
                    className={
                      job.status === 'OPEN'
                        ? 'border-green-600 text-green-600'
                        : job.status === 'IN_PROGRESS'
                          ? 'text-primary border-blue-600'
                          : job.status === 'PENDING_COMPLETION'
                            ? 'border-amber-600 text-amber-600'
                            : 'text-muted-foreground border-gray-600'
                    }
                  >
                    {job.status === 'PENDING_COMPLETION' ? t('jobs.pendingCompletion') : job.status}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="mb-4 text-xl font-bold">{t('jobs.makeOffer')}</h2>
            <form onSubmit={handleSubmitOffer} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">{t('jobs.yourPrice')}</label>
                <div className="relative">
                  <DollarSign className="text-muted-foreground absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
                  <input
                    type="number"
                    step="0.01"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="focus:ring-primary w-full rounded-lg border py-3 pl-10 pr-4 focus:border-transparent focus:ring-2"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {t('jobs.jobBudget')}: ${job.budget?.min || job.budget || 0}
                  {job.budget?.max && job.budget.max !== job.budget.min && ` - $${job.budget.max}`}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">{t('jobs.message')}</label>
                <textarea
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  className="focus:ring-primary w-full resize-none rounded-lg border px-4 py-3 focus:border-transparent focus:ring-2"
                  rows={4}
                  placeholder={t('jobs.offerMessagePlaceholder')}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowOfferModal(false)}
                  disabled={createOfferMutation.isPending}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" className="flex-1" disabled={createOfferMutation.isPending}>
                  {createOfferMutation.isPending ? t('jobs.submitting') : t('offer.submitOffer')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Booking Request Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="mb-4 text-xl font-bold">{t('jobs.requestBooking')}</h2>
            <p className="text-muted-foreground mb-4 text-sm">{t('jobs.requestBookingDesc')}</p>
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">{t('jobs.preferredDate')}</label>
                <div className="relative">
                  <Calendar className="text-muted-foreground absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
                  <input
                    type="datetime-local"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="focus:ring-primary w-full rounded-lg border py-3 pl-10 pr-4 focus:border-transparent focus:ring-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">{t('jobs.message')}</label>
                <textarea
                  value={bookingMessage}
                  onChange={(e) => setBookingMessage(e.target.value)}
                  className="focus:ring-primary w-full resize-none rounded-lg border px-4 py-3 focus:border-transparent focus:ring-2"
                  rows={4}
                  placeholder={t('jobs.bookingMessagePlaceholder')}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowBookingModal(false)}
                  disabled={createBookingMutation.isPending}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" className="flex-1" disabled={createBookingMutation.isPending}>
                  {createBookingMutation.isPending ? t('jobs.sending') : t('jobs.sendRequest')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-destructive mb-4 text-xl font-bold">{t('jobs.deleteJobTitle')}</h2>
            <p className="text-muted-foreground mb-6">{t('jobs.deleteJobConfirm')}</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteJobMutation.isPending}
              >
                {t('common.cancel')}
              </Button>
              <Button
                className="bg-destructive hover:bg-destructive/90 flex-1"
                onClick={handleDeleteJob}
                disabled={deleteJobMutation.isPending}
              >
                {deleteJobMutation.isPending ? t('jobs.deleting') : t('jobs.deleteJob')}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
