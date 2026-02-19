'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Shield, ArrowLeft, CheckCircle2, Clock, XCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useVerificationStatus, useCreateVerificationSession } from '@/hooks/use-verification';
import { useTranslation } from '@/hooks/use-translation';

export default function BecomeProviderPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-muted/50 min-h-screen py-8">
          <div className="mx-auto max-w-2xl px-4">
            <div className="animate-pulse space-y-4">
              <div className="bg-muted h-8 w-48 rounded" />
              <div className="bg-muted h-64 rounded-lg" />
            </div>
          </div>
        </div>
      }
    >
      <BecomeProviderContent />
    </Suspense>
  );
}

function BecomeProviderContent() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const { data: verificationData, isLoading } = useVerificationStatus();
  const sessionMutation = useCreateVerificationSession();

  const [motivation, setMotivation] = useState('');
  const [step, setStep] = useState<'motivation' | 'identity'>('motivation');

  const verificationComplete = searchParams.get('verification') === 'complete';

  const handleMotivationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (motivation.trim().length < 20) return;
    setStep('identity');
  };

  const handleStartVerification = async () => {
    try {
      const result = await sessionMutation.mutateAsync({
        motivation: motivation.trim(),
      });
      // Redirect to idnorm verification URL
      if (result.verificationUrl) {
        window.location.href = result.verificationUrl;
      }
    } catch {
      // Error handled by mutation hook
    }
  };

  // Already a provider
  if (user?.role === 'PROVIDER' || user?.role === 'ADMIN') {
    return (
      <div className="bg-muted/50 min-h-screen py-8">
        <div className="mx-auto max-w-2xl px-4">
          <Link
            href="/settings"
            className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('verification.backToSettings')}
          </Link>

          <Card className="p-8 text-center">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h1 className="text-foreground mb-2 text-2xl font-bold">
              {t('verification.alreadyProvider')}
            </h1>
            <p className="text-muted-foreground">
              {user.role === 'PROVIDER'
                ? t('verification.alreadyProviderDesc')
                : t('verification.alreadyAdminDesc')}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-muted/50 min-h-screen py-8">
        <div className="mx-auto max-w-2xl px-4">
          <div className="animate-pulse space-y-4">
            <div className="bg-muted h-8 w-48 rounded" />
            <div className="bg-muted h-64 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  const status = verificationData?.status;
  const existingRequest = verificationData?.request;

  // Pending request or just returned from verification
  if (status === 'pending' || verificationComplete) {
    return (
      <div className="bg-muted/50 min-h-screen py-8">
        <div className="mx-auto max-w-2xl px-4">
          <Link
            href="/settings"
            className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('verification.backToSettings')}
          </Link>

          <Card className="p-8 text-center">
            <Clock className="mx-auto mb-4 h-16 w-16 text-orange-500" />
            <h1 className="text-foreground mb-2 text-2xl font-bold">
              {t('verification.underReview')}
            </h1>
            <p className="text-muted-foreground mb-4">{t('verification.underReviewDesc')}</p>
            <Badge className="bg-orange-500">{t('verification.pendingReview')}</Badge>
            {existingRequest?.submittedAt && (
              <p className="text-muted-foreground mt-4 text-sm">
                {t('verification.submittedOn')}{' '}
                {new Date(existingRequest.submittedAt).toLocaleDateString()}
              </p>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // New application or re-application after rejection
  return (
    <div className="bg-muted/50 min-h-screen py-8">
      <div className="mx-auto max-w-2xl px-4">
        <Link
          href="/settings"
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('verification.backToSettings')}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <Shield className="text-primary h-8 w-8" />
            <h1 className="text-foreground text-3xl font-bold">{t('verification.title')}</h1>
          </div>
          <p className="text-muted-foreground">{t('verification.subtitle')}</p>
        </div>

        {/* Previous rejection notice */}
        {status === 'rejected' && existingRequest && (
          <Card className="border-l-destructive bg-destructive/5 mb-6 border-l-4 p-4">
            <div className="flex items-start gap-3">
              <XCircle className="text-destructive mt-0.5 h-5 w-5" />
              <div>
                <p className="text-destructive font-medium">{t('verification.previousRejected')}</p>
                {existingRequest.notes && (
                  <p className="text-destructive/80 mt-1 text-sm">
                    {t('verification.reason')}: {existingRequest.notes}
                  </p>
                )}
                <p className="text-destructive/80 mt-2 text-sm">{t('verification.canReapply')}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Step indicator */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-white ${step === 'motivation' ? 'bg-primary' : 'bg-green-500'}`}
            >
              {step === 'motivation' ? '1' : <CheckCircle2 className="h-5 w-5" />}
            </div>
            <span
              className={`text-sm font-medium ${step === 'motivation' ? 'text-primary' : 'text-green-600 dark:text-green-400'}`}
            >
              {t('verification.stepMotivation')}
            </span>
          </div>
          <div className="bg-border h-px flex-1" />
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${step === 'identity' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
            >
              2
            </div>
            <span
              className={`text-sm font-medium ${step === 'identity' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {t('verification.stepIdentity')}
            </span>
          </div>
        </div>

        {step === 'motivation' ? (
          <form onSubmit={handleMotivationSubmit}>
            <Card className="space-y-6 p-6">
              <div className="space-y-2">
                <Label htmlFor="motivation">{t('verification.motivationLabel')} *</Label>
                <textarea
                  id="motivation"
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  rows={5}
                  className="border-input bg-background focus:border-ring focus:ring-ring w-full resize-none rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-1"
                  placeholder={t('verification.motivationPlaceholder')}
                />
                <p className="text-muted-foreground text-xs">
                  {motivation.length}/2000 {t('verification.characters')}
                </p>
              </div>

              <div className="border-t pt-6">
                <Button type="submit" className="w-full" disabled={motivation.trim().length < 20}>
                  <Send className="mr-2 h-4 w-4" />
                  {t('verification.continueToIdentity')}
                </Button>
              </div>
            </Card>
          </form>
        ) : (
          <Card className="space-y-6 p-6">
            <div className="flex items-center gap-3">
              <Shield className="text-primary h-6 w-6" />
              <h2 className="text-foreground text-xl font-bold">
                {t('verification.identityTitle')}
              </h2>
            </div>
            <p className="text-muted-foreground text-sm">{t('verification.idnormDesc')}</p>

            {/* Verification prompt area */}
            <div className="border-border rounded-lg border-2 border-dashed p-8 text-center">
              <Shield className="text-primary mx-auto mb-3 h-12 w-12" />
              <p className="text-foreground mb-1 font-medium">
                {t('verification.secureVerification')}
              </p>
              <p className="text-muted-foreground text-sm">
                {t('verification.idnormRedirectNote')}
              </p>
            </div>

            <div className="flex gap-3 border-t pt-6">
              <Button type="button" variant="outline" onClick={() => setStep('motivation')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('common.back')}
              </Button>
              <Button
                className="flex-1"
                onClick={handleStartVerification}
                disabled={sessionMutation.isPending}
              >
                {sessionMutation.isPending
                  ? t('verification.submitting')
                  : t('verification.startVerification')}
              </Button>
            </div>
          </Card>
        )}

        {/* Info Card */}
        <Card className="border-l-primary bg-primary/5 mt-6 border-l-4 p-6">
          <div className="flex items-start gap-3">
            <Shield className="text-primary mt-1 h-6 w-6" />
            <div>
              <h3 className="text-foreground mb-2 font-semibold">{t('verification.howItWorks')}</h3>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>1. {t('verification.step1')}</li>
                <li>2. {t('verification.step2')}</li>
                <li>3. {t('verification.step3')}</li>
                <li>4. {t('verification.step4')}</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
