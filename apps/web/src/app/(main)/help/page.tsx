'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, HelpCircle, MessageCircle, Shield, CreditCard, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { helpArticles, faqItems, getArticlesByCategory } from './articles';

const categoryIcons: Record<string, typeof Users> = {
  'Getting Started': Users,
  'Safety & Verification': Shield,
  'Payments & Pricing': CreditCard,
  'Platform Features': HelpCircle,
};

const categoryNames = [
  'Getting Started',
  'Safety & Verification',
  'Payments & Pricing',
  'Platform Features',
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = searchQuery.trim()
    ? helpArticles.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  return (
    <div className="bg-muted/50 min-h-screen py-12">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-foreground mb-4 text-4xl font-bold">Help Center</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Find answers to common questions and learn how to use JuniorHub
          </p>

          {/* Search */}
          <div className="mx-auto max-w-2xl">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
              <Input
                placeholder="Search for help..."
                className="h-14 pl-12 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Search Results */}
        {filteredArticles && (
          <div className="mb-12">
            <h2 className="text-foreground mb-4 text-xl font-semibold">
              {filteredArticles.length} result{filteredArticles.length !== 1 ? 's' : ''} for &quot;
              {searchQuery}&quot;
            </h2>
            {filteredArticles.length > 0 ? (
              <div className="space-y-2">
                {filteredArticles.map((article) => (
                  <Link key={article.slug} href={`/help/${article.slug}`}>
                    <Card className="hover:bg-muted/50 p-4 transition">
                      <p className="text-foreground font-medium">{article.title}</p>
                      <p className="text-muted-foreground mt-1 text-sm">{article.category}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No articles found. Try different search terms.
              </p>
            )}
          </div>
        )}

        {/* Categories */}
        {!filteredArticles && (
          <div className="mb-16 grid gap-6 md:grid-cols-2">
            {categoryNames.map((categoryName) => {
              const Icon = categoryIcons[categoryName] || HelpCircle;
              const articles = getArticlesByCategory(categoryName);
              return (
                <Card key={categoryName} className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                      <Icon className="text-primary h-5 w-5" />
                    </div>
                    <h3 className="text-foreground text-xl font-semibold">{categoryName}</h3>
                  </div>
                  <ul className="space-y-2">
                    {articles.map((article) => (
                      <li key={article.slug}>
                        <Link
                          href={`/help/${article.slug}`}
                          className="text-primary text-left text-sm hover:underline"
                        >
                          {article.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        )}

        {/* Popular Questions */}
        {!filteredArticles && (
          <div className="mb-16">
            <h2 className="text-foreground mb-8 text-center text-3xl font-bold">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <Card key={index} className="p-6">
                  <h3 className="text-foreground mb-3 text-lg font-semibold">{item.question}</h3>
                  <p className="text-muted-foreground">{item.answer}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Contact Support */}
        <Card className="from-primary to-primary/70 bg-gradient-to-r p-8 text-center text-white">
          <MessageCircle className="mx-auto mb-4 h-12 w-12" />
          <h2 className="mb-3 text-2xl font-bold">Still need help?</h2>
          <p className="mb-6 opacity-90">Our support team is ready to assist you</p>
          <Link href="/contact">
            <Button variant="secondary" size="lg">
              Contact Support
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
