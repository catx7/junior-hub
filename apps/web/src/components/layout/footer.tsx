'use client';

import Link from 'next/link';
import { Twitter, Facebook, Instagram, Shield, Lock, Scale } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { openCookieSettings } from '@/components/cookie-consent';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { href: '/about', labelKey: 'footer.about' },
      { href: '/help', labelKey: 'footer.help' },
      { href: '/contact', labelKey: 'footer.contact' },
      { href: '/ghid-parinti', labelKey: 'footer.parentGuide' },
    ],
    support: [
      { href: '/jobs', labelKey: 'footer.browseJobs' },
      { href: '/kids-events', labelKey: 'footer.kidsEvents' },
      { href: '/anpc', labelKey: 'footer.anpc' },
    ],
    legal: [
      { href: '/terms', labelKey: 'footer.termsOfService' },
      { href: '/privacy', labelKey: 'footer.privacyPolicy' },
      { href: '/cookies', labelKey: 'footer.cookiePolicy' },
    ],
  };

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container-custom py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <span className="text-lg font-bold text-white">J</span>
              </div>
              <span className="font-semibold">JuniorHub</span>
            </Link>
            <p className="text-muted-foreground mt-4 text-sm">{t('footer.tagline')}</p>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">{t('footer.company')}</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">{t('footer.support')}</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">{t('footer.legal')}</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={openCookieSettings}
                  className="text-muted-foreground hover:text-primary text-sm transition-colors"
                >
                  {t('footer.cookieSettings')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Child Safety & ANPC */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t pt-6 text-xs">
          <Link
            href="/child-safety"
            className="text-muted-foreground hover:text-primary font-medium transition-colors"
          >
            {t('footer.childSafety')}
          </Link>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground">
            Urgențe:{' '}
            <a href="tel:112" className="hover:text-primary font-medium transition-colors">
              112
            </a>{' '}
            | Telefonul Copilului:{' '}
            <a href="tel:116111" className="hover:text-primary font-medium transition-colors">
              116 111
            </a>
          </span>
          <span className="text-muted-foreground">|</span>
          <a
            href="https://anpc.ro"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            ANPC
          </a>
          <span className="text-muted-foreground">|</span>
          <a
            href="https://anpc.ro/ce-este-sal/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            SAL
          </a>
          <span className="text-muted-foreground">|</span>
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            {t('footer.odrPlatform')}
          </a>
        </div>

        {/* Trust Seals */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs">
          <div className="text-muted-foreground flex items-center gap-1.5">
            <Lock className="h-4 w-4" />
            <span>SSL Secured</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-1.5">
            <Shield className="h-4 w-4" />
            <span>GDPR Compliant</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-1.5">
            <Scale className="h-4 w-4" />
            <span>ANPC Protected</span>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-6 flex flex-col items-center justify-between border-t pt-8 md:flex-row">
          <p className="text-muted-foreground text-sm">
            {t('footer.copyright', { year: currentYear })}
          </p>
          <div className="mt-4 flex space-x-6 md:mt-0">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
