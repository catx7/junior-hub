// City data for SEO landing pages
export interface CityData {
  slug: string;
  name: string; // Display name with diacritics
  region: string;
  lat: number;
  lng: number;
}

export const ROMANIAN_CITIES: CityData[] = [
  { slug: 'bucuresti', name: 'București', region: 'Ilfov', lat: 44.4268, lng: 26.1025 },
  { slug: 'cluj-napoca', name: 'Cluj-Napoca', region: 'Cluj', lat: 46.7712, lng: 23.6236 },
  { slug: 'timisoara', name: 'Timișoara', region: 'Timiș', lat: 45.7489, lng: 21.2087 },
  { slug: 'iasi', name: 'Iași', region: 'Iași', lat: 47.1585, lng: 27.6014 },
  { slug: 'brasov', name: 'Brașov', region: 'Brașov', lat: 45.6427, lng: 25.5887 },
  { slug: 'constanta', name: 'Constanța', region: 'Constanța', lat: 44.1598, lng: 28.6348 },
  { slug: 'craiova', name: 'Craiova', region: 'Dolj', lat: 44.3302, lng: 23.7949 },
  { slug: 'galati', name: 'Galați', region: 'Galați', lat: 45.4353, lng: 28.008 },
  { slug: 'oradea', name: 'Oradea', region: 'Bihor', lat: 47.0465, lng: 21.9189 },
  { slug: 'sibiu', name: 'Sibiu', region: 'Sibiu', lat: 45.7983, lng: 24.1256 },
  { slug: 'ploiesti', name: 'Ploiești', region: 'Prahova', lat: 44.9462, lng: 26.0255 },
  { slug: 'pitesti', name: 'Pitești', region: 'Argeș', lat: 44.8565, lng: 24.8692 },
  { slug: 'arad', name: 'Arad', region: 'Arad', lat: 46.1866, lng: 21.3123 },
  { slug: 'targu-mures', name: 'Târgu Mureș', region: 'Mureș', lat: 46.5386, lng: 24.5575 },
  { slug: 'baia-mare', name: 'Baia Mare', region: 'Maramureș', lat: 47.6567, lng: 23.585 },
];

export function getCityBySlug(slug: string): CityData | undefined {
  return ROMANIAN_CITIES.find((c) => c.slug === slug);
}

// Service category data for SEO
export interface ServiceData {
  slug: string;
  nameRo: string;
  nameEn: string;
  descriptionRo: string;
  descriptionEn: string;
  category: string; // Maps to ServiceCategory enum
  keywords: string[];
}

export const SERVICE_TYPES: ServiceData[] = [
  {
    slug: 'babysitting',
    nameRo: 'Babysitting',
    nameEn: 'Babysitting',
    descriptionRo: 'Găsește bone și babysittere de încredere, verificate și cu experiență.',
    descriptionEn: 'Find trusted, verified, and experienced babysitters and nannies.',
    category: 'BABYSITTING',
    keywords: ['bona', 'babysitter', 'bone', 'ingrijire copii', 'supraveghere copii'],
  },
  {
    slug: 'curatenie',
    nameRo: 'Curățenie',
    nameEn: 'House Cleaning',
    descriptionRo: 'Servicii profesionale de curățenie pentru casa ta.',
    descriptionEn: 'Professional house cleaning services for your home.',
    category: 'HOUSE_CLEANING',
    keywords: ['curatenie', 'menaj', 'servicii curatenie', 'curatenie casa'],
  },
];

export function getServiceBySlug(slug: string): ServiceData | undefined {
  return SERVICE_TYPES.find((s) => s.slug === slug);
}
