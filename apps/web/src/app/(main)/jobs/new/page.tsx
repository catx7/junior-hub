'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  MapPin,
  Camera,
  X,
  DollarSign,
  Calendar,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SERVICE_CATEGORIES } from '@localservices/shared';

type Category = keyof typeof SERVICE_CATEGORIES;

export default function CreateJobPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = Object.values(SERVICE_CATEGORIES).filter(c => c.id !== 'OTHER');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 5) {
      alert('You can upload up to 5 images');
      return;
    }

    // Create preview URLs
    const newImages = Array.from(files).map(file => URL.createObjectURL(file));
    setImages([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a description');
      return;
    }
    if (!category) {
      alert('Please select a category');
      return;
    }
    if (!budget || parseFloat(budget) <= 0) {
      alert('Please enter a valid budget');
      return;
    }
    if (!location.trim()) {
      alert('Please enter a location');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Your job has been posted!');
      router.push('/jobs');
    } catch (error) {
      alert('Failed to post job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
          <p className="text-gray-600 mt-2">
            Describe what you need and find the perfect service provider
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Category Selection */}
          <Card className="p-6 mb-6">
            <Label className="text-lg font-semibold mb-4 block">
              What service do you need?
            </Label>
            <div className="grid grid-cols-3 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as Category)}
                  className={`p-4 rounded-xl border-2 transition text-center ${
                    category === cat.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-3xl block mb-2">
                    {cat.id === 'BABYSITTING' ? '👶' :
                     cat.id === 'HOUSE_CLEANING' ? '🏠' : '🍽️'}
                  </span>
                  <span className={`text-sm font-medium ${
                    category === cat.id ? 'text-primary' : 'text-gray-700'
                  }`}>
                    {cat.id === 'BABYSITTING' ? 'Babysitting' :
                     cat.id === 'HOUSE_CLEANING' ? 'Cleaning' : 'Food'}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Title & Description */}
          <Card className="p-6 mb-6 space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Need a babysitter for 2 kids this weekend"
                maxLength={100}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {title.length}/100
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you need in detail. Include any specific requirements, preferences, or important information..."
                maxLength={2000}
                rows={6}
                className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {description.length}/2000
              </p>
            </div>
          </Card>

          {/* Budget & Location */}
          <Card className="p-6 mb-6 space-y-6">
            <div>
              <Label htmlFor="budget">Budget</Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <div className="relative mt-2">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter address or area"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="date">Scheduled Date (Optional)</Label>
              <div className="relative mt-2">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="date"
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </Card>

          {/* Images */}
          <Card className="p-6 mb-6">
            <Label className="mb-4 block">Photos (Optional)</Label>
            <p className="text-sm text-gray-500 mb-4">Add up to 5 photos to help describe your job</p>

            <div className="flex flex-wrap gap-4">
              {images.map((src, index) => (
                <div key={index} className="relative w-24 h-24">
                  <Image
                    src={src}
                    alt={`Upload ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Add</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Posting...' : 'Post Job'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
