import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getArticleBySlug, getArticlesByCategory, helpArticles } from '../articles';

export function generateStaticParams() {
  return helpArticles.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);
  if (!article) return { title: 'Article Not Found' };
  return {
    title: `${article.title} - Help Center | JuniorHub`,
    description: article.content.slice(0, 160),
  };
}

export default function HelpArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = getArticlesByCategory(article.category).filter(
    (a) => a.slug !== article.slug
  );

  // Convert markdown-ish content to HTML
  const htmlContent = article.content
    .split('\n')
    .map((line) => {
      if (line.startsWith('### '))
        return `<h3 class="mt-6 mb-3 text-lg font-semibold text-foreground">${line.slice(4)}</h3>`;
      if (line.startsWith('## '))
        return `<h2 class="mt-8 mb-4 text-2xl font-bold text-foreground">${line.slice(3)}</h2>`;
      if (line.match(/^\d+\.\s\*\*/)) {
        const content = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return `<li class="ml-4 mb-1 list-decimal text-muted-foreground">${content.replace(/^\d+\.\s/, '')}</li>`;
      }
      if (line.startsWith('- **')) {
        const content = line
          .slice(2)
          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>');
        return `<li class="ml-4 mb-1 list-disc text-muted-foreground">${content}</li>`;
      }
      if (line.startsWith('- '))
        return `<li class="ml-4 mb-1 list-disc text-muted-foreground">${line.slice(2)}</li>`;
      if (line.match(/^\d+\.\s/))
        return `<li class="ml-4 mb-1 list-decimal text-muted-foreground">${line.replace(/^\d+\.\s/, '')}</li>`;
      if (line.trim() === '') return '<div class="h-2"></div>';
      // Handle inline markdown
      let processed = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" class="text-primary hover:underline">$1</a>'
        );
      return `<p class="mb-2 text-muted-foreground leading-relaxed">${processed}</p>`;
    })
    .join('\n');

  return (
    <div className="bg-muted/50 min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4">
        {/* Breadcrumb */}
        <nav className="text-muted-foreground mb-8 flex items-center gap-2 text-sm">
          <Link href="/help" className="hover:text-foreground">
            Help Center
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>{article.category}</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{article.title}</span>
        </nav>

        {/* Back link */}
        <Link
          href="/help"
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center text-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Help Center
        </Link>

        {/* Article */}
        <Card className="mb-8 p-8">
          <div className="border-border mb-6 border-b pb-6">
            <span className="bg-primary/10 text-primary mb-2 inline-block rounded-full px-3 py-1 text-xs font-medium">
              {article.category}
            </span>
            <h1 className="text-foreground text-3xl font-bold">{article.title}</h1>
          </div>
          <div className="article-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </Card>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div>
            <h2 className="text-foreground mb-4 text-xl font-semibold">Related Articles</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedArticles.map((related) => (
                <Link key={related.slug} href={`/help/${related.slug}`}>
                  <Card className="hover:bg-muted/50 p-4 transition">
                    <p className="text-foreground font-medium">{related.title}</p>
                    <p className="text-muted-foreground mt-1 text-sm">{related.category}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
