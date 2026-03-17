'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';

const COOKIE_CONSENT_KEY = 'juniorhub-cookie-consent';

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  functional: false,
  analytics: false,
  marketing: false,
};

function getStoredConsent(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function storeConsent(preferences: CookiePreferences) {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences));
}

export function CookieConsent() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      setVisible(true);
    }

    const handleReset = () => setVisible(true);
    window.addEventListener('cookie-consent-reset', handleReset);
    return () => window.removeEventListener('cookie-consent-reset', handleReset);
  }, []);

  const handleAcceptAll = useCallback(() => {
    const all: CookiePreferences = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    storeConsent(all);
    setVisible(false);
  }, []);

  const handleRejectAll = useCallback(() => {
    const minimal: CookiePreferences = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    storeConsent(minimal);
    setVisible(false);
  }, []);

  const handleSavePreferences = useCallback(() => {
    storeConsent(preferences);
    setVisible(false);
  }, [preferences]);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto max-w-4xl rounded-xl border bg-white p-6 shadow-2xl dark:bg-gray-900">
        {!showDetails ? (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{t('cookies.bannerTitle')}</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('cookies.bannerDescription')}{' '}
                <Link href="/cookies" className="text-primary underline">
                  {t('cookies.cookiePolicy')}
                </Link>
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => setShowDetails(true)}
                className="text-primary text-sm font-medium underline"
              >
                {t('cookies.managePreferences')}
              </button>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={handleRejectAll}>
                  {t('cookies.rejectAll')}
                </Button>
                <Button size="sm" onClick={handleAcceptAll}>
                  {t('cookies.acceptAll')}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{t('cookies.manageTitle')}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{t('cookies.manageDescription')}</p>
            </div>

            <div className="mb-6 space-y-4">
              <CookieToggle
                label={t('cookies.essential')}
                description={t('cookies.essentialDesc')}
                checked={true}
                disabled={true}
              />
              <CookieToggle
                label={t('cookies.functional')}
                description={t('cookies.functionalDesc')}
                checked={preferences.functional}
                onChange={(v) => setPreferences((p) => ({ ...p, functional: v }))}
              />
              <CookieToggle
                label={t('cookies.analytics')}
                description={t('cookies.analyticsDesc')}
                checked={preferences.analytics}
                onChange={(v) => setPreferences((p) => ({ ...p, analytics: v }))}
              />
              <CookieToggle
                label={t('cookies.marketing')}
                description={t('cookies.marketingDesc')}
                checked={preferences.marketing}
                onChange={(v) => setPreferences((p) => ({ ...p, marketing: v }))}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                onClick={() => setShowDetails(false)}
                className="text-muted-foreground text-sm underline"
              >
                {t('common.back')}
              </button>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={handleRejectAll}>
                  {t('cookies.rejectAll')}
                </Button>
                <Button size="sm" onClick={handleSavePreferences}>
                  {t('cookies.savePreferences')}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CookieToggle({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
      <div className="flex-1">
        <p className="text-sm font-medium">
          {label}
          {disabled && <span className="text-muted-foreground ml-2 text-xs font-normal">(*)</span>}
        </p>
        <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-gray-300'
        } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export function openCookieSettings() {
  localStorage.removeItem(COOKIE_CONSENT_KEY);
  window.dispatchEvent(new Event('cookie-consent-reset'));
}

/** Check if a specific cookie category has been consented to */
export function hasConsent(category: 'functional' | 'analytics' | 'marketing'): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return false;
    const prefs = JSON.parse(stored);
    return prefs[category] === true;
  } catch {
    return false;
  }
}

/** Get all cookie preferences */
export function getCookiePreferences(): Record<string, boolean> {
  if (typeof window === 'undefined')
    return { essential: true, functional: false, analytics: false, marketing: false };
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return { essential: true, functional: false, analytics: false, marketing: false };
    return JSON.parse(stored);
  } catch {
    return { essential: true, functional: false, analytics: false, marketing: false };
  }
}
