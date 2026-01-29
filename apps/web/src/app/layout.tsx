import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'LocalServices - Find Local Service Providers',
    template: '%s | LocalServices',
  },
  description:
    'Connect with trusted local service providers for babysitting, house cleaning, local food, and more. Post jobs or offer your services.',
  keywords: [
    'local services',
    'babysitter',
    'house cleaning',
    'local food',
    'service marketplace',
  ],
  authors: [{ name: 'LocalServices' }],
  creator: 'LocalServices',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://localservices.com',
    siteName: 'LocalServices',
    title: 'LocalServices - Find Local Service Providers',
    description:
      'Connect with trusted local service providers for babysitting, house cleaning, local food, and more.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LocalServices',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LocalServices - Find Local Service Providers',
    description:
      'Connect with trusted local service providers for babysitting, house cleaning, local food, and more.',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
