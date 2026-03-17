import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://juniorhub.ro';

const ROMANIAN_CITIES = [
  'bucuresti',
  'cluj-napoca',
  'timisoara',
  'iasi',
  'brasov',
  'constanta',
  'craiova',
  'galati',
  'oradea',
  'sibiu',
  'ploiesti',
  'pitesti',
  'arad',
  'targu-mures',
  'baia-mare',
];

const SERVICE_TYPES = ['babysitting', 'curatenie'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/jobs`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/providers`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/kids-events`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/kids-clothes`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/local-food`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/help`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/cookies`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/anpc`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ];

  // City landing pages (SEO critical)
  const cityPages: MetadataRoute.Sitemap = ROMANIAN_CITIES.flatMap((city) => [
    {
      url: `${BASE_URL}/babysitter/${city}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    ...SERVICE_TYPES.map((service) => ({
      url: `${BASE_URL}/servicii/${city}/${service}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]);

  // Category-only pages
  const categoryPages: MetadataRoute.Sitemap = SERVICE_TYPES.map((service) => ({
    url: `${BASE_URL}/servicii/${service}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  return [...staticPages, ...categoryPages, ...cityPages];
}
