'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocationPicker } from '@/components/ui/location-picker';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { getIdToken } from '@/lib/firebase';
import {
  createLocalFoodSchema,
  type CreateLocalFoodInput,
  LOCAL_FOOD_CATEGORIES,
} from '@localservices/shared';

export default function CreateLocalFoodPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateLocalFoodInput>({
    resolver: zodResolver(createLocalFoodSchema),
    defaultValues: {
      pickupOnly: false,
      deliveryAvailable: false,
    },
  });

  const category = watch('category');
  const pickupOnly = watch('pickupOnly');
  const deliveryAvailable = watch('deliveryAvailable');
  const title = watch('title') || '';
  const description = watch('description') || '';

  const createMutation = useMutation({
    mutationFn: async (data: CreateLocalFoodInput) => {
      const token = await getIdToken();
      const res = await fetch('/api/local-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(
          err.error?.message || err.error?.details?.[0]?.message || 'Failed to create listing'
        );
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(t('localFood.foodListingCreated'));
      router.push(`/local-food/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.message || t('errors.serverError'));
    },
  });

  const onSubmit = (data: CreateLocalFoodInput) => {
    createMutation.mutate(data);
  };

  if (user?.role !== 'PROVIDER' && user?.role !== 'ADMIN') {
    return (
      <div className="bg-muted/50 min-h-screen py-8">
        <div className="mx-auto max-w-2xl px-4">
          <Card className="p-12 text-center">
            <h2 className="mb-4 text-xl font-semibold">{t('localFood.providerRequired')}</h2>
            <p className="text-muted-foreground mb-6">{t('localFood.providerRequiredDesc')}</p>
            <Button onClick={() => router.push('/settings')}>{t('localFood.goToSettings')}</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/50 min-h-screen py-8">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-8">
          <h1 className="text-foreground text-3xl font-bold">
            {t('localFood.createListingTitle')}
          </h1>
          <p className="text-muted-foreground mt-2">{t('localFood.createListingDesc')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Category */}
          <Card className="mb-6 p-6">
            <Label className="mb-4 block text-lg font-semibold">
              {t('localFood.foodCategory')}
            </Label>
            <div className="flex flex-wrap gap-3">
              {LOCAL_FOOD_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setValue('category', cat)}
                  className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition ${
                    category === cat
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:border-border'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="text-destructive mt-2 text-sm">{errors.category.message}</p>
            )}
          </Card>

          {/* Title & Description */}
          <Card className="mb-6 space-y-6 p-6">
            <div>
              <Label htmlFor="title">{t('localFood.titleLabel')}</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder={t('localFood.titlePlaceholder')}
                maxLength={100}
                className="mt-2"
                error={!!errors.title}
              />
              {errors.title ? (
                <p className="text-destructive mt-1 text-sm">{errors.title.message}</p>
              ) : (
                <p className="text-muted-foreground mt-1 text-right text-xs">{title.length}/100</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">{t('localFood.descriptionLabel')}</Label>
              <textarea
                id="description"
                {...register('description')}
                placeholder={t('localFood.descriptionPlaceholder')}
                maxLength={2000}
                rows={5}
                className="focus:ring-primary mt-2 w-full resize-none rounded-lg border px-4 py-3 focus:border-transparent focus:ring-2"
              />
              {errors.description ? (
                <p className="text-destructive mt-1 text-sm">{errors.description.message}</p>
              ) : (
                <p className="text-muted-foreground mt-1 text-right text-xs">
                  {description.length}/2000
                </p>
              )}
            </div>
          </Card>

          {/* Price & Location */}
          <Card className="mb-6 space-y-6 p-6">
            <div>
              <Label htmlFor="price">{t('localFood.pricePerItem')}</Label>
              <div className="relative mt-2">
                <DollarSign className="text-muted-foreground absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="0.00"
                  className="pl-10"
                  error={!!errors.price}
                />
              </div>
              {errors.price && (
                <p className="text-destructive mt-1 text-sm">{errors.price.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="location">{t('localFood.locationLabel')}</Label>
              <div className="mt-2">
                <LocationPicker
                  value={watch('location') || ''}
                  onChange={(address) => setValue('location', address)}
                  onCoordinatesChange={(lat, lng) => {
                    setValue('latitude', lat);
                    setValue('longitude', lng);
                  }}
                  defaultLat={watch('latitude') || undefined}
                  defaultLng={watch('longitude') || undefined}
                  placeholder={t('localFood.locationPlaceholder')}
                  error={!!errors.location}
                />
              </div>
              {errors.location && (
                <p className="text-destructive mt-1 text-sm">{errors.location.message}</p>
              )}
            </div>
          </Card>

          {/* Pickup / Delivery Options */}
          <Card className="mb-6 p-6">
            <Label className="mb-4 block text-lg font-semibold">
              {t('localFood.availabilityOptions')}
            </Label>

            <div className="space-y-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  {...register('pickupOnly')}
                  className="border-border mt-1 h-4 w-4 rounded"
                />
                <div>
                  <p className="font-medium">{t('localFood.pickupOnlyLabel')}</p>
                  <p className="text-muted-foreground text-sm">{t('localFood.pickupOnlyDesc')}</p>
                </div>
              </label>

              {pickupOnly && (
                <div className="ml-7">
                  <Label htmlFor="pickupLocation">{t('localFood.pickupLocation')}</Label>
                  <Input
                    id="pickupLocation"
                    {...register('pickupLocation')}
                    placeholder={t('localFood.pickupLocationPlaceholder')}
                    className="mt-1"
                  />
                </div>
              )}

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  {...register('deliveryAvailable')}
                  className="border-border mt-1 h-4 w-4 rounded"
                />
                <div>
                  <p className="font-medium">{t('localFood.deliveryAvailableOption')}</p>
                  <p className="text-muted-foreground text-sm">
                    {t('localFood.deliveryAvailableDesc')}
                  </p>
                </div>
              </label>

              {deliveryAvailable && (
                <div className="ml-7">
                  <Label htmlFor="deliveryArea">{t('localFood.deliveryArea')}</Label>
                  <Input
                    id="deliveryArea"
                    {...register('deliveryArea')}
                    placeholder={t('localFood.deliveryAreaPlaceholder')}
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
              disabled={createMutation.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
              {createMutation.isPending ? t('localFood.creating') : t('localFood.createListing')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
