'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users, Clock, Plus, Search, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

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
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-foreground text-3xl font-bold">Kids Events</h1>
            <p className="text-muted-foreground mt-1">
              Discover fun and educational events for children in your area
            </p>
          </div>
          {isAuthenticated && (
            <Link href="/kids-events/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
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
                placeholder="Search events..."
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
                  {category}
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
            <p className="text-red-500">Failed to load events. Please try again.</p>
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
                      : '/register?message=Create an account to view event details and register your child'
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
                          <Badge className="bg-green-600">FREE</Badge>
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
                            {new Date(event.date).toLocaleDateString('en-US', {
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
                            Ages {event.ageRangeMin}-{event.ageRangeMax} years
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 border-t pt-4">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {event._count?.registrations || event.currentParticipants}/
                            {event.maxParticipants} participants
                          </span>
                          <span
                            className={`font-medium ${spotsLeft <= 5 ? 'text-red-600' : 'text-foreground'}`}
                          >
                            {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
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
                          {price === 0 ? 'FREE' : `$${price}`}
                        </span>
                        <Button size="sm">View Details</Button>
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
            <h3 className="mb-2 text-lg font-semibold">Want to see more events?</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Create a free account to browse all events and register your children.
            </p>
            <Link href="/register?message=Create an account to browse all events and register your child">
              <Button>Sign Up Free</Button>
            </Link>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && events.length === 0 && (
          <Card className="p-12 text-center">
            <Calendar className="text-muted-foreground/50 mx-auto mb-4 h-16 w-16" />
            <h3 className="text-foreground mb-2 text-lg font-semibold">No events found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your search or filters'
                : 'Be the first to create an event for kids in your area!'}
            </p>
            {isAuthenticated && (
              <Link href="/kids-events/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
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
                <h3 className="text-foreground mb-2 font-semibold">Want to organize an event?</h3>
                <p className="text-muted-foreground text-sm">
                  Share your passion and create memorable experiences for children in your community
                </p>
              </div>
              <Link href="/kids-events/create">
                <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
