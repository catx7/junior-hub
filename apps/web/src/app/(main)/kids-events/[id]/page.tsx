'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Heart,
  Share2,
  Trash2,
  Edit,
  Star,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { getIdToken } from '@/lib/firebase';
import { toast } from 'sonner';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const eventId = params.id as string;

  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['kids-event', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/kids-events/${eventId}`);
      if (!res.ok) throw new Error('Failed to fetch event');
      return res.json();
    },
    enabled: !!eventId,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = await getIdToken();
      const res = await fetch(`/api/kids-events/${eventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete event');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Event deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['kids-events'] });
      router.push('/kids-events');
    },
    onError: () => {
      toast.error('Failed to delete event');
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { childName: string; childAge: number }) => {
      const token = await getIdToken();
      const res = await fetch(`/api/kids-events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to register');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Successfully registered for event!');
      queryClient.invalidateQueries({ queryKey: ['kids-event', eventId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to register');
    },
  });

  const unregisterMutation = useMutation({
    mutationFn: async () => {
      const token = await getIdToken();
      const res = await fetch(`/api/kids-events/${eventId}/register`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to cancel registration');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Registration cancelled');
      queryClient.invalidateQueries({ queryKey: ['kids-event', eventId] });
    },
    onError: () => {
      toast.error('Failed to cancel registration');
    },
  });

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName || !childAge) {
      toast.error('Please fill in all fields');
      return;
    }
    registerMutation.mutate({ childName, childAge: parseInt(childAge) });
    setShowRegisterModal(false);
    setChildName('');
    setChildAge('');
  };

  const handleStartConversation = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      const token = await getIdToken();
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ participantId: event.organizer?.id }),
      });
      if (!res.ok) throw new Error('Failed to create conversation');
      const conversation = await res.json();
      router.push(`/messages/${conversation.id}`);
    } catch {
      toast.error('Failed to start conversation');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-muted/50 min-h-screen">
        <div className="bg-muted h-[300px]">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Skeleton className="mb-4 h-8 w-3/4" />
          <Skeleton className="mb-2 h-6 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="bg-muted/50 flex min-h-screen items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="mb-2 text-xl font-bold">Event not found</h2>
          <p className="text-muted-foreground mb-6">
            This event doesn't exist or has been removed.
          </p>
          <Link href="/kids-events">
            <Button>Browse Events</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isOwner = user?.id === event.organizerId;
  const isRegistered = event.registrations?.some((r: any) => r.userId === user?.id);
  const isFull = event.currentParticipants >= event.maxParticipants;
  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();
  const isFree = !event.price || event.price === 0;

  return (
    <div className="bg-muted/50 min-h-screen">
      {/* Header Image */}
      <div className="relative h-[300px] bg-gradient-to-r from-purple-600 to-pink-600">
        {event.image && (
          <Image src={event.image} alt={event.title} fill className="object-cover opacity-50" />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <Badge className="mb-4 bg-white/20 text-white">{event.category}</Badge>
            <h1 className="text-4xl font-bold">{event.title}</h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute right-4 top-4 flex gap-2">
          {isOwner && (
            <>
              <Link href={`/kids-events/${eventId}/edit`}>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg">
                  <Edit className="h-5 w-5" />
                </button>
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="hover:text-destructive flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </>
          )}
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg">
            <Heart className="h-5 w-5" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Event Details */}
            <Card className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Date</p>
                    <p className="font-semibold">
                      {eventDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-full p-3">
                    <Clock className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Time</p>
                    <p className="font-semibold">{event.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                    <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Location</p>
                    <p className="font-semibold">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/20">
                    <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Capacity</p>
                    <p className="font-semibold">
                      {event.currentParticipants || 0} / {event.maxParticipants} registered
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Age Range */}
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Ages {event.ageRangeMin} - {event.ageRangeMax}
              </Badge>
              {isFree ? (
                <Badge className="bg-green-600">Free</Badge>
              ) : (
                <Badge className="bg-primary">${Number(event.price).toFixed(2)}</Badge>
              )}
            </div>

            {/* Description */}
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold">About this Event</h2>
              <p className="text-muted-foreground whitespace-pre-line">{event.description}</p>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organizer Card */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Organizer</h3>
              <Link
                href={`/profile/${event.organizer?.id}`}
                className="mb-4 flex items-center gap-4"
              >
                <Avatar className="h-16 w-16">
                  {event.organizer?.avatar ? (
                    <Image
                      src={event.organizer.avatar}
                      alt={event.organizer.name || 'Organizer'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="bg-primary flex h-full w-full items-center justify-center text-xl font-bold text-white">
                      {event.organizer?.name?.charAt(0) || 'O'}
                    </div>
                  )}
                </Avatar>
                <div>
                  <p className="font-semibold">{event.organizer?.name || 'Unknown'}</p>
                  <div className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{event.organizer?.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>
              </Link>

              {!isOwner && !isPast && (
                <div className="space-y-3">
                  {isRegistered ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => unregisterMutation.mutate()}
                      disabled={unregisterMutation.isPending}
                    >
                      {unregisterMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Cancel Registration
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => setShowRegisterModal(true)}
                      disabled={isFull}
                    >
                      {isFull ? 'Event Full' : 'Register Now'}
                    </Button>
                  )}
                  <Button variant="outline" className="w-full" onClick={handleStartConversation}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Organizer
                  </Button>
                </div>
              )}

              {isPast && (
                <Badge variant="outline" className="w-full justify-center py-2">
                  Event has ended
                </Badge>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="mb-4 text-xl font-bold">Register for Event</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Child's Name</label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="focus:ring-primary w-full rounded-lg border px-4 py-3 focus:border-transparent focus:ring-2"
                  placeholder="Enter child's name"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Child's Age</label>
                <input
                  type="number"
                  min={event.ageRangeMin}
                  max={event.ageRangeMax}
                  value={childAge}
                  onChange={(e) => setChildAge(e.target.value)}
                  className="focus:ring-primary w-full rounded-lg border px-4 py-3 focus:border-transparent focus:ring-2"
                  placeholder={`${event.ageRangeMin} - ${event.ageRangeMax} years`}
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowRegisterModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? 'Registering...' : 'Register'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-destructive mb-4 text-xl font-bold">Delete Event</h2>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this event? All registrations will be cancelled.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
