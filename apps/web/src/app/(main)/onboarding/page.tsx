'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  User,
  Briefcase,
  MapPin,
  Camera,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Button, Input, Card, CardContent, Label, UserAvatar } from '@/components/ui';
import { LocationPicker } from '@/components/ui/location-picker';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/hooks/use-auth';
import { usersApi, providersApi } from '@/lib/api';
import { JOB_CATEGORIES } from '@localservices/shared';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Role = 'parent' | 'provider' | null;

export default function OnboardingPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Role
  const [selectedRole, setSelectedRole] = useState<Role>(null);

  // Step 2: Location
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // Step 3: Profile
  const [bio, setBio] = useState('');

  // Step 4: Provider details
  const [headline, setHeadline] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const totalSteps = selectedRole === 'provider' ? 4 : 3;

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Pre-fill existing data
  useEffect(() => {
    if (user) {
      if (user.address) setAddress(user.address);
      if (user.bio) setBio(user.bio);
    }
  }, [user]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-t-primary h-8 w-8 animate-spin rounded-full border-4 border-gray-200" />
      </div>
    );
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedRole !== null;
      case 2:
        return true; // Location is optional
      case 3:
        return true; // Bio is optional
      case 4:
        return true; // Provider details are optional
      default:
        return true;
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Update user profile
      const profileData: Record<string, unknown> = {};

      if (address && lat && lng) {
        profileData.address = address;
        profileData.latitude = lat;
        profileData.longitude = lng;
      }

      if (bio) {
        profileData.bio = bio;
      }

      if (Object.keys(profileData).length > 0) {
        await usersApi.updateMe(profileData);
      }

      // If provider role was selected, create provider profile
      if (selectedRole === 'provider') {
        try {
          const providerData: Record<string, unknown> = {};
          if (headline) providerData.headline = headline;
          if (yearsExperience) providerData.yearsExperience = Number(yearsExperience);
          if (hourlyRate) providerData.hourlyRate = Number(hourlyRate);
          if (selectedCategories.length > 0) providerData.categories = selectedCategories;

          await providersApi.createProfile(providerData);
        } catch {
          // Provider profile creation is non-critical for onboarding
        }
      }

      toast.success(t('onboarding.finish'));
      router.push('/');
    } catch (error) {
      console.error('Onboarding save error:', error);
      toast.error(t('common.somethingWentWrong'));
    } finally {
      setSaving(false);
    }
  };

  const categories = Object.values(JOB_CATEGORIES);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <p className="text-muted-foreground mb-2 text-center text-sm">
            {t('onboarding.step', { current: step, total: totalSteps })}
          </p>
          <div className="bg-muted h-2 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div>
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-2xl font-bold">{t('onboarding.roleTitle')}</h1>
              <p className="text-muted-foreground">{t('onboarding.roleDesc')}</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setSelectedRole('parent')}
                className={cn(
                  'flex w-full items-start gap-4 rounded-xl border-2 p-5 text-left transition',
                  selectedRole === 'parent'
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50 bg-card border-transparent'
                )}
              >
                <div
                  className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
                    selectedRole === 'parent'
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Search className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{t('onboarding.roleParent')}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {t('onboarding.roleParentDesc')}
                  </p>
                </div>
                {selectedRole === 'parent' && (
                  <CheckCircle className="text-primary ml-auto h-6 w-6 shrink-0" />
                )}
              </button>

              <button
                onClick={() => setSelectedRole('provider')}
                className={cn(
                  'flex w-full items-start gap-4 rounded-xl border-2 p-5 text-left transition',
                  selectedRole === 'provider'
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50 bg-card border-transparent'
                )}
              >
                <div
                  className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
                    selectedRole === 'provider'
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{t('onboarding.roleProvider')}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {t('onboarding.roleProviderDesc')}
                  </p>
                </div>
                {selectedRole === 'provider' && (
                  <CheckCircle className="text-primary ml-auto h-6 w-6 shrink-0" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div>
            <div className="mb-8 text-center">
              <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                <MapPin className="h-7 w-7" />
              </div>
              <h1 className="mb-2 text-2xl font-bold">{t('onboarding.locationTitle')}</h1>
              <p className="text-muted-foreground">{t('onboarding.locationDesc')}</p>
            </div>

            <LocationPicker
              value={address}
              onChange={setAddress}
              onCoordinatesChange={(newLat, newLng) => {
                setLat(newLat);
                setLng(newLng);
              }}
              defaultLat={lat || undefined}
              defaultLng={lng || undefined}
              placeholder={t('onboarding.locationPlaceholder')}
              showMap={true}
            />
          </div>
        )}

        {/* Step 3: Profile */}
        {step === 3 && (
          <div>
            <div className="mb-8 text-center">
              <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                <User className="h-7 w-7" />
              </div>
              <h1 className="mb-2 text-2xl font-bold">{t('onboarding.profileTitle')}</h1>
              <p className="text-muted-foreground">{t('onboarding.profileDesc')}</p>
            </div>

            <div className="space-y-6">
              {/* Avatar preview */}
              <div className="flex flex-col items-center gap-3">
                <UserAvatar src={user?.avatar} name={user?.name || 'User'} size="lg" />
                <p className="text-muted-foreground text-xs">{t('onboarding.photoHint')}</p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label>{t('profile.bioLabel')}</Label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t('onboarding.bioPlaceholder')}
                  rows={4}
                  maxLength={500}
                  className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
                />
                <p className="text-muted-foreground text-right text-xs">{bio.length}/500</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Provider Details */}
        {step === 4 && selectedRole === 'provider' && (
          <div>
            <div className="mb-8 text-center">
              <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                <Briefcase className="h-7 w-7" />
              </div>
              <h1 className="mb-2 text-2xl font-bold">{t('onboarding.providerTitle')}</h1>
              <p className="text-muted-foreground">{t('onboarding.providerDesc')}</p>
            </div>

            <div className="space-y-5">
              {/* Headline */}
              <div className="space-y-2">
                <Label>{t('onboarding.headline')}</Label>
                <Input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder={t('onboarding.headlinePlaceholder')}
                  maxLength={100}
                />
              </div>

              {/* Experience + Rate row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('onboarding.experience')}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('onboarding.hourlyRate')}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="50"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <Label>{t('onboarding.selectCategories')}</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        setSelectedCategories((prev) =>
                          prev.includes(cat.id)
                            ? prev.filter((c) => c !== cat.id)
                            : [...prev, cat.id]
                        )
                      }
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition',
                        selectedCategories.includes(cat.id)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'hover:bg-muted'
                      )}
                    >
                      <span>{cat.icon}</span>
                      {t(cat.labelKey)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          {step > 1 ? (
            <Button variant="ghost" onClick={handleBack}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              {t('onboarding.back')}
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            {step < totalSteps && step > 1 && (
              <Button variant="ghost" onClick={handleNext}>
                {t('onboarding.skip')}
              </Button>
            )}

            {step < totalSteps ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                {t('onboarding.next')}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleFinish} isLoading={saving}>
                {t('onboarding.finish')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
