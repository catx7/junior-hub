'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  MapPin,
  Calendar,
  Clock,
  Star,
  MessageSquare,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  User,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { SERVICE_CATEGORIES } from '@localservices/shared';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data - replace with actual API call
  const job = {
    id: params.id,
    title: 'Babysitter needed for 2 kids this weekend',
    description: `Looking for an experienced babysitter for my 2 children (ages 4 and 7) this Saturday evening from 6 PM to 11 PM.

Requirements:
- Experience with young children
- CPR certified preferred
- Non-smoker
- References available

The kids are well-behaved and enjoy playing board games and watching movies. Light snacks will be provided.

Please message me with your experience and availability.`,
    budget: 75,
    category: 'BABYSITTING',
    location: 'Manhattan, NY',
    scheduledAt: 'Saturday, Jan 20, 6:00 PM',
    status: 'OPEN',
    images: [
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800',
    ],
    poster: {
      id: 'u1',
      name: 'John Smith',
      avatar: null,
      rating: 4.9,
      reviewCount: 15,
      memberSince: 'Jan 2023',
    },
    createdAt: '2 hours ago',
    offersCount: 3,
  };

  const categoryInfo = SERVICE_CATEGORIES[job.category as keyof typeof SERVICE_CATEGORIES];

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerPrice || parseFloat(offerPrice) <= 0) {
      alert('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowOfferModal(false);
      setOfferPrice('');
      setOfferMessage('');
      alert('Your offer has been submitted!');
    } catch (error) {
      alert('Failed to submit offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % job.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + job.images.length) % job.images.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="relative h-[400px] bg-gray-200">
        <Image
          src={job.images[currentImageIndex]}
          alt={job.title}
          fill
          className="object-cover"
        />

        {/* Navigation Arrows */}
        {job.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-white transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-white transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {job.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {job.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-2 h-2 rounded-full transition ${
                  idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-white transition"
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
            />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-white transition">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge
                  style={{ backgroundColor: `${categoryInfo?.color}20`, color: categoryInfo?.color }}
                >
                  {job.category === 'BABYSITTING' ? 'Babysitting' :
                   job.category === 'HOUSE_CLEANING' ? 'Cleaning' : 'Food'}
                </Badge>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Open
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-3xl font-bold text-primary">${job.budget}</p>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{job.location}</span>
              </div>
              {job.scheduledAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{job.scheduledAt}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Posted {job.createdAt}</span>
              </div>
            </div>

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                {job.description}
              </p>
            </Card>

            {/* Offers Count */}
            <div className="text-gray-500 text-sm">
              {job.offersCount} offers submitted
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Poster Card */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Posted by</h3>
              <Link href={`/users/${job.poster.id}`} className="flex items-center gap-4 mb-4">
                <Avatar className="w-16 h-16">
                  {job.poster.avatar ? (
                    <Image src={job.poster.avatar} alt={job.poster.name} fill />
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center text-white text-xl font-bold">
                      {job.poster.name.charAt(0)}
                    </div>
                  )}
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{job.poster.name}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{job.poster.rating}</span>
                    <span>({job.poster.reviewCount} reviews)</span>
                  </div>
                  <p className="text-xs text-gray-500">Member since {job.poster.memberSince}</p>
                </div>
              </Link>

              <div className="space-y-3">
                <Button className="w-full" size="lg" onClick={() => setShowOfferModal(true)}>
                  Make an Offer
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact
                </Button>
              </div>
            </Card>

            {/* Quick Info */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Job Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Category</span>
                  <span className="font-medium">
                    {job.category === 'BABYSITTING' ? 'Babysitting' :
                     job.category === 'HOUSE_CLEANING' ? 'House Cleaning' : 'Local Food'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Budget</span>
                  <span className="font-medium">${job.budget}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium">{job.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium text-green-600">Open</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Make an Offer</h2>
            <form onSubmit={handleSubmitOffer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Price</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Job budget: ${job.budget}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message (Optional)</label>
                <textarea
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  rows={4}
                  placeholder="Introduce yourself and explain why you're a good fit..."
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowOfferModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Offer'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
