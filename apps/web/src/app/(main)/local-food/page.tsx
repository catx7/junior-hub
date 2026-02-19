'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Loader2, UtensilsCrossed, Truck, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LOCAL_FOOD_CATEGORIES } from '@localservices/shared';

interface FoodItem {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  pickupOnly: boolean;
  deliveryAvailable: boolean;
  location: string;
  status: string;
  createdAt: string;
  vendor: {
    id: string;
    name: string;
    avatar: string | null;
    rating: number;
  };
}

const categories = ['All', ...LOCAL_FOOD_CATEGORIES];

export default function LocalFoodPage() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { data, isLoading, error } = useQuery({
    queryKey: ['local-food', selectedCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/local-food?${params}`);
      if (!res.ok) throw new Error('Failed to fetch items');
      return res.json();
    },
  });

  const allItems: FoodItem[] = data?.items || [];
  const items = isAuthenticated ? allItems : allItems.slice(0, 10);

  return (
    <div className="bg-muted/50 min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-foreground text-3xl font-bold">{t('localFood.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('localFood.subtitle')}</p>
          </div>
          {isAuthenticated && (
            <Link href="/local-food/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('localFood.listFoodItem')}
              </Button>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-900 dark:text-orange-400">
                  {t('localFood.totalListings')}
                </p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {allItems.length}
                </p>
              </div>
              <UtensilsCrossed className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-400">
                  {t('localFood.withDelivery')}
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {allItems.filter((i) => i.deliveryAvailable).length}
                </p>
              </div>
              <Truck className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary text-sm font-medium">{t('localFood.pickupOnly')}</p>
                <p className="text-primary text-3xl font-bold">
                  {allItems.filter((i) => i.pickupOnly).length}
                </p>
              </div>
              <MapPin className="text-primary h-8 w-8" />
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
                placeholder={t('localFood.searchPlaceholder')}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-foreground flex items-center text-sm font-medium">
                {t('localFood.categoryLabel')}
              </span>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="flex-shrink-0"
                >
                  {cat}
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
            <p className="text-red-500">{t('localFood.failedToLoad')}</p>
          </Card>
        )}

        {/* Items Grid */}
        {!isLoading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <Link
                key={item.id}
                href={
                  isAuthenticated
                    ? `/local-food/${item.id}`
                    : '/register?message=Create an account to view food details and place orders'
                }
              >
                <Card className="overflow-hidden transition hover:shadow-lg">
                  <div className="bg-muted relative h-48">
                    {item.images && item.images.length > 0 ? (
                      <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <UtensilsCrossed className="text-muted-foreground h-16 w-16" />
                      </div>
                    )}
                    <div className="absolute right-2 top-2">
                      <Badge className="bg-orange-600 text-lg font-bold">${item.price}</Badge>
                    </div>
                    <div className="absolute left-2 top-2 flex gap-1">
                      {item.deliveryAvailable && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        >
                          <Truck className="mr-1 h-3 w-3" />
                          {t('localFood.delivery')}
                        </Badge>
                      )}
                      {item.pickupOnly && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          <MapPin className="mr-1 h-3 w-3" />
                          {t('localFood.pickup')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-foreground mb-1 font-semibold">{item.title}</h3>
                    <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
                      {item.description}
                    </p>

                    <div className="mb-3">
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between border-t pt-3">
                      <div className="text-muted-foreground text-sm">
                        <p className="font-medium">{item.vendor?.name || 'Anonymous'}</p>
                        <p className="text-xs">{item.location}</p>
                      </div>
                      <p className="text-primary text-xl font-bold">${item.price}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Sign up prompt for guests */}
        {!isAuthenticated && items.length > 0 && (
          <div className="mt-8 rounded-xl border bg-gradient-to-r from-orange-50 to-amber-50 p-8 text-center">
            <h3 className="mb-2 text-lg font-semibold">{t('localFood.wantToSeeMore')}</h3>
            <p className="text-muted-foreground mb-4 text-sm">{t('localFood.signUpDesc')}</p>
            <Link href="/register?message=Create an account to browse all food listings and place orders">
              <Button>{t('localFood.signUpFree')}</Button>
            </Link>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && items.length === 0 && (
          <Card className="p-12 text-center">
            <UtensilsCrossed className="text-muted-foreground/50 mx-auto mb-4 h-16 w-16" />
            <h3 className="text-foreground mb-2 text-lg font-semibold">
              {t('localFood.noFoodItems')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || selectedCategory !== 'All'
                ? t('localFood.adjustSearch')
                : t('localFood.beFirstToList')}
            </p>
            {isAuthenticated && (
              <Link href="/local-food/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('localFood.listFoodItem')}
                </Button>
              </Link>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
