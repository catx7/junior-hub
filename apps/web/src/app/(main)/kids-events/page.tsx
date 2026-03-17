'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users, Clock, Plus, Search, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Breadcrumb } from '@/components/ui';

const categories = [
  'All',
  'Art & Crafts',
  'Sports',
  'Education',
  'Performing Arts',
  'Technology',
  'Outdoor Adventures',
];

interface KidsEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  ageRangeMin: number;
  ageRangeMax: number;
  date: string;
  time: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  image: string | null;
  organizer: {
    id: string;
    name: string;
    avatar: string | null;
    rating: number;
  };
  _count: {
    registrations: number;
  };
}

export default function KidsEventsPage() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categoryKeys: Record<string, string> = {
    All: 'kidsEvents.categoryAll',
    'Art & Crafts': 'kidsEvents.categoryArt',
    Sports: 'kidsEvents.categorySports',
    Education: 'kidsEvents.categoryEducation',
    'Performing Arts': 'kidsEvents.categoryPerforming',
    Technology: 'kidsEvents.categoryTech',
    'Outdoor Adventures': 'kidsEvents.categoryOutdoor',
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['kids-events', selectedCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/kids-events?${params}`);
      if (!res.ok) throw new Error('Failed to fetch events');
      return res.json();
    },
  });

  const allEvents: KidsEvent[] = data?.events || [];
  const events = isAuthenticated ? allEvents : allEvents.slice(0, 10);

  return (
    <div className="bg-muted/50 min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4">
        <Breadcrumb
          items={[{ label: 'Acasă', href: '/' }, { label: 'Evenimente pentru copii' }]}
          className="mb-6"
        />

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-foreground text-3xl font-bold">{t('kidsEvents.pageTitle')}</h1>
            <p className="text-muted-foreground mt-1">{t('kidsEvents.pageSubtitle')}</p>
          </div>
          {isAuthenticated && (
            <Link href="/kids-events/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('kidsEvents.createEvent')}
              </Button>
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('kidsEvents.searchPlaceholder')}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="flex-shrink-0"
                >
                  {t(categoryKeys[category] || category)}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-12 text-center">
            <p className="text-red-500">{t('kidsEvents.failedToLoad')}</p>
          </Card>
        )}

        {/* Events Grid */}
        {!isLoading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const spotsLeft =
                event.maxParticipants - (event._count?.registrations || event.currentParticipants);
              const fillPercentage =
                ((event._count?.registrations || event.currentParticipants) /
                  event.maxParticipants) *
                100;
              const price = typeof event.price === 'object' ? Number(event.price) : event.price;

              return (
                <Link
                  key={event.id}
                  href={
                    isAuthenticated
                      ? `/kids-events/${event.id}`
                      : '/register?message=Creează un cont pentru a vedea detalii și a-ți înscrie copilul'
                  }
                >
                  <Card className="overflow-hidden transition hover:shadow-lg">
                    <div className="bg-muted relative h-48">
                      {event.image ? (
                        <Image src={event.image} alt={event.title} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Calendar className="text-muted-foreground h-16 w-16" />
                        </div>
                      )}
                      <div className="absolute right-2 top-2">
                        <Badge className="bg-card text-foreground">{event.category}</Badge>
                      </div>
                      {price === 0 && (
                        <div className="absolute left-2 top-2">
                          <Badge className="bg-green-600">{t('kidsEvents.free')}</Badge>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="text-foreground mb-2 text-lg font-semibold">{event.title}</h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
                        {event.description}
                      </p>

                      <div className="text-muted-foreground space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(event.date).toLocaleDateString('ro-RO', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>
                            {t('kidsEvents.ages')} {event.ageRangeMin}-{event.ageRangeMax}{' '}
                            {t('kidsEvents.years')}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 border-t pt-4">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {event._count?.registrations || event.currentParticipants}/
                            {event.maxParticipants} {t('kidsEvents.participants')}
                          </span>
                          <span
                            className={`font-medium ${spotsLeft <= 5 ? 'text-red-600' : 'text-foreground'}`}
                          >
                            {spotsLeft} {t('kidsEvents.spotsLeft')}
                          </span>
                        </div>
                        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                          <div
                            className={`h-full transition-all ${
                              fillPercentage >= 80
                                ? 'bg-red-500'
                                : fillPercentage >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                            }`}
                            style={{ width: `${fillPercentage}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-primary text-2xl font-bold">
                          {price === 0 ? t('kidsEvents.free') : `${price} RON`}
                        </span>
                        <Button size="sm">{t('kidsEvents.viewDetails')}</Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Sign up prompt for guests */}
        {!isAuthenticated && events.length > 0 && (
          <div className="mt-8 rounded-xl border bg-gradient-to-r from-purple-50 to-pink-50 p-8 text-center">
            <h3 className="mb-2 text-lg font-semibold">{t('kidsEvents.wantToSeeMore')}</h3>
            <p className="text-muted-foreground mb-4 text-sm">{t('kidsEvents.signUpDesc')}</p>
            <Link href="/register?message=Creează un cont pentru a naviga evenimentele și a-ți înscrie copilul">
              <Button>{t('kidsEvents.signUpFree')}</Button>
            </Link>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && events.length === 0 && (
          <Card className="p-12 text-center">
            <Calendar className="text-muted-foreground/50 mx-auto mb-4 h-16 w-16" />
            <h3 className="text-foreground mb-2 text-lg font-semibold">
              {t('kidsEvents.noEventsFound')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || selectedCategory !== 'All'
                ? t('kidsEvents.noEventsAdjust')
                : t('kidsEvents.noEventsFirst')}
            </p>
            {isAuthenticated && (
              <Link href="/kids-events/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('kidsEvents.createEvent')}
                </Button>
              </Link>
            )}
          </Card>
        )}

        {/* Info Banner */}
        {isAuthenticated && (
          <Card className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-foreground mb-2 font-semibold">
                  {t('kidsEvents.organizeEvent')}
                </h3>
                <p className="text-muted-foreground text-sm">{t('kidsEvents.organizeEventDesc')}</p>
              </div>
              <Link href="/kids-events/create">
                <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('kidsEvents.createEvent')}
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
