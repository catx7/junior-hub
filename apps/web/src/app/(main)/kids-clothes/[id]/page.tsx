'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPin,
  Tag,
  Heart,
  MessageSquare,
  Share2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit,
  Star,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { getIdToken } from '@/lib/firebase';
import { toast } from 'sonner';

export default function ClothesItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const itemId = params.id as string;

  const {
    data: item,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['clothes-item', itemId],
    queryFn: async () => {
      const res = await fetch(`/api/kids-clothes/${itemId}`);
      if (!res.ok) throw new Error('Failed to fetch item');
      return res.json();
    },
    enabled: !!itemId,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = await getIdToken();
      const res = await fetch(`/api/kids-clothes/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete item');
      return res.json();
    },
    onSuccess: () => {
      toast.success(t('success.deleted'));
      queryClient.invalidateQueries({ queryKey: ['kids-clothes'] });
      router.push('/kids-clothes');
    },
    onError: () => {
      toast.error(t('errors.failedToDelete'));
    },
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      const token = await getIdToken();
      const res = await fetch(`/api/kids-clothes/${itemId}/claim`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to claim item');
      return res.json();
    },
    onSuccess: () => {
      toast.success(t('success.claimed'));
      queryClient.invalidateQueries({ queryKey: ['clothes-item', itemId] });
    },
    onError: () => {
      toast.error(t('errors.failedToUpdate'));
    },
  });

  const handleStartConversation = async () => {
    if (!user) {
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
        body: JSON.stringify({ participantId: item.seller?.id }),
      });
      if (!res.ok) throw new Error('Failed to create conversation');
      const conversation = await res.json();
      router.push(`/messages/${conversation.id}`);
    } catch {
      toast.error(t('errors.failedToCreate'));
    }
  };

  const nextImage = () => {
    if (item?.images && item.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
    }
  };

  const prevImage = () => {
    if (item?.images && item.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-muted/50 min-h-screen">
        <div className="bg-muted h-[400px]">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Skeleton className="mb-4 h-8 w-3/4" />
          <Skeleton className="mb-2 h-6 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="bg-muted/50 flex min-h-screen items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="mb-2 text-xl font-bold">Item not found</h2>
          <p className="text-muted-foreground mb-6">This item doesn't exist or has been removed.</p>
          <Link href="/kids-clothes">
            <Button>Browse Items</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isOwner = user?.id === item.sellerId;
  const images = item.images || [];
  const isDonation = item.type === 'Donate';

  return (
    <div className="bg-muted/50 min-h-screen">
      {/* Image Gallery */}
      <div className="bg-muted relative h-[400px]">
        {images.length > 0 ? (
          <>
            <Image
              src={images[currentImageIndex]}
              alt={item.title}
              fill
              className="object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {images.map((_: string, idx: number) => (
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
            <p className="text-muted-foreground">No images available</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute right-4 top-4 flex gap-2">
          {isOwner && (
            <>
              <Link href={`/kids-clothes/${itemId}/edit`}>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg">
                  <Edit className="h-5 w-5" />
                </button>
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="hover:text-destructive flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </>
          )}
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg">
            <Heart className="h-5 w-5" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg">
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        {/* Type Badge */}
        <div className="absolute left-4 top-4">
          <Badge className={isDonation ? 'bg-green-600' : 'bg-primary'}>
            {isDonation ? 'Free - Donation' : 'For Sale'}
          </Badge>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            <div>
              <h1 className="text-foreground mb-2 text-3xl font-bold">{item.title}</h1>
              {!isDonation && item.price && (
                <p className="text-primary text-3xl font-bold">${Number(item.price).toFixed(2)}</p>
              )}
              {isDonation && (
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">Free</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{item.category}</Badge>
              <Badge variant="outline">Size: {item.size}</Badge>
              <Badge variant="outline">{item.gender}</Badge>
              <Badge variant="outline">{item.condition}</Badge>
            </div>

            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Description</h2>
              <p className="text-muted-foreground whitespace-pre-line">{item.description}</p>
            </Card>

            <div className="text-muted-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span>{item.location}</span>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Seller</h3>
              <Link href={`/profile/${item.seller?.id}`} className="mb-4 flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {item.seller?.avatar ? (
                    <Image
                      src={item.seller.avatar}
                      alt={item.seller.name || 'User'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="bg-primary flex h-full w-full items-center justify-center text-xl font-bold text-white">
                      {item.seller?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </Avatar>
                <div>
                  <p className="font-semibold">{item.seller?.name || 'Unknown'}</p>
                  <div className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{item.seller?.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>
              </Link>

              {!isOwner && item.status === 'AVAILABLE' && (
                <div className="space-y-3">
                  {isDonation ? (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => claimMutation.mutate()}
                      disabled={claimMutation.isPending}
                    >
                      {claimMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Claim Item
                    </Button>
                  ) : (
                    <Button className="w-full" size="lg" onClick={handleStartConversation}>
                      Contact Seller
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={handleStartConversation}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-destructive mb-4 text-xl font-bold">Delete Item</h2>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
