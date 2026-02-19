const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

/**
 * Search for addresses using Nominatim (OpenStreetMap geocoding)
 * Free, no API key required. Rate limited to 1 request/second.
 */
export async function searchAddress(query: string): Promise<NominatimResult[]> {
  if (!query || query.length < 3) return [];

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    addressdetails: '1',
    limit: '5',
  });

  const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
    headers: {
      'User-Agent': 'JuniorHub/1.0',
    },
  });

  if (!response.ok) return [];

  return response.json();
}

/**
 * Reverse geocode coordinates to an address string
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'json',
  });

  const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params}`, {
    headers: {
      'User-Agent': 'JuniorHub/1.0',
    },
  });

  if (!response.ok) return '';

  const data = await response.json();
  return data.display_name || '';
}

/**
 * Create a debounced version of a function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
