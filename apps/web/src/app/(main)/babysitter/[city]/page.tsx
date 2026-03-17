import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Star, Shield, Search, ChevronRight } from 'lucide-react';
import { prisma } from '@localservices/database';
import { ROMANIAN_CITIES, getCityBySlug } from '@/lib/seo-data';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://juniorhub.ro';

export const revalidate = 60;

export async function generateStaticParams() {
  // Pre-render top 3 cities at build; rest generated on-demand via ISR
  return ROMANIAN_CITIES.slice(0, 3).map((city) => ({ city: city.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) return {};

  const title = `Babysitter ${city.name} - Bone de Încredere | JuniorHub`;
  const description = `Găsește babysittere și bone verificate în ${city.name}. Profile cu recenzii, experiență și tarife. Rezervă rapid o bonă de încredere în ${city.name}, ${city.region}.`;

  return {
    title,
    description,
    keywords: [
      `babysitter ${city.name.toLowerCase()}`,
      `bona ${city.name.toLowerCase()}`,
      `bone ${city.name.toLowerCase()}`,
      `ingrijire copii ${city.name.toLowerCase()}`,
      `supraveghere copii ${city.name.toLowerCase()}`,
      'babysitter',
      'bona',
      'ingrijire copii',
    ],
    alternates: {
      canonical: `${BASE_URL}/babysitter/${city.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/babysitter/${city.slug}`,
      siteName: 'JuniorHub',
      locale: 'ro_RO',
      type: 'website',
    },
  };
}

async function getCityStats(cityName: string) {
  const [providerCount, jobCount, avgRating] = await Promise.all([
    prisma.user.count({
      where: {
        role: 'PROVIDER',
        address: { contains: cityName, mode: 'insensitive' },
      },
    }),
    prisma.job.count({
      where: {
        category: 'BABYSITTING',
        location: { contains: cityName, mode: 'insensitive' },
        status: 'OPEN',
      },
    }),
    prisma.user.aggregate({
      where: {
        role: 'PROVIDER',
        address: { contains: cityName, mode: 'insensitive' },
        rating: { gt: 0 },
      },
      _avg: { rating: true },
    }),
  ]);

  return {
    providerCount,
    jobCount,
    avgRating: avgRating._avg.rating ? Math.round(avgRating._avg.rating * 10) / 10 : null,
  };
}

async function getTopProviders(cityName: string) {
  return prisma.user.findMany({
    where: {
      role: 'PROVIDER',
      address: { contains: cityName, mode: 'insensitive' },
      rating: { gt: 0 },
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      bio: true,
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
    take: 6,
  });
}

async function getRecentJobs(cityName: string) {
  return prisma.job.findMany({
    where: {
      category: 'BABYSITTING',
      location: { contains: cityName, mode: 'insensitive' },
      status: 'OPEN',
    },
    select: {
      id: true,
      title: true,
      location: true,
      budget: true,
      currency: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
}

export default async function BabysitterCityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) notFound();

  const [stats, topProviders, recentJobs] = await Promise.all([
    getCityStats(city.name),
    getTopProviders(city.name),
    getRecentJobs(city.name),
  ]);

  const nearbyCities = ROMANIAN_CITIES.filter((c) => c.slug !== city.slug).slice(0, 5);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="dark:to-background bg-gradient-to-b from-blue-50 to-white py-16 dark:from-blue-950/20">
        <div className="container-custom">
          {/* Breadcrumbs */}
          <nav className="text-muted-foreground mb-6 flex items-center gap-2 text-sm">
            <Link href="/" className="hover:text-primary">
              Acasă
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/providers" className="hover:text-primary">
              Furnizori
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Babysitter {city.name}</span>
          </nav>

          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            Babysitter {city.name} - Bone de Încredere
          </h1>
          <p className="text-muted-foreground mb-8 max-w-2xl text-lg">
            Găsește babysittere verificate și cu experiență în {city.name}, {city.region}. Compară
            profile, citește recenzii și rezervă rapid o bonă de încredere.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:max-w-lg">
            <div className="dark:bg-card rounded-xl border bg-white p-4 text-center">
              <p className="text-primary text-2xl font-bold">{stats.providerCount}</p>
              <p className="text-muted-foreground text-sm">Bone disponibile</p>
            </div>
            <div className="dark:bg-card rounded-xl border bg-white p-4 text-center">
              <p className="text-primary text-2xl font-bold">{stats.jobCount}</p>
              <p className="text-muted-foreground text-sm">Joburi active</p>
            </div>
            {stats.avgRating && (
              <div className="dark:bg-card rounded-xl border bg-white p-4 text-center">
                <p className="text-primary flex items-center justify-center gap-1 text-2xl font-bold">
                  {stats.avgRating}
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </p>
                <p className="text-muted-foreground text-sm">Rating mediu</p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={`/providers?category=BABYSITTING&lat=${city.lat}&lng=${city.lng}&radius=30`}
              className="bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white transition"
            >
              <Search className="h-4 w-4" />
              Caută babysittere în {city.name}
            </Link>
            <Link
              href="/jobs/new?category=BABYSITTING"
              className="hover:bg-muted inline-flex items-center gap-2 rounded-lg border px-6 py-3 font-medium transition"
            >
              Publică un anunț
            </Link>
          </div>
        </div>
      </section>

      {/* Top Providers */}
      {topProviders.length > 0 && (
        <section className="container-custom py-12">
          <h2 className="mb-6 text-2xl font-bold">Cele mai bune bone din {city.name}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topProviders.map((provider) => (
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
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{provider.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground text-xs">
                        ({provider.reviewCount} recenzii)
                      </span>
                    </div>
                  </div>
                </div>
                {provider.bio && (
                  <p className="text-muted-foreground line-clamp-2 text-sm">{provider.bio}</p>
                )}
                {provider.providerProfile?.hourlyRate && (
                  <p className="text-primary mt-2 font-semibold">
                    {Number(provider.providerProfile.hourlyRate)}{' '}
                    {provider.providerProfile.currency || 'RON'}/oră
                  </p>
                )}
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href={`/providers?category=BABYSITTING&lat=${city.lat}&lng=${city.lng}&radius=30`}
              className="text-primary hover:underline"
            >
              Vezi toate bonele din {city.name} →
            </Link>
          </div>
        </section>
      )}

      {/* Recent Jobs */}
      {recentJobs.length > 0 && (
        <section className="bg-muted/30 py-12">
          <div className="container-custom">
            <h2 className="mb-6 text-2xl font-bold">
              Anunțuri recente de babysitting în {city.name}
            </h2>
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="dark:bg-card flex items-center justify-between rounded-lg border bg-white p-4 transition hover:shadow-md"
                >
                  <div>
                    <h3 className="font-medium">{job.title}</h3>
                    <p className="text-muted-foreground flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </p>
                  </div>
                  {job.budget && (
                    <span className="text-primary font-semibold">
                      {Number(job.budget)} {job.currency}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="container-custom py-12">
        <h2 className="mb-8 text-center text-2xl font-bold">Cum funcționează</h2>
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold">
              1
            </div>
            <h3 className="mb-2 font-semibold">Caută</h3>
            <p className="text-muted-foreground text-sm">
              Navighează profilele bonelor din {city.name}. Filtrează după experiență, tarif și
              disponibilitate.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold">
              2
            </div>
            <h3 className="mb-2 font-semibold">Contactează</h3>
            <p className="text-muted-foreground text-sm">
              Trimite un mesaj bonelor care îți plac. Discută detaliile și stabilește o întâlnire.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold">
              3
            </div>
            <h3 className="mb-2 font-semibold">Rezervă</h3>
            <p className="text-muted-foreground text-sm">
              Rezervă bona aleasă. Citește recenziile altor părinți și bucură-te de liniște
              sufletească.
            </p>
          </div>
        </div>
      </section>

      {/* Nearby Cities */}
      <section className="bg-muted/30 py-12">
        <div className="container-custom">
          <h2 className="mb-6 text-2xl font-bold">Babysittere în alte orașe</h2>
          <div className="flex flex-wrap gap-3">
            {nearbyCities.map((c) => (
              <Link
                key={c.slug}
                href={`/babysitter/${c.slug}`}
                className="hover:bg-muted dark:bg-card rounded-lg border bg-white px-4 py-2 text-sm font-medium transition"
              >
                Babysitter {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: `Babysitting ${city.name}`,
            description: `Servicii de babysitting și bone de încredere în ${city.name}, ${city.region}`,
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
            serviceType: 'Babysitting',
          }),
        }}
      />
    </div>
  );
}
