'use client';

import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import { LOCALES } from '@localservices/shared';
import { toast } from 'sonner';

export default function LanguageSettingsPage() {
  const { t, locale, setLocale } = useTranslation();

  const handleLanguageChange = (code: string) => {
    if (code === locale) return;
    setLocale(code as 'en' | 'ro');
    toast.success(t('settings.languageChanged'));
  };

  return (
    <div className="bg-muted/50 min-h-screen py-8">
      <div className="mx-auto max-w-3xl px-4">
        <Link
          href="/settings"
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center text-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('verification.backToSettings')}
        </Link>

        <div className="mb-8">
          <h1 className="text-foreground text-3xl font-bold">{t('settings.language')}</h1>
          <p className="text-muted-foreground mt-1">{t('settings.languageDesc')}</p>
        </div>

        <Card className="divide-border divide-y">
          {Object.values(LOCALES).map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`hover:bg-muted/50 flex w-full items-center justify-between p-4 text-left transition ${
                locale === lang.code ? 'bg-primary/5' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{lang.flag}</span>
                <div>
                  <p className="text-foreground font-medium">{lang.nativeName}</p>
                  <p className="text-muted-foreground text-sm">{lang.name}</p>
                </div>
              </div>
              {locale === lang.code && <Check className="text-primary h-5 w-5" />}
            </button>
          ))}
        </Card>
      </div>
    </div>
  );
}
