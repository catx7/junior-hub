'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Camera, Save, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { usersApi } from '@/lib/api';
import { updateProfileSchema, type UpdateProfileInput } from '@localservices/shared';
import { useTranslation } from '@/hooks/use-translation';
import { LocationPicker } from '@/components/ui/location-picker';

export default function EditProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        address: user.address || '',
      });
      setAvatarPreview(user.avatar || null);
    }
  }, [user, reset]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileInput) => usersApi.updateMe(data),
    onSuccess: (updatedUser) => {
      toast.success(t('profile.profileUpdated'));
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/profile');
    },
    onError: (error: any) => {
      console.error('Profile update error:', error);
      toast.error(error.message || t('errors.serverError'));
    },
  });

  const onSubmit = (data: UpdateProfileInput) => {
    // Remove empty/null fields
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value !== '' && value !== null && value !== undefined
      )
    ) as UpdateProfileInput;

    updateProfileMutation.mutate(cleanData);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('profile.imageTooLarge'));
        return;
      }
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      // TODO: Implement avatar upload to Cloudinary
      toast.info(t('profile.avatarUploadSoon'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-border border-t-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="bg-muted/50 min-h-screen py-8">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="hover:bg-muted flex h-10 w-10 items-center justify-center rounded-full transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-foreground text-2xl font-bold">{t('profile.editProfile')}</h1>
            <p className="text-muted-foreground">{t('profile.updateInfo')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Avatar */}
          <Card className="mb-6 p-6">
            <Label className="mb-4 block">{t('profile.profilePhoto')}</Label>
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {avatarPreview ? (
                    <Image src={avatarPreview} alt="Profile" fill />
                  ) : (
                    <div className="bg-primary flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </Avatar>
                <label className="bg-primary hover:bg-primary/90 absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition">
                  <Camera className="h-4 w-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-muted-foreground text-sm">
                <p>{t('profile.uploadNewPhoto')}</p>
                <p>{t('profile.photoFormats')}</p>
              </div>
            </div>
          </Card>

          {/* Basic Info */}
          <Card className="mb-6 space-y-6 p-6">
            <div>
              <Label htmlFor="name">{t('profile.fullName')}</Label>
              <Input id="name" {...register('name')} className="mt-2" error={!!errors.name} />
              {errors.name && (
                <p className="text-destructive mt-1 text-sm">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">{t('profile.emailAddress')}</Label>
              <Input id="email" type="email" value={user.email} className="mt-2" disabled />
              <p className="text-muted-foreground mt-1 text-xs">{t('profile.emailCannotChange')}</p>
            </div>

            <div>
              <Label htmlFor="phone">{t('profile.phoneNumber')}</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                className="mt-2"
                placeholder={t('profile.phonePlaceholder')}
                error={!!errors.phone}
              />
              {errors.phone && (
                <p className="text-destructive mt-1 text-sm">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="address">{t('profile.address')}</Label>
              <div className="mt-2">
                <LocationPicker
                  value={watch('address') || ''}
                  onChange={(address) => setValue('address', address, { shouldDirty: true })}
                  onCoordinatesChange={(lat, lng) => {
                    setValue('latitude', lat, { shouldDirty: true });
                    setValue('longitude', lng, { shouldDirty: true });
                  }}
                  defaultLat={watch('latitude') || undefined}
                  defaultLng={watch('longitude') || undefined}
                  placeholder={t('profile.addressPlaceholder')}
                  error={!!errors.address}
                />
              </div>
              {errors.address && (
                <p className="text-destructive mt-1 text-sm">{errors.address.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="bio">{t('profile.bioLabel')}</Label>
              <textarea
                id="bio"
                {...register('bio')}
                rows={4}
                maxLength={500}
                className="focus:ring-primary mt-2 w-full resize-none rounded-lg border px-4 py-3 focus:border-transparent focus:ring-2"
                placeholder={t('profile.bioPlaceholder')}
              />
              {errors.bio && <p className="text-destructive mt-1 text-sm">{errors.bio.message}</p>}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
              disabled={updateProfileMutation.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!isDirty || updateProfileMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {updateProfileMutation.isPending ? t('profile.saving') : t('profile.saveChanges')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
