import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Search } from 'lucide-react';
import { prisma } from '@localservices/database';
import { ROMANIAN_CITIES, SERVICE_TYPES, getCityBySlug, getServiceBySlug } from '@/lib/seo-data';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://juniorhub.ro';

export const revalidate = 60;

// Generate params for category slugs + top cities; rest generated on-demand via ISR
export async function generateStaticParams() {
  return [
    ...SERVICE_TYPES.map((service) => ({ city: service.slug })),
    ...ROMANIAN_CITIES.slice(0, 3).map((c) => ({ city: c.slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: slug } = await params;

  // Check if it's a service category slug
  const service = getServiceBySlug(slug);
  if (service) {
    const title = `${service.nameRo} - Servicii de ${service.nameRo} în România | JuniorHub`;
    const description = `${service.descriptionRo} Compară furnizori verificați din toată România. Tarife, recenzii și rezervări online.`;
    return {
      title,
      description,
      keywords: [...service.keywords, 'romania', 'furnizori verificati'],
      alternates: { canonical: `${BASE_URL}/servicii/${service.slug}` },
      openGraph: {
        title,
        description,
        url: `${BASE_URL}/servicii/${service.slug}`,
        siteName: 'JuniorHub',
        locale: 'ro_RO',
        type: 'website',
      },
    };
  }

  // Check if it's a city slug
  const city = getCityBySlug(slug);
  if (city) {
    const title = `Servicii în ${city.name} | JuniorHub`;
    const description = `Găsește furnizori verificați de servicii în ${city.name}, ${city.region}. Babysitting, curățenie și multe altele.`;
    return {
      title,
      description,
      alternates: { canonical: `${BASE_URL}/servicii/${city.slug}` },
      openGraph: {
        title,
        description,
        url: `${BASE_URL}/servicii/${city.slug}`,
        siteName: 'JuniorHub',
        locale: 'ro_RO',
        type: 'website',
      },
    };
  }

  return {};
}

async function getCategoryStats(category: string) {
  const [providerCount, jobCount] = await Promise.all([
    prisma.user.count({
      where: {
        role: 'PROVIDER',
        jobsPosted: {
          some: {
            category: category as any,
            jobType: 'SERVICE_OFFERING',
          },
        },
      },
    }),
    prisma.job.count({
      where: {
        category: category as any,
        status: 'OPEN',
      },
    }),
  ]);
  return { providerCount, jobCount };
}

async function getCityCounts(category: string) {
  const results = await Promise.all(
    ROMANIAN_CITIES.slice(0, 10).map(async (city) => {
      const count = await prisma.job.count({
        where: {
          category: category as any,
          location: { contains: city.name, mode: 'insensitive' },
          status: 'OPEN',
        },
      });
      return { ...city, jobCount: count };
    })
  );
  return results;
}

export default async function ServiceSlugPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params;

  // Try as service category first
  const service = getServiceBySlug(slug);
  if (service) {
    const [stats, cityCounts] = await Promise.all([
      getCategoryStats(service.category),
      getCityCounts(service.category),
    ]);

    return (
      <div className="min-h-screen">
        {/* Hero */}
        <section className="dark:to-background bg-gradient-to-b from-purple-50 to-white py-16 dark:from-purple-950/20">
          <div className="container-custom">
            <nav className="text-muted-foreground mb-6 flex items-center gap-2 text-sm">
              <Link href="/" className="hover:text-primary">
                Acasă
              </Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/providers" className="hover:text-primary">
                Servicii
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">{service.nameRo}</span>
            </nav>

            <h1 className="mb-4 text-4xl font-bold tracking-tight">
              Servicii de {service.nameRo} în România
            </h1>
            <p className="text-muted-foreground mb-8 max-w-2xl text-lg">
              {service.descriptionRo} Compară furnizori verificați, citește recenzii și rezervă
              online.
            </p>

            <div className="mb-8 grid grid-cols-2 gap-4 md:max-w-sm">
              <div className="dark:bg-card rounded-xl border bg-white p-4 text-center">
                <p className="text-primary text-2xl font-bold">{stats.providerCount}</p>
                <p className="text-muted-foreground text-sm">Furnizori</p>
              </div>
              <div className="dark:bg-card rounded-xl border bg-white p-4 text-center">
                <p className="text-primary text-2xl font-bold">{stats.jobCount}</p>
                <p className="text-muted-foreground text-sm">Anunțuri active</p>
              </div>
            </div>

            <Link
              href={`/providers?category=${service.category}`}
              className="bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white transition"
            >
              <Search className="h-4 w-4" />
              Caută furnizori de {service.nameRo.toLowerCase()}
            </Link>
          </div>
        </section>

        {/* Cities */}
        <section className="container-custom py-12">
          <h2 className="mb-6 text-2xl font-bold">{service.nameRo} pe orașe</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cityCounts.map((city) => (
              <Link
                key={city.slug}
                href={`/servicii/${city.slug}/${service.slug}`}
                className="dark:bg-card group flex items-center justify-between rounded-lg border bg-white p-4 transition hover:shadow-md"
              >
                <div>
                  <h3 className="group-hover:text-primary font-semibold">{city.name}</h3>
                  <p className="text-muted-foreground text-sm">{city.region}</p>
                </div>
                <div className="text-right">
                  <p className="text-primary font-semibold">{city.jobCount}</p>
                  <p className="text-muted-foreground text-xs">anunțuri</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* SEO Content */}
        <section className="bg-muted/30 py-12">
          <div className="container-custom prose prose-gray dark:prose-invert max-w-3xl">
            <h2>De ce să alegi JuniorHub pentru {service.nameRo.toLowerCase()}?</h2>
            <ul>
              <li>
                <strong>Furnizori verificați</strong> - Toți furnizorii trec printr-un proces de
                verificare a identității și a cazierului judiciar.
              </li>
              <li>
                <strong>Recenzii reale</strong> - Citește recenzii de la alți clienți care au
                folosit serviciile furnizorilor.
              </li>
              <li>
                <strong>Tarife transparente</strong> - Compară tarifele furnizorilor și alege cel
                mai bun raport calitate-preț.
              </li>
              <li>
                <strong>Rezervare rapidă</strong> - Contactează furnizorul direct și stabilește
                detaliile rapid.
              </li>
            </ul>
          </div>
        </section>

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Service',
              name: service.nameRo,
              description: service.descriptionRo,
              provider: {
                '@type': 'Organization',
                name: 'JuniorHub',
                url: BASE_URL,
              },
              areaServed: {
                '@type': 'Country',
                name: 'Romania',
              },
              serviceType: service.nameEn,
            }),
          }}
        />
      </div>
    );
  }

  // Try as city slug — show all services in that city
  const city = getCityBySlug(slug);
  if (!city) notFound();

  return (
    <div className="min-h-screen">
      <section className="dark:to-background bg-gradient-to-b from-blue-50 to-white py-16 dark:from-blue-950/20">
        <div className="container-custom">
          <nav className="text-muted-foreground mb-6 flex items-center gap-2 text-sm">
            <Link href="/" className="hover:text-primary">
              Acasă
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Servicii în {city.name}</span>
          </nav>

          <h1 className="mb-4 text-4xl font-bold tracking-tight">Servicii în {city.name}</h1>
          <p className="text-muted-foreground mb-8 max-w-2xl text-lg">
            Găsește furnizori verificați de servicii în {city.name}, {city.region}.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICE_TYPES.map((s) => (
              <Link
                key={s.slug}
                href={`/servicii/${city.slug}/${s.slug}`}
                className="dark:bg-card group rounded-xl border bg-white p-6 transition hover:shadow-md"
              >
                <h2 className="group-hover:text-primary mb-2 text-xl font-bold">{s.nameRo}</h2>
                <p className="text-muted-foreground text-sm">{s.descriptionRo}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
