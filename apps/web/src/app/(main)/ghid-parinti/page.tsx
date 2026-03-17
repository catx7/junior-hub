import Link from 'next/link';
import type { Metadata } from 'next';
import { Card, CardContent, Badge } from '@/components/ui';
import { BookOpen, Clock, Calendar, ArrowRight } from 'lucide-react';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Ghid pentru Părinți | JuniorHub',
  description:
    'Sfaturi practice pentru părinți: cum să alegi o bonă de încredere, siguranța copilului, activități educative și multe altele. Ghid complet pentru familii din România.',
  openGraph: {
    title: 'Ghid pentru Părinți | JuniorHub',
    description:
      'Sfaturi practice pentru părinți: cum să alegi o bonă de încredere, siguranța copilului, activități educative și multe altele.',
    type: 'website',
    url: 'https://juniorhub.ro/ghid-parinti',
  },
};

interface Guide {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categoryColor: 'default' | 'secondary' | 'destructive' | 'outline';
  readTime: string;
  date: string;
}

const guides: Guide[] = [
  {
    slug: 'cum-sa-alegi-o-bona-de-incredere',
    title: 'Cum să alegi o bonă de încredere',
    excerpt:
      'Ghid complet pentru părinți care caută o bonă potrivită. Află ce întrebări să pui la interviu, ce referințe să verifici și cum să te asiguri că copilul tău este pe mâini bune.',
    category: 'Babysitting',
    categoryColor: 'default',
    readTime: '8 min',
    date: '2026-03-10',
  },
  {
    slug: 'siguranta-copilului-acasa',
    title: 'Siguranța copilului acasă',
    excerpt:
      'Sfaturi esențiale pentru a transforma casa într-un mediu sigur pentru copii. De la protecția prizelor la depozitarea corectă a substanțelor periculoase.',
    category: 'Siguranță',
    categoryColor: 'destructive',
    readTime: '6 min',
    date: '2026-03-05',
  },
  {
    slug: 'activitati-educative-pentru-copii',
    title: 'Activități educative pentru copii',
    excerpt:
      'Idei creative de activități care combină distracția cu învățarea. Activități potrivite pe grupe de vârstă, de la 1 an la 10 ani, pentru dezvoltarea armonioasă a copilului.',
    category: 'Educație',
    categoryColor: 'secondary',
    readTime: '7 min',
    date: '2026-02-28',
  },
  {
    slug: 'pregatirea-copilului-pentru-bona-noua',
    title: 'Pregătirea copilului pentru bonă nouă',
    excerpt:
      'Cum să faci tranziția ușoară atunci când introduci o bonă nouă în viața copilului. Sfaturi practice pentru a reduce anxietatea de separare și a construi încredere.',
    category: 'Babysitting',
    categoryColor: 'default',
    readTime: '5 min',
    date: '2026-02-20',
  },
  {
    slug: 'sfaturi-pentru-parinti-care-lucreaza',
    title: 'Sfaturi pentru părinți care lucrează',
    excerpt:
      'Cum să menții echilibrul între carieră și familie. Strategii testate de gestionare a timpului, organizarea rutinei zilnice și modalități de a rămâne conectat cu copilul.',
    category: 'Educație',
    categoryColor: 'secondary',
    readTime: '6 min',
    date: '2026-02-15',
  },
  {
    slug: 'alegerea-serviciilor-de-curatenie',
    title: 'Alegerea serviciilor de curățenie',
    excerpt:
      'Cum să găsești servicii de curățenie fiabile și sigure pentru familia ta. Ce să cauți, ce produse sunt sigure pentru copii și cum să evaluezi calitatea serviciilor.',
    category: 'Curățenie',
    categoryColor: 'outline',
    readTime: '5 min',
    date: '2026-02-10',
  },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function ParentGuidesPage() {
  return (
    <div className="bg-muted/50 min-h-screen py-12">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="bg-primary/10 text-primary mx-auto mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
            <BookOpen className="h-4 w-4" />
            <span>Resurse pentru părinți</span>
          </div>
          <h1 className="text-foreground mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Ghid pentru Părinți
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Sfaturi practice și informații utile pentru părinții din România. De la alegerea unei
            bone de încredere până la activități educative pentru copii.
          </p>
        </header>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <Link key={guide.slug} href={`/ghid-parinti/${guide.slug}`} className="group">
              <Card className="h-full transition-all duration-200 hover:shadow-lg group-hover:-translate-y-1">
                <CardContent className="flex h-full flex-col p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <Badge variant={guide.categoryColor}>{guide.category}</Badge>
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      <span>{guide.readTime} citire</span>
                    </div>
                  </div>

                  <h2 className="text-foreground group-hover:text-primary mb-2 text-xl font-semibold transition-colors">
                    {guide.title}
                  </h2>

                  <p className="text-muted-foreground mb-4 flex-1 text-sm leading-relaxed">
                    {guide.excerpt}
                  </p>

                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Calendar className="h-3 w-3" />
                      <time dateTime={guide.date}>{formatDate(guide.date)}</time>
                    </div>
                    <span className="text-primary flex items-center gap-1 text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100">
                      Citește
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <section className="mt-16 text-center">
          <Card className="bg-primary/5 border-primary/20 p-8">
            <h2 className="text-foreground mb-2 text-2xl font-bold">
              Cauți servicii de încredere?
            </h2>
            <p className="text-muted-foreground mb-6 text-lg">
              Pe JuniorHub găsești bone verificate, servicii de curățenie și multe altele, toate
              evaluate de alți părinți din comunitate.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/jobs"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-lg px-6 py-3 font-medium transition-colors"
              >
                Navighează servicii
              </Link>
              <Link
                href="/register"
                className="text-primary hover:bg-primary/10 inline-flex items-center rounded-lg border px-6 py-3 font-medium transition-colors"
              >
                Creează cont gratuit
              </Link>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
