'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  MapPin,
  DollarSign,
  Loader2,
  Upload,
  Heart,
  X,
  ImagePlus,
  Link2,
} from 'lucide-react';
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
  'Outerwear',
  'Dresses',
  'Shirts & Tops',
  'Pants',
  'Baby Clothes',
  'Shoes',
  'School Uniforms',
  'Accessories',
  'Swimwear',
  'Sleepwear',
  'Other',
];

const sizes = [
  '0-3M',
  '3-6M',
  '6-9M',
  '9-12M',
  '12-18M',
  '18-24M',
  '2T',
  '3T',
  '4T',
  '5T',
  '4',
  '5',
  '6',
  '6X',
  '7',
  '8',
  '10',
  '12',
  '14',
  '16',
  'XS',
  'S',
  'M',
  'L',
  'XL',
];

const conditions = ['Like New', 'Good', 'Fair'];
const genders = ['Boy', 'Girl', 'Unisex'];

interface ImageItem {
  type: 'file' | 'url';
  file?: File;
  url: string;
  preview: string;
}

export default function CreateKidsClothesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [listingType, setListingType] = useState<'Sell' | 'Donate'>('Sell');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Shirts & Tops',
    size: '4',
    gender: 'Unisex',
    condition: 'Good',
    price: 0,
    originalPrice: 0,
    location: '',
    latitude: 0,
    longitude: 0,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = 5 - images.length;
    if (remaining <= 0) {
      toast.error(t('errors.maxImagesExceeded', { count: 5 }));
      return;
    }

    const newFiles = Array.from(files).slice(0, remaining);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    const newImages: ImageItem[] = [];
    for (const file of newFiles) {
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name}: ${t('errors.invalidFileType')}`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: ${t('errors.fileTooLarge')}`);
        continue;
      }
      newImages.push({
        type: 'file',
        file,
        url: '',
        preview: URL.createObjectURL(file),
      });
    }

    setImages((prev) => [...prev, ...newImages]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = () => {
    if (!imageUrl.trim()) return;

    try {
      new URL(imageUrl);
    } catch {
      toast.error(t('errors.invalidUrl'));
      return;
    }

    if (images.length >= 5) {
      toast.error(t('errors.maxImagesExceeded', { count: 5 }));
      return;
    }

    setImages((prev) => [...prev, { type: 'url', url: imageUrl.trim(), preview: imageUrl.trim() }]);
    setImageUrl('');
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const removed = prev[index];
      if (removed.type === 'file' && removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error(t('errors.loginRequired'));
      router.push('/login');
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

      // Upload file images to Cloudinary first
      const fileImages = images.filter((img) => img.type === 'file' && img.file);
      const urlImages = images.filter((img) => img.type === 'url').map((img) => img.url);
      let uploadedUrls: string[] = [];

      if (fileImages.length > 0) {
        setIsUploading(true);
        const uploadFormData = new FormData();
        for (const img of fileImages) {
          uploadFormData.append('images', img.file!);
        }

        const uploadRes = await fetch('/api/kids-clothes/images', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error || 'Failed to upload images');
        }

        const uploadData = await uploadRes.json();
        uploadedUrls = uploadData.urls;
        setIsUploading(false);
      }

      const allImageUrls = [...uploadedUrls, ...urlImages];

      const response = await fetch('/api/kids-clothes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          type: listingType,
          price: listingType === 'Donate' ? null : formData.price,
          originalPrice: listingType === 'Donate' ? null : formData.originalPrice,
          images: allImageUrls,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create listing');
      }

      const item = await response.json();
      toast.success(t('success.listingCreated'));
      router.push(`/kids-clothes/${item.id}`);
    } catch (error: any) {
      console.error('Create listing error:', error);
      toast.error(error.message || t('errors.failedToCreate'));
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-muted/50 min-h-screen py-8">
        <div className="mx-auto max-w-2xl px-4">
          <Card className="p-12 text-center">
            <h2 className="mb-4 text-xl font-semibold">Sign in Required</h2>
            <p className="text-muted-foreground mb-6">
              You need to be signed in to create a listing.
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
            href="/kids-clothes"
            className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Link>
          <h1 className="text-foreground text-3xl font-bold">Create Listing</h1>
          <p className="text-muted-foreground mt-1">
            Sell or donate kids clothes to other families
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Listing Type */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">What would you like to do?</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setListingType('Sell')}
                className={`flex flex-col items-center rounded-lg border-2 p-6 transition ${
                  listingType === 'Sell'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-border'
                }`}
              >
                <DollarSign
                  className={`mb-2 h-8 w-8 ${listingType === 'Sell' ? 'text-primary' : 'text-muted-foreground'}`}
                />
                <span
                  className={`font-semibold ${listingType === 'Sell' ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  Sell
                </span>
                <span className="text-muted-foreground mt-1 text-sm">Set your price</span>
              </button>
              <button
                type="button"
                onClick={() => setListingType('Donate')}
                className={`flex flex-col items-center rounded-lg border-2 p-6 transition ${
                  listingType === 'Donate'
                    ? 'border-green-600 bg-green-50'
                    : 'border-border hover:border-border'
                }`}
              >
                <Heart
                  className={`mb-2 h-8 w-8 ${listingType === 'Donate' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
                />
                <span
                  className={`font-semibold ${listingType === 'Donate' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
                >
                  Donate
                </span>
                <span className="text-muted-foreground mt-1 text-sm">Give for free</span>
              </button>
            </div>
          </Card>

          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="mb-4 flex items-center text-lg font-semibold">
              <Package className="mr-2 h-5 w-5" />
              Item Details
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Blue Winter Jacket - Size 4"
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
                  placeholder="Describe the item, any wear or defects, brand, etc."
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={4}
                  className="border-border focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="size">Size</Label>
                  <select
                    id="size"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className="border-border focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                  >
                    {sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="border-border focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                  >
                    {genders.map((gender) => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="condition">Condition</Label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="border-border focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                  >
                    {conditions.map((condition) => (
                      <option key={condition} value={condition}>
                        {condition}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Price (only for Sell) */}
          {listingType === 'Sell' && (
            <Card className="p-6">
              <h2 className="mb-4 flex items-center text-lg font-semibold">
                <DollarSign className="mr-2 h-5 w-5" />
                Pricing
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Asking Price ($)</Label>
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
                <div>
                  <Label htmlFor="originalPrice">Original Price ($) - optional</Label>
                  <Input
                    id="originalPrice"
                    name="originalPrice"
                    type="number"
                    min={0}
                    max={10000}
                    step={0.01}
                    value={formData.originalPrice}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Images */}
          <Card className="p-6">
            <h2 className="mb-4 flex items-center text-lg font-semibold">
              <Upload className="mr-2 h-5 w-5" />
              Images (Optional)
            </h2>

            {/* Image previews */}
            {images.length > 0 && (
              <div className="mb-4 grid grid-cols-3 gap-3">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="bg-muted group relative aspect-square overflow-hidden rounded-lg border"
                  >
                    <img
                      src={img.preview}
                      alt={`Image ${index + 1}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                        (e.target as HTMLImageElement).alt = 'Failed to load';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            {images.length < 5 && (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-border text-muted-foreground hover:border-border hover:text-muted-foreground flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition"
                >
                  <ImagePlus className="h-6 w-6" />
                  <span>Click to upload photos</span>
                </button>

                {/* URL input */}
                <div className="flex items-center gap-2">
                  <div className="flex flex-1 items-center gap-2">
                    <Link2 className="text-muted-foreground h-4 w-4 shrink-0" />
                    <Input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Or paste an image URL..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddUrl();
                        }
                      }}
                    />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddUrl}>
                    Add
                  </Button>
                </div>
              </div>
            )}

            <p className="text-muted-foreground mt-3 text-sm">
              Upload up to 5 photos or add image URLs. First image will be the main photo.
            </p>
          </Card>

          {/* Location */}
          <Card className="p-6">
            <h2 className="mb-4 flex items-center text-lg font-semibold">
              <MapPin className="mr-2 h-5 w-5" />
              Location
            </h2>
            <div>
              <Label htmlFor="location">Pickup Location</Label>
              <LocationPicker
                value={formData.location}
                onChange={(address) => setFormData((prev) => ({ ...prev, location: address }))}
                onCoordinatesChange={(lat, lng) =>
                  setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }))
                }
                placeholder="Pickup location"
              />
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
                  {isUploading ? 'Uploading images...' : 'Creating...'}
                </>
              ) : (
                `Create ${listingType === 'Donate' ? 'Donation' : 'Listing'}`
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
