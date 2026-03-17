import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Star, Shield, Search, ChevronRight } from 'lucide-react';
import { prisma } from '@localservices/database';
import { ROMANIAN_CITIES, SERVICE_TYPES, getCityBySlug, getServiceBySlug } from '@/lib/seo-data';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://juniorhub.ro';

export const revalidate = 60;

export async function generateStaticParams() {
  // Pre-render top 2 cities at build; rest generated on-demand via ISR
  return ROMANIAN_CITIES.slice(0, 2).flatMap((city) =>
    SERVICE_TYPES.map((service) => ({
      city: city.slug,
      category: service.slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; category: string }>;
}): Promise<Metadata> {
  const { city: citySlug, category: categorySlug } = await params;
  const city = getCityBySlug(citySlug);
  const service = getServiceBySlug(categorySlug);
  if (!city || !service) return {};

  const title = `${service.nameRo} ${city.name} - Furnizori Verificați | JuniorHub`;
  const description = `${service.descriptionRo} Găsește furnizori verificați de ${service.nameRo.toLowerCase()} în ${city.name}, ${city.region}. Tarife, recenzii, rezervări online.`;

  return {
    title,
    description,
    keywords: [
      ...service.keywords.map((k) => `${k} ${city.name.toLowerCase()}`),
      ...service.keywords,
      city.name.toLowerCase(),
    ],
    alternates: {
      canonical: `${BASE_URL}/servicii/${city.slug}/${service.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/servicii/${city.slug}/${service.slug}`,
      siteName: 'JuniorHub',
      locale: 'ro_RO',
      type: 'website',
    },
  };
}

async function getPageData(cityName: string, category: string) {
  const [providers, jobCount] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: 'PROVIDER',
        address: { contains: cityName, mode: 'insensitive' },
        OR: [
          {
            jobsPosted: {
              some: {
                category: category as any,
                jobType: 'SERVICE_OFFERING',
              },
            },
          },
          { rating: { gt: 0 } },
        ],
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        address: true,
        rating: true,
        reviewCount: true,
        isVerified: true,
        providerProfile: {
          select: {
            headline: true,
            yearsExperience: true,
            hourlyRate: true,
            currency: true,
          },
        },
      },
      orderBy: { rating: 'desc' },
      take: 9,
    }),
    prisma.job.count({
      where: {
        category: category as any,
        location: { contains: cityName, mode: 'insensitive' },
        status: 'OPEN',
      },
    }),
  ]);

  return { providers, jobCount };
}

export default async function ServiceCityCategoryPage({
  params,
}: {
  params: Promise<{ city: string; category: string }>;
}) {
  const { city: citySlug, category: categorySlug } = await params;
  const city = getCityBySlug(citySlug);
  const service = getServiceBySlug(categorySlug);
  if (!city || !service) notFound();

  const { providers, jobCount } = await getPageData(city.name, service.category);

  const otherCities = ROMANIAN_CITIES.filter((c) => c.slug !== city.slug).slice(0, 6);
  const otherServices = SERVICE_TYPES.filter((s) => s.slug !== service.slug);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="dark:to-background bg-gradient-to-b from-indigo-50 to-white py-16 dark:from-indigo-950/20">
        <div className="container-custom">
          <nav className="text-muted-foreground mb-6 flex items-center gap-2 text-sm">
            <Link href="/" className="hover:text-primary">
              Acasă
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/servicii/${service.slug}`} className="hover:text-primary">
              {service.nameRo}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{city.name}</span>
          </nav>

          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            {service.nameRo} {city.name}
          </h1>
          <p className="text-muted-foreground mb-8 max-w-2xl text-lg">
            {service.descriptionRo} Găsește furnizori verificați de {service.nameRo.toLowerCase()}{' '}
            în {city.name}, {city.region}.
          </p>

          <div className="mb-8 grid grid-cols-2 gap-4 md:max-w-sm">
            <div className="dark:bg-card rounded-xl border bg-white p-4 text-center">
              <p className="text-primary text-2xl font-bold">{providers.length}</p>
              <p className="text-muted-foreground text-sm">Furnizori</p>
            </div>
            <div className="dark:bg-card rounded-xl border bg-white p-4 text-center">
              <p className="text-primary text-2xl font-bold">{jobCount}</p>
              <p className="text-muted-foreground text-sm">Anunțuri active</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href={`/providers?category=${service.category}&lat=${city.lat}&lng=${city.lng}&radius=30`}
              className="bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white transition"
            >
              <Search className="h-4 w-4" />
              Vezi toți furnizorii
            </Link>
            <Link
              href={`/jobs?category=${service.category}`}
              className="hover:bg-muted inline-flex items-center gap-2 rounded-lg border px-6 py-3 font-medium transition"
            >
              Vezi anunțuri
            </Link>
          </div>
        </div>
      </section>

      {/* Providers */}
      {providers.length > 0 && (
        <section className="container-custom py-12">
          <h2 className="mb-6 text-2xl font-bold">
            Furnizori de {service.nameRo.toLowerCase()} în {city.name}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <Link
                key={provider.id}
                href={`/profile/${provider.id}`}
                className="dark:bg-card group rounded-xl border bg-white p-5 transition hover:shadow-lg"
              >
                <div className="mb-3 flex items-start gap-4">
                  <div className="bg-muted flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold">
                    {provider.avatar ? (
                      <img
                        src={provider.avatar}
                        alt={provider.name}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      provider.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="group-hover:text-primary truncate font-semibold">
                        {provider.name}
                      </h3>
                      {provider.isVerified && <Shield className="text-primary h-4 w-4 shrink-0" />}
                    </div>
                    {provider.providerProfile?.headline && (
                      <p className="text-muted-foreground line-clamp-1 text-sm">
                        {provider.providerProfile.headline}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-1">
                      {provider.rating > 0 ? (
                        <>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{provider.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground text-xs">
                            ({provider.reviewCount})
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground text-xs">Furnizor nou</span>
                      )}
                    </div>
                  </div>
                </div>
                {provider.bio && (
                  <p className="text-muted-foreground line-clamp-2 text-sm">{provider.bio}</p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  {provider.providerProfile?.hourlyRate && (
                    <span className="text-primary font-semibold">
                      {Number(provider.providerProfile.hourlyRate)}{' '}
                      {provider.providerProfile.currency || 'RON'}/oră
                    </span>
                  )}
                  {provider.address && (
                    <span className="text-muted-foreground flex items-center gap-1 text-xs">
                      <MapPin className="h-3 w-3" />
                      {provider.address}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Other Cities */}
      <section className="bg-muted/30 py-12">
        <div className="container-custom">
          <h2 className="mb-6 text-2xl font-bold">{service.nameRo} în alte orașe</h2>
          <div className="flex flex-wrap gap-3">
            {otherCities.map((c) => (
              <Link
                key={c.slug}
                href={`/servicii/${c.slug}/${service.slug}`}
                className="hover:bg-muted dark:bg-card rounded-lg border bg-white px-4 py-2 text-sm font-medium transition"
              >
                {service.nameRo} {c.name}
              </Link>
            ))}
          </div>

          {/* Other Services */}
          {otherServices.length > 0 && (
            <>
              <h3 className="mb-4 mt-8 text-lg font-bold">Alte servicii în {city.name}</h3>
              <div className="flex flex-wrap gap-3">
                {otherServices.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/servicii/${city.slug}/${s.slug}`}
                    className="hover:bg-muted dark:bg-card rounded-lg border bg-white px-4 py-2 text-sm font-medium transition"
                  >
                    {s.nameRo} {city.name}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: `${service.nameRo} ${city.name}`,
            description: `Servicii de ${service.nameRo.toLowerCase()} în ${city.name}, ${city.region}`,
            provider: {
              '@type': 'Organization',
              name: 'JuniorHub',
              url: BASE_URL,
            },
            areaServed: {
              '@type': 'City',
              name: city.name,
              containedInPlace: {
                '@type': 'AdministrativeArea',
                name: city.region,
              },
            },
            serviceType: service.nameEn,
          }),
        }}
      />
    </div>
  );
}
