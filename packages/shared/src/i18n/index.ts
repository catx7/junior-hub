// ===========================================
// LocalServices i18n Configuration
// ===========================================

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../constants';
import { en } from './locales/en';
import { ro } from './locales/ro';

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export type TranslationKeys = typeof en;

export const translations: Record<Locale, TranslationKeys> = {
  en,
  ro,
};

export function getTranslation(locale: Locale = DEFAULT_LOCALE): TranslationKeys {
  return translations[locale] || translations[DEFAULT_LOCALE];
}

export function t(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const translation = getTranslation(locale);
  const keys = key.split('.');
  let value: unknown = translation;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key; // Return key if translation not found
    }
  }

  if (typeof value !== 'string') {
    return key;
  }

  // Replace parameters like {{name}} with actual values
  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) => {
      return String(params[paramKey] ?? `{{${paramKey}}}`);
    });
  }

  return value;
}

export { en, ro };
export { DEFAULT_LOCALE, SUPPORTED_LOCALES };
