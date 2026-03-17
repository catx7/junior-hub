'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';

export function HomeSearchBar() {
  const { t } = useTranslation();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (location) params.set('location', location);
    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="dark:bg-card flex flex-col gap-3 rounded-2xl bg-white p-2 shadow-lg sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('jobs.searchPlaceholder')}
            className="bg-muted/50 focus:ring-primary h-12 w-full rounded-xl pl-12 pr-4 focus:outline-none focus:ring-2"
          />
        </div>
        <div className="relative flex-1">
          <MapPin className="text-muted-foreground absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('homepage.locationPlaceholder')}
            className="bg-muted/50 focus:ring-primary h-12 w-full rounded-xl pl-12 pr-4 focus:outline-none focus:ring-2"
          />
        </div>
        <Button size="lg" className="h-12 w-full sm:w-auto" onClick={handleSearch}>
          {t('common.search')}
        </Button>
      </div>
    </div>
  );
}
