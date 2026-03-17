'use client';

import { useQuery } from '@tanstack/react-query';
import { providersApi } from '@/lib/api';

interface ProviderFilters {
  category?: string;
  search?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  minRate?: number;
  maxRate?: number;
  minRating?: number;
  minExperience?: number;
  languages?: string;
  certifications?: string;
  specialNeeds?: boolean;
  sort?: string;
  order?: string;
  page?: number;
  limit?: number;
}

export function useProviders(filters?: ProviderFilters) {
  return useQuery({
    queryKey: ['providers', filters],
    queryFn: () =>
      providersApi.search(filters as Record<string, string | number | boolean | undefined>),
  });
}
