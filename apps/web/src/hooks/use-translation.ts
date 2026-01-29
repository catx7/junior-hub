'use client';

import { useCallback } from 'react';
import { useLocaleStore } from '@/stores/locale-store';
import { t as translate, type Locale } from '@localservices/shared';

export function useTranslation() {
  const { locale, setLocale } = useLocaleStore();

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return translate(locale as Locale, key, params);
    },
    [locale]
  );

  return {
    t,
    locale,
    setLocale,
  };
}
