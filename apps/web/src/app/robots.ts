import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://juniorhub.ro';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/settings/',
          '/messages/',
          '/my-jobs/',
          '/my-offers/',
          '/profile/edit',
          '/jobs/new',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
