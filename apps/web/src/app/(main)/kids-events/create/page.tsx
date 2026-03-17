'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users, Clock, DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocationPicker } from '@/components/ui/location-picker';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { getIdToken } from '@/lib/firebase';
import { toast } from 'sonner';

const categories = [
  'Art & Crafts',
  'Sports',
  'Education',
  'Performing Arts',
  'Technology',
  'Outdoor Adventures',
  'Music',
  'Science',
  'Cooking',
  'Other',
];

export default function CreateKidsEventPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Art & Crafts',
    ageRangeMin: 5,
    ageRangeMax: 12,
    date: '',
    startHour: '10',
    startMinute: '00',
    endHour: '12',
    endMinute: '00',
    location: '',
    latitude: 0,
    longitude: 0,
    maxParticipants: 20,
    price: 0,
    image: '',
  });

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error(t('errors.loginRequired'));
      router.push('/login');
      return;
    }

    if (formData.ageRangeMin > formData.ageRangeMax) {
      toast.error(t('errors.minAgeGreaterThanMax'));
      return;
    }

    setIsLoading(true);

    try {
      const token = await getIdToken();
      if (!token) {
        toast.error(t('errors.loginRequired'));
        router.push('/login');
        return;
      }

      const time = `${formData.startHour}:${formData.startMinute} - ${formData.endHour}:${formData.endMinute}`;
      const { startHour, startMinute, endHour, endMinute, image, ...rest } = formData;

      const response = await fetch('/api/kids-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...rest,
          time,
          image: image.trim() || undefined,
          date: new Date(formData.date).toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create event');
      }

      const event = await response.json();
      toast.success(t('success.eventCreated'));
      router.push(`/kids-events/${event.id}`);
    } catch (error: any) {
      console.error('Create event error:', error);
      toast.error(error.message || t('errors.failedToCreate'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-muted/50 min-h-screen py-8">
        <div className="mx-auto max-w-2xl px-4">
          <Card className="p-12 text-center">
            <h2 className="mb-4 text-xl font-semibold">Sign in Required</h2>
            <p className="text-muted-foreground mb-6">
              You need to be signed in to create an event.
            </p>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/50 min-h-screen py-8">
      <div className="mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/kids-events"
            className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
          <h1 className="text-foreground text-3xl font-bold">Create Kids Event</h1>
          <p className="text-muted-foreground mt-1">
            Share your passion and create memorable experiences for children
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Event Details</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Kids Art Workshop - Painting & Crafts"
                  required
                  minLength={5}
                  maxLength={200}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your event, what kids will learn, and what to bring..."
                  required
                  minLength={20}
                  maxLength={2000}
                  rows={4}
                  className="border-border focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="border-border focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="image">Event Image URL (optional)</Label>
                <Input
                  id="image"
                  name="image"
                  type="text"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </Card>

          {/* Age Range */}
          <Card className="p-6">
            <h2 className="mb-4 flex items-center text-lg font-semibold">
              <Users className="mr-2 h-5 w-5" />
              Age Range
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ageRangeMin">Minimum Age</Label>
                <Input
                  id="ageRangeMin"
                  name="ageRangeMin"
                  type="number"
                  min={0}
                  max={18}
                  value={formData.ageRangeMin}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="ageRangeMax">Maximum Age</Label>
                <Input
                  id="ageRangeMax"
                  name="ageRangeMax"
                  type="number"
                  min={0}
                  max={18}
                  value={formData.ageRangeMax}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </Card>

          {/* Date & Time */}
          <Card className="p-6">
            <h2 className="mb-4 flex items-center text-lg font-semibold">
              <Calendar className="mr-2 h-5 w-5" />
              Date & Time
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <div className="flex gap-2">
                    <select
                      name="startHour"
                      value={formData.startHour}
                      onChange={handleChange}
                      className="border-border focus:border-primary focus:ring-primary flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                    >
                      {hours.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                    <span className="text-muted-foreground flex items-center">:</span>
                    <select
                      name="startMinute"
                      value={formData.startMinute}
                      onChange={handleChange}
                      className="border-border focus:border-primary focus:ring-primary flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                    >
                      {minutes.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <Label>End Time</Label>
                  <div className="flex gap-2">
                    <select
                      name="endHour"
                      value={formData.endHour}
                      onChange={handleChange}
                      className="border-border focus:border-primary focus:ring-primary flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                    >
                      {hours.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                    <span className="text-muted-foreground flex items-center">:</span>
                    <select
                      name="endMinute"
                      value={formData.endMinute}
                      onChange={handleChange}
                      className="border-border focus:border-primary focus:ring-primary flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                    >
                      {minutes.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Location */}
          <Card className="p-6">
            <h2 className="mb-4 flex items-center text-lg font-semibold">
              <MapPin className="mr-2 h-5 w-5" />
              Location
            </h2>
            <div>
              <Label htmlFor="location">Event Location</Label>
              <LocationPicker
                value={formData.location}
                onChange={(address) => setFormData((prev) => ({ ...prev, location: address }))}
                onCoordinatesChange={(lat, lng) =>
                  setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }))
                }
                placeholder="Event location"
              />
            </div>
          </Card>

          {/* Capacity & Price */}
          <Card className="p-6">
            <h2 className="mb-4 flex items-center text-lg font-semibold">
              <DollarSign className="mr-2 h-5 w-5" />
              Capacity & Price
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  name="maxParticipants"
                  type="number"
                  min={1}
                  max={1000}
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Price ($) - 0 for free</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min={0}
                  max={10000}
                  step={0.01}
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Event'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
