'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, DollarSign, Calendar, Upload, Briefcase, Wrench } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateJob } from '@/hooks/use-jobs';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { LocationPicker } from '@/components/ui/location-picker';
import { createJobSchema, type CreateJobInput, JOB_CATEGORIES } from '@localservices/shared';

export default function CreateJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const createJobMutation = useCreateJob();
  const { t } = useTranslation();

  const isProvider = user?.role === 'PROVIDER' || user?.role === 'ADMIN';
  const categories = Object.values(JOB_CATEGORIES);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      currency: 'USD',
      jobType: 'SERVICE_REQUEST',
      pricingType: 'FIXED',
      latitude: 0,
      longitude: 0,
    },
  });

  const category = watch('category');
  const jobType = watch('jobType');
  const pricingType = watch('pricingType');
  const title = watch('title') || '';
  const description = watch('description') || '';

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 5) {
      toast.error(t('jobs.maxImages'));
      return;
    }

    const newFiles = Array.from(files);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setImages([...images, ...newFiles]);
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreateJobInput) => {
    try {
      const job = await createJobMutation.mutateAsync(data);

      if (images.length > 0) {
        toast.info(t('jobs.imageUploadSoon'));
      }

      toast.success(
        jobType === 'SERVICE_OFFERING'
          ? t('jobs.serviceOfferingPosted')
          : t('jobs.jobPostedSuccess')
      );
      router.push(`/jobs/${job.id}`);
    } catch (error: any) {
      toast.error(error.message || t('errors.serverError'));
    }
  };

  return (
    <div className="bg-muted/50 min-h-screen py-8">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-8">
          <h1 className="text-foreground text-3xl font-bold">{t('jobs.createListing')}</h1>
          <p className="text-muted-foreground mt-2">{t('jobs.createListingDesc')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Job Type Selection */}
          <Card className="mb-6 p-6">
            <Label className="mb-4 block text-lg font-semibold">{t('jobs.whatToDo')}</Label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setValue('jobType', 'SERVICE_REQUEST')}
                className={`rounded-xl border-2 p-5 text-left transition ${
                  jobType === 'SERVICE_REQUEST'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-border'
                }`}
              >
                <Briefcase
                  className={`mb-2 h-8 w-8 ${jobType === 'SERVICE_REQUEST' ? 'text-primary' : 'text-muted-foreground'}`}
                />
                <p
                  className={`font-semibold ${jobType === 'SERVICE_REQUEST' ? 'text-primary' : 'text-foreground'}`}
                >
                  {t('jobs.iNeedService')}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">{t('jobs.postRequestDesc')}</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isProvider) {
                    toast.error(t('jobs.providerOnly'));
                    return;
                  }
                  setValue('jobType', 'SERVICE_OFFERING');
                }}
                className={`rounded-xl border-2 p-5 text-left transition ${
                  jobType === 'SERVICE_OFFERING'
                    ? 'border-green-500 bg-green-50'
                    : !isProvider
                      ? 'border-border cursor-not-allowed opacity-50'
                      : 'border-border hover:border-border'
                }`}
              >
                <Wrench
                  className={`mb-2 h-8 w-8 ${jobType === 'SERVICE_OFFERING' ? 'text-green-500' : 'text-muted-foreground'}`}
                />
                <p
                  className={`font-semibold ${jobType === 'SERVICE_OFFERING' ? 'text-green-700' : 'text-foreground'}`}
                >
                  {t('jobs.iOfferService')}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {isProvider ? t('jobs.postOfferingDesc') : t('jobs.becomeProviderDesc')}
                </p>
              </button>
            </div>
          </Card>

          {/* Category Selection */}
          <Card className="mb-6 p-6">
            <Label className="mb-4 block text-lg font-semibold">
              {jobType === 'SERVICE_OFFERING'
                ? t('jobs.whatServiceOffer')
                : t('jobs.whatServiceNeed')}
            </Label>
            <div className="grid grid-cols-3 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setValue('category', cat.id as any)}
                  className={`rounded-xl border-2 p-4 text-center transition ${
                    category === cat.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-border'
                  }`}
                >
                  <span className="mb-2 block text-3xl">{cat.icon}</span>
                  <span
                    className={`text-sm font-medium ${
                      category === cat.id ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    {cat.label}
                  </span>
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
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder={
                  jobType === 'SERVICE_OFFERING'
                    ? t('jobs.titlePlaceholderOffering')
                    : t('jobs.titlePlaceholderRequest')
                }
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
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                {...register('description')}
                placeholder={
                  jobType === 'SERVICE_OFFERING'
                    ? t('jobs.descPlaceholderOffering')
                    : t('jobs.descPlaceholderRequest')
                }
                maxLength={2000}
                rows={6}
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

          {/* Pricing & Location */}
          <Card className="mb-6 space-y-6 p-6">
            {/* Pricing Type (for SERVICE_OFFERING) */}
            {jobType === 'SERVICE_OFFERING' && (
              <div>
                <Label className="mb-3 block">{t('jobs.pricingType')}</Label>
                <div className="flex gap-3">
                  {[
                    { value: 'HOURLY', label: t('jobs.perHour') },
                    { value: 'PER_LOCATION', label: t('jobs.perVisit') },
                    { value: 'FIXED', label: t('jobs.fixedPrice') },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setValue('pricingType', option.value as any)}
                      className={`flex-1 rounded-lg border-2 px-4 py-3 text-center text-sm font-medium transition ${
                        pricingType === option.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground hover:border-border'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="budget">
                {jobType === 'SERVICE_OFFERING'
                  ? pricingType === 'HOURLY'
                    ? t('jobs.pricePerHour')
                    : pricingType === 'PER_LOCATION'
                      ? t('jobs.pricePerVisit')
                      : t('jobs.price')
                  : t('jobs.budgetOptional')}
              </Label>
              <div className="relative mt-2">
                <DollarSign className="text-muted-foreground absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  {...register('budget', { valueAsNumber: true })}
                  placeholder="0.00"
                  className="pl-10"
                  error={!!errors.budget}
                />
              </div>
              {errors.budget && (
                <p className="text-destructive mt-1 text-sm">{errors.budget.message}</p>
              )}
              {jobType === 'SERVICE_REQUEST' && (
                <p className="text-muted-foreground mt-1 text-xs">{t('jobs.openBudgetHint')}</p>
              )}
            </div>

            <div>
              <Label htmlFor="location">{t('jobs.location')}</Label>
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
                  placeholder={t('jobs.locationPlaceholder')}
                  error={!!errors.location}
                />
              </div>
              {errors.location && (
                <p className="text-destructive mt-1 text-sm">{errors.location.message}</p>
              )}
            </div>

            {/* Scheduled Date (only for SERVICE_REQUEST) */}
            {jobType === 'SERVICE_REQUEST' && (
              <div>
                <Label htmlFor="scheduledAt">{t('jobs.scheduledDateOptional')}</Label>
                <div className="relative mt-2">
                  <Calendar className="text-muted-foreground absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    {...register('scheduledAt')}
                    className="pl-10"
                  />
                </div>
                {errors.scheduledAt && (
                  <p className="text-destructive mt-1 text-sm">{errors.scheduledAt.message}</p>
                )}
              </div>
            )}
          </Card>

          {/* Images */}
          <Card className="mb-6 p-6">
            <Label className="mb-4 block">{t('jobs.photosOptional')}</Label>
            <p className="text-muted-foreground mb-4 text-sm">
              {t('jobs.photosDesc', { type: jobType === 'SERVICE_OFFERING' ? 'service' : 'job' })}
            </p>

            <div className="flex flex-wrap gap-4">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative h-24 w-24">
                  <Image
                    src={src}
                    alt={`Upload ${index + 1}`}
                    fill
                    className="rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <label className="border-border hover:border-border flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition">
                  <Upload className="text-muted-foreground h-6 w-6" />
                  <span className="text-muted-foreground mt-1 text-xs">{t('jobs.addPhoto')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
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
              disabled={createJobMutation.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={createJobMutation.isPending}>
              {createJobMutation.isPending
                ? t('jobs.posting')
                : jobType === 'SERVICE_OFFERING'
                  ? t('jobs.postServiceOffering')
                  : t('jobs.postJobRequest')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
