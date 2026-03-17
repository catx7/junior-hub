export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'JuniorHub',
    url: 'https://juniorhub.ro',
    logo: 'https://juniorhub.ro/icons/icon-512x512.png',
    description:
      'Platformă de servicii locale pentru familii din România. Găsește bone, servicii de curățenie, evenimente pentru copii și multe altele.',
    areaServed: {
      '@type': 'Country',
      name: 'Romania',
    },
    sameAs: ['https://facebook.com/juniorhub', 'https://instagram.com/juniorhub'],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface JobJsonLdProps {
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  budget?: number;
  currency?: string;
  posterName: string;
  posterRating?: number;
  posterReviewCount?: number;
  datePosted: string;
}

export function JobJsonLd({
  title,
  description,
  location,
  latitude,
  longitude,
  budget,
  currency = 'RON',
  posterName,
  posterRating,
  posterReviewCount,
  datePosted,
}: JobJsonLdProps) {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: title,
    description,
    provider: {
      '@type': 'Person',
      name: posterName,
      ...(posterRating &&
        posterReviewCount && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: posterRating,
            reviewCount: posterReviewCount,
          },
        }),
    },
    areaServed: {
      '@type': 'Place',
      address: location,
      ...(latitude &&
        longitude && {
          geo: {
            '@type': 'GeoCoordinates',
            latitude,
            longitude,
          },
        }),
    },
    datePublished: datePosted,
  };

  if (budget) {
    jsonLd.offers = {
      '@type': 'Offer',
      price: budget,
      priceCurrency: currency,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface EventJsonLdProps {
  name: string;
  description: string;
  startDate: string;
  location: string;
  price?: number;
  currency?: string;
  organizerName: string;
  maxAttendees?: number;
}

export function EventJsonLd({
  name,
  description,
  startDate,
  location,
  price,
  currency = 'RON',
  organizerName,
  maxAttendees,
}: EventJsonLdProps) {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name,
    description,
    startDate,
    location: {
      '@type': 'Place',
      name: location,
    },
    organizer: {
      '@type': 'Person',
      name: organizerName,
    },
  };

  if (price !== undefined) {
    jsonLd.offers = {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
    };
  }

  if (maxAttendees) {
    jsonLd.maximumAttendeeCapacity = maxAttendees;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
