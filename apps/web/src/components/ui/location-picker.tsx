'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { searchAddress, reverseGeocode, type NominatimResult } from '@/lib/geocoding';
import { useTranslation } from '@/hooks/use-translation';

const LocationMap = dynamic(() => import('./location-map'), {
  ssr: false,
  loading: () => <div className="bg-muted h-[300px] animate-pulse rounded-lg" />,
});

interface LocationPickerProps {
  value: string;
  onChange: (address: string) => void;
  onCoordinatesChange: (lat: number, lng: number) => void;
  defaultLat?: number;
  defaultLng?: number;
  error?: boolean;
  placeholder?: string;
  showMap?: boolean;
}

// Default to Bucharest
const DEFAULT_LAT = 44.4268;
const DEFAULT_LNG = 26.1025;

export function LocationPicker({
  value,
  onChange,
  onCoordinatesChange,
  defaultLat,
  defaultLng,
  error,
  placeholder,
  showMap = true,
}: LocationPickerProps) {
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [markerLat, setMarkerLat] = useState(defaultLat || DEFAULT_LAT);
  const [markerLng, setMarkerLng] = useState(defaultLng || DEFAULT_LNG);
  const [hasSelectedLocation, setHasSelectedLocation] = useState(
    !!(defaultLat && defaultLng && (defaultLat !== 0 || defaultLng !== 0))
  );
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update marker when defaultLat/defaultLng props change
  useEffect(() => {
    if (defaultLat && defaultLng && (defaultLat !== 0 || defaultLng !== 0)) {
      setMarkerLat(defaultLat);
      setMarkerLng(defaultLng);
      setHasSelectedLocation(true);
    }
  }, [defaultLat, defaultLng]);

  const handleInputChange = useCallback(
    (inputValue: string) => {
      onChange(inputValue);

      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      if (inputValue.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsSearching(true);
      debounceTimer.current = setTimeout(async () => {
        const results = await searchAddress(inputValue);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setIsSearching(false);
      }, 500);
    },
    [onChange]
  );

  const handleSelectSuggestion = useCallback(
    (result: NominatimResult) => {
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);

      onChange(result.display_name);
      onCoordinatesChange(lat, lng);
      setMarkerLat(lat);
      setMarkerLng(lng);
      setHasSelectedLocation(true);
      setSuggestions([]);
      setShowSuggestions(false);
    },
    [onChange, onCoordinatesChange]
  );

  const handleMapPositionChange = useCallback(
    async (lat: number, lng: number) => {
      setMarkerLat(lat);
      setMarkerLng(lng);
      onCoordinatesChange(lat, lng);
      setHasSelectedLocation(true);

      const address = await reverseGeocode(lat, lng);
      if (address) {
        onChange(address);
      }
    },
    [onChange, onCoordinatesChange]
  );

  const handleClear = useCallback(() => {
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
    setHasSelectedLocation(false);
  }, [onChange]);

  return (
    <div ref={wrapperRef} className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <MapPin className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder || t('location.searchPlaceholder')}
          className="pl-10 pr-10"
          error={error}
        />
        {isSearching && (
          <Search className="text-muted-foreground absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-pulse" />
        )}
        {!isSearching && value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="bg-card absolute z-50 mt-1 w-full overflow-hidden rounded-lg border shadow-lg">
            {suggestions.map((result) => (
              <button
                key={result.place_id}
                type="button"
                onClick={() => handleSelectSuggestion(result)}
                className="hover:bg-muted/50 flex w-full items-start gap-2 px-3 py-2 text-left text-sm"
              >
                <MapPin className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                <span className="text-foreground line-clamp-2">{result.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      {showMap && hasSelectedLocation && (
        <>
          <p className="text-muted-foreground text-xs">{t('location.dragMarkerToAdjust')}</p>
          <LocationMap lat={markerLat} lng={markerLng} onPositionChange={handleMapPositionChange} />
        </>
      )}

      {showMap &&
        !hasSelectedLocation &&
        value.length >= 3 &&
        !isSearching &&
        suggestions.length === 0 && (
          <p className="text-muted-foreground text-xs">{t('location.noResults')}</p>
        )}
    </div>
  );
}
