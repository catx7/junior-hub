'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Plus, Search, Gift, Tag, Loader2, Shirt } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface ClothesItem {
  id: string;
  title: string;
  description: string;
  category: string;
  size: string;
  gender: string;
  condition: string;
  type: string;
  price: number | null;
  originalPrice: number | null;
  images: string[];
  location: string;
  status: string;
  createdAt: string;
  seller: {
    id: string;
    name: string;
    avatar: string | null;
    rating: number;
  };
}

const categories = [
  'All',
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
];
const types = ['All', 'Sell', 'Donate'];

export default function KidsClothesPage() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  const { data, isLoading, error } = useQuery({
    queryKey: ['kids-clothes', selectedCategory, selectedType, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedType !== 'All') params.append('type', selectedType);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/kids-clothes?${params}`);
      if (!res.ok) throw new Error('Failed to fetch items');
      return res.json();
    },
  });

  const allItems: ClothesItem[] = data?.items || [];
  const items = isAuthenticated ? allItems : allItems.slice(0, 10);
  const sellCount = allItems.filter((i) => i.type === 'Sell').length;
  const donateCount = allItems.filter((i) => i.type === 'Donate').length;

  return (
    <div className="bg-muted/50 min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-foreground text-3xl font-bold">Kids Clothes Marketplace</h1>
            <p className="text-muted-foreground mt-1">
              Buy, sell, or donate gently used kids clothes
            </p>
          </div>
          {isAuthenticated && (
            <Link href="/kids-clothes/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                List Item
              </Button>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 p-6 dark:from-green-950/30 dark:to-green-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Items for Sale
                </p>
                <p className="text-3xl font-bold text-green-600">{sellCount}</p>
              </div>
              <Tag className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 dark:from-purple-950/30 dark:to-purple-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  Free to Donate
                </p>
                <p className="text-3xl font-bold text-purple-600">{donateCount}</p>
              </div>
              <Gift className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 dark:from-blue-950/30 dark:to-blue-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Total Listings
                </p>
                <p className="text-3xl font-bold text-blue-600">{items.length}</p>
              </div>
              <Heart className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 p-4">
          <div className="flex flex-col gap-4">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for clothes..."
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-foreground flex items-center text-sm font-medium">Type:</span>
              {types.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className="flex-shrink-0"
                >
                  {type}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-foreground flex items-center text-sm font-medium">
                Category:
              </span>
              <div className="flex flex-wrap gap-2">
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
            <p className="text-red-500">Failed to load items. Please try again.</p>
          </Card>
        )}

        {/* Items Grid */}
        {!isLoading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => {
              const price = item.price
                ? typeof item.price === 'object'
                  ? Number(item.price)
                  : item.price
                : 0;
              const originalPrice = item.originalPrice
                ? typeof item.originalPrice === 'object'
                  ? Number(item.originalPrice)
                  : item.originalPrice
                : null;

              return (
                <Link
                  key={item.id}
                  href={
                    isAuthenticated
                      ? `/kids-clothes/${item.id}`
                      : '/register?message=Create an account to view item details and contact sellers'
                  }
                >
                  <Card className="overflow-hidden transition hover:shadow-lg">
                    <div className="bg-muted relative h-64">
                      {item.images && item.images.length > 0 ? (
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Shirt className="text-muted-foreground h-16 w-16" />
                        </div>
                      )}
                      <div className="absolute right-2 top-2 flex gap-2">
                        <Badge
                          className={item.type === 'Donate' ? 'bg-purple-600' : 'bg-green-600'}
                        >
                          {item.type === 'Donate' ? 'FREE' : `$${price}`}
                        </Badge>
                      </div>
                      <div className="absolute left-2 top-2">
                        <Badge variant="secondary" className="bg-white/90">
                          {item.condition}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="text-foreground mb-2 font-semibold">{item.title}</h3>
                      <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
                        {item.description}
                      </p>

                      <div className="mb-3 flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Size {item.size}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.gender}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between border-t pt-3">
                        <div className="text-muted-foreground text-sm">
                          <p className="font-medium">{item.seller?.name || 'Anonymous'}</p>
                          <p className="text-xs">{item.location}</p>
                        </div>
                        {item.type === 'Sell' && (
                          <div className="text-right">
                            <p className="text-primary text-xl font-bold">${price}</p>
                            {originalPrice && originalPrice > price && (
                              <p className="text-muted-foreground text-xs line-through">
                                ${originalPrice}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Sign up prompt for guests */}
        {!isAuthenticated && items.length > 0 && (
          <div className="mt-8 rounded-xl border bg-gradient-to-r from-green-50 to-emerald-50 p-8 text-center dark:from-green-950/20 dark:to-emerald-950/20">
            <h3 className="mb-2 text-lg font-semibold">Want to see more items?</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Create a free account to browse all listings and contact sellers.
            </p>
            <Link href="/register?message=Create an account to browse all clothes listings and contact sellers">
              <Button>Sign Up Free</Button>
            </Link>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && items.length === 0 && (
          <Card className="p-12 text-center">
            <Heart className="text-muted-foreground/50 mx-auto mb-4 h-16 w-16" />
            <h3 className="text-foreground mb-2 text-lg font-semibold">No items found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || selectedCategory !== 'All' || selectedType !== 'All'
                ? 'Try adjusting your search or filters'
                : 'Be the first to list kids clothes in your area!'}
            </p>
            {isAuthenticated && (
              <Link href="/kids-clothes/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  List Item
                </Button>
              </Link>
            )}
          </Card>
        )}

        {/* Info Banners */}
        {isAuthenticated && (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 dark:from-green-950/20 dark:to-emerald-950/20">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                  <Tag className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-foreground mb-2 font-semibold">Sell Your Kids Clothes</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Turn outgrown clothes into cash. Set your price and connect with local families.
                  </p>
                  <Link href="/kids-clothes/create">
                    <Button variant="outline" size="sm" className="border-green-600 text-green-600">
                      Start Selling
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 dark:from-purple-950/20 dark:to-pink-950/20">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
                  <Gift className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-foreground mb-2 font-semibold">Donate to Families in Need</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Give your gently used clothes a second life and help families save money.
                  </p>
                  <Link href="/kids-clothes/create">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-600 text-purple-600"
                    >
                      Donate Now
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
