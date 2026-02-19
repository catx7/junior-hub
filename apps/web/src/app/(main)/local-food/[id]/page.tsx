'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  UtensilsCrossed,
  MapPin,
  Truck,
  Star,
  Shield,
  Calendar,
  Minus,
  Plus,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { getIdToken } from '@/lib/firebase';

export default function FoodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const itemId = params.id as string;

  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState<'DELIVERY' | 'PICKUP'>('PICKUP');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderMessage, setOrderMessage] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);

  const {
    data: item,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['local-food', itemId],
    queryFn: async () => {
      const res = await fetch(`/api/local-food/${itemId}`);
      if (!res.ok) throw new Error('Failed to fetch item');
      return res.json();
    },
    enabled: !!itemId,
  });

  const orderMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = await getIdToken();
      const res = await fetch(`/api/local-food/${itemId}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Failed to place order');
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(t('localFood.orderPlaced'));
      setShowOrderForm(false);
      queryClient.invalidateQueries({ queryKey: ['local-food', itemId] });
      if (data.conversationId) {
        router.push(`/messages/${data.conversationId}`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to place order');
    },
  });

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderType === 'DELIVERY' && !deliveryAddress.trim()) {
      toast.error(t('localFood.deliveryAddressPlaceholder'));
      return;
    }
    orderMutation.mutate({
      quantity,
      orderType,
      deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress : undefined,
      pickupLocation: orderType === 'PICKUP' ? item?.pickupLocation || item?.location : undefined,
      message: orderMessage || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="bg-muted/50 min-h-screen py-8">
        <div className="mx-auto max-w-4xl px-4">
          <Skeleton className="mb-6 h-8 w-32" />
          <Skeleton className="mb-6 h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="bg-muted/50 min-h-screen py-8">
        <div className="mx-auto max-w-4xl px-4">
          <Card className="p-12 text-center">
            <h2 className="mb-4 text-xl font-semibold">{t('localFood.itemNotFound')}</h2>
            <p className="text-muted-foreground mb-6">{t('localFood.itemNotFoundDesc')}</p>
            <Link href="/local-food">
              <Button>{t('localFood.browseFood')}</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === item.vendorId;
  const totalPrice = item.price * quantity;

  return (
    <div className="bg-muted/50 min-h-screen py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center text-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Image */}
            <div className="bg-muted relative h-64 overflow-hidden rounded-xl md:h-80">
              {item.images && item.images.length > 0 ? (
                <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <UtensilsCrossed className="text-muted-foreground h-20 w-20" />
                </div>
              )}
            </div>

            {/* Details */}
            <Card className="p-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Badge variant="outline" className="mb-2">
                    {item.category}
                  </Badge>
                  <h1 className="text-foreground text-2xl font-bold">{item.title}</h1>
                </div>
                <p className="text-primary text-3xl font-bold">${item.price}</p>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {item.deliveryAvailable && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    <Truck className="mr-1 h-3 w-3" />
                    {t('localFood.deliveryAvailable')}
                  </Badge>
                )}
                {item.pickupOnly && (
                  <Badge className="bg-primary/10 text-primary">
                    <MapPin className="mr-1 h-3 w-3" />
                    {t('localFood.pickupOnly')}
                  </Badge>
                )}
                {!item.pickupOnly && !item.deliveryAvailable && (
                  <Badge className="bg-primary/10 text-primary">
                    <MapPin className="mr-1 h-3 w-3" />
                    {t('localFood.pickup')}
                  </Badge>
                )}
              </div>

              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {item.description}
              </p>

              <div className="text-muted-foreground mt-4 flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                {item.location}
              </div>

              {item.pickupLocation && (
                <div className="text-muted-foreground mt-2 text-sm">
                  <strong>{t('localFood.pickupLocationLabel')}</strong> {item.pickupLocation}
                </div>
              )}

              {item.deliveryArea && (
                <div className="text-muted-foreground mt-2 text-sm">
                  <strong>{t('localFood.deliveryAreaLabel')}</strong> {item.deliveryArea}
                </div>
              )}

              <p className="text-muted-foreground mt-4 text-xs">
                {t('localFood.listed')}{' '}
                {new Date(item.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vendor Info */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">{t('localFood.vendor')}</h3>
              <Link href={`/profile/${item.vendor?.id}`} className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  {item.vendor?.avatar ? (
                    <Image
                      src={item.vendor.avatar}
                      alt={item.vendor.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="bg-primary flex h-full w-full items-center justify-center text-lg font-bold text-white">
                      {item.vendor?.name?.charAt(0) || 'V'}
                    </div>
                  )}
                </Avatar>
                <div>
                  <p className="font-semibold">{item.vendor?.name || 'Unknown'}</p>
                  <div className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{item.vendor?.rating?.toFixed(1) || '0.0'}</span>
                    <span>({item.vendor?.reviewCount || 0} reviews)</span>
                  </div>
                  {item.vendor?.isVerified && (
                    <Badge
                      variant="outline"
                      className="mt-1 border-green-600 text-green-600 dark:text-green-400"
                    >
                      <Shield className="mr-1 h-3 w-3" />
                      {t('jobs.verified')}
                    </Badge>
                  )}
                </div>
              </Link>
            </Card>

            {/* Order / Action */}
            {!isOwner && isAuthenticated && (
              <Card className="p-6">
                {!showOrderForm ? (
                  <Button className="w-full" size="lg" onClick={() => setShowOrderForm(true)}>
                    <UtensilsCrossed className="mr-2 h-4 w-4" />
                    {t('localFood.placeOrder')}
                  </Button>
                ) : (
                  <form onSubmit={handleSubmitOrder} className="space-y-4">
                    <h3 className="font-semibold">{t('localFood.orderDetails')}</h3>

                    {/* Quantity */}
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        {t('localFood.quantity')}
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-full border"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-lg font-semibold">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.min(100, quantity + 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-full border"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Order Type */}
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        {item.pickupOnly ? t('localFood.pickup') : t('localFood.deliveryOrPickup')}
                      </label>
                      <div className="flex gap-2">
                        {!item.pickupOnly && item.deliveryAvailable && (
                          <button
                            type="button"
                            onClick={() => setOrderType('DELIVERY')}
                            className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-medium transition ${
                              orderType === 'DELIVERY'
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border text-muted-foreground'
                            }`}
                          >
                            <Truck className="mx-auto mb-1 h-4 w-4" />
                            {t('localFood.delivery')}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setOrderType('PICKUP')}
                          className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-medium transition ${
                            orderType === 'PICKUP'
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border text-muted-foreground'
                          }`}
                        >
                          <MapPin className="mx-auto mb-1 h-4 w-4" />
                          {t('localFood.pickup')}
                        </button>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    {orderType === 'DELIVERY' && (
                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          {t('localFood.deliveryAddress')}
                        </label>
                        <input
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="focus:ring-primary w-full rounded-lg border px-3 py-2 text-sm focus:border-transparent focus:ring-2"
                          placeholder={t('localFood.deliveryAddressPlaceholder')}
                          required
                        />
                      </div>
                    )}

                    {/* Message */}
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        {t('localFood.messageOptional')}
                      </label>
                      <textarea
                        value={orderMessage}
                        onChange={(e) => setOrderMessage(e.target.value)}
                        className="focus:ring-primary w-full resize-none rounded-lg border px-3 py-2 text-sm focus:border-transparent focus:ring-2"
                        rows={2}
                        placeholder={t('localFood.messagePlaceholder')}
                      />
                    </div>

                    {/* Total */}
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {quantity}x ${item.price}
                        </span>
                        <span className="text-primary text-lg font-bold">
                          ${totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowOrderForm(false)}
                        disabled={orderMutation.isPending}
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button type="submit" className="flex-1" disabled={orderMutation.isPending}>
                        {orderMutation.isPending
                          ? t('localFood.placing')
                          : t('localFood.placeOrder')}
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            )}

            {!isAuthenticated && (
              <Card className="p-6">
                <Link href="/register?message=Create an account to order local food">
                  <Button className="w-full" size="lg">
                    {t('localFood.signUpToOrder')}
                  </Button>
                </Link>
                <p className="text-muted-foreground mt-2 text-center text-xs">
                  {t('jobs.alreadyHaveAccount')}{' '}
                  <Link href="/login" className="text-primary hover:underline">
                    {t('auth.login')}
                  </Link>
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
