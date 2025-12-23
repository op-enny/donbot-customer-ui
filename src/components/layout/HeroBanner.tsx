'use client';

import { MapPin, Search, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocaleStore } from '@/lib/store/localeStore';

interface SearchParams {
  latitude: number;
  longitude: number;
  radius: number;
  searchTerm?: string;
  address?: string;
}

interface HeroBannerProps {
  onSearch: (params: SearchParams) => void;
  initialLatitude?: number;
  initialLongitude?: number;
  initialAddress?: string;
}

// Simple in-memory cache for geocoding results (15 min TTL)
const geocodeCache = new Map<string, { value: string; timestamp: number }>();
const forwardGeocodeCache = new Map<
  string,
  { value: { latitude: number; longitude: number; displayName: string }; timestamp: number }
>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// Rate limiter for Nominatim API (max 1 request per second)
let lastNominatimRequest = 0;
const NOMINATIM_RATE_LIMIT = 1000; // 1 second

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastNominatimRequest;

  if (timeSinceLastRequest < NOMINATIM_RATE_LIMIT) {
    await new Promise((resolve) => setTimeout(resolve, NOMINATIM_RATE_LIMIT - timeSinceLastRequest));
  }

  lastNominatimRequest = Date.now();
  return fetch(url, {
    headers: {
      'User-Agent': 'DonBot-CustomerUI/1.0 (https://donbot.com)',
    },
  });
}

// Helper function for reverse geocoding with caching and rate limiting
async function getCityName(lat: number, lng: number): Promise<string> {
  // Round coordinates to reduce cache misses for nearby locations
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;

  // Check cache first
  const cached = geocodeCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.value;
  }

  try {
    const response = await rateLimitedFetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12`
    );
    const data = await response.json();

    // Try to find the most relevant location name
    const address = data.address || {};
    const city = address.city || address.town || address.village || address.suburb || address.district;

    const result = city || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

    // Cache the result
    geocodeCache.set(cacheKey, { value: result, timestamp: Date.now() });

    return result;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching city name:', error);
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

// Helper function for forward geocoding with caching and rate limiting
async function getCoordinatesFromAddress(
  query: string
): Promise<{ latitude: number; longitude: number; displayName: string } | null> {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return null;

  const cached = forwardGeocodeCache.get(normalizedQuery);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.value;
  }

  try {
    const response = await rateLimitedFetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(normalizedQuery)}`
    );
    const data = await response.json();
    const firstResult = Array.isArray(data) ? data[0] : null;

    if (!firstResult) return null;

    const result = {
      latitude: parseFloat(firstResult.lat),
      longitude: parseFloat(firstResult.lon),
      displayName: firstResult.display_name || query,
    };

    forwardGeocodeCache.set(normalizedQuery, { value: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching coordinates:', error);
    }
    return null;
  }
}

export function HeroBanner({ onSearch, initialLatitude, initialLongitude, initialAddress }: HeroBannerProps) {
  const { t } = useLocaleStore();
  
  const [locationName, setLocationName] = useState<string | null>(initialAddress || null);
  const [latitude, setLatitude] = useState<number | null>(initialLatitude || null);
  const [longitude, setLongitude] = useState<number | null>(initialLongitude || null);
  const [radius, setRadius] = useState(5); // Default 5km
  const [searchTerm, setSearchTerm] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showManualAddress, setShowManualAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Fetch city name if coordinates are provided but no address
  useEffect(() => {
    if (initialLatitude && initialLongitude && !initialAddress) {
      // Fetch city name instead of showing coordinates
      getCityName(initialLatitude, initialLongitude).then(setLocationName);
    }
  }, [initialLatitude, initialLongitude, initialAddress]);

  const requestLocation = () => {
    setIsLoadingLocation(true);

    if (!navigator.geolocation) {
      alert(t('geolocation_unsupported'));
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setLatitude(lat);
        setLongitude(lng);
        
        // Get city name
        const name = await getCityName(lat, lng);
        setLocationName(name);
        
        setIsLoadingLocation(false);
        
        // Trigger search immediately when location is found
        onSearch({
          latitude: lat,
          longitude: lng,
          radius,
          searchTerm: searchTerm || undefined,
          address: name,
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        alert(t('location_error'));
        setIsLoadingLocation(false);
      }
    );
  };

  const handleSearch = async () => {
    if (latitude && longitude) {
      onSearch({
        latitude,
        longitude,
        radius,
        searchTerm: searchTerm || undefined,
        address: locationName || undefined,
      });
      return;
    }

    if (manualAddress.trim()) {
      setAddressError(null);
      setIsGeocodingAddress(true);
      const geocoded = await getCoordinatesFromAddress(manualAddress);
      setIsGeocodingAddress(false);

      if (geocoded) {
        setLatitude(geocoded.latitude);
        setLongitude(geocoded.longitude);
        setLocationName(geocoded.displayName);
        onSearch({
          latitude: geocoded.latitude,
          longitude: geocoded.longitude,
          radius,
          searchTerm: searchTerm || undefined,
          address: geocoded.displayName,
        });
        return;
      }

      setAddressError(t('address_not_found'));
      return;
    }

    // If no location yet, try to get it first
    requestLocation();
  };

  return (
    <div className="bg-gradient-to-br from-[#0A1A2F] via-[#0E2238] to-[#142739] text-white py-8 md:py-12 px-4 shadow-md relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFBE0B]/15 via-transparent to-transparent pointer-events-none" />
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white blur-3xl"></div>
        <div className="absolute -bottom-36 -left-20 w-[600px] h-[600px] rounded-full bg-[#FFBE0B] blur-3xl"></div>
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[460px] h-[460px] rounded-full bg-[#FF8F00] blur-3xl"></div>
      </div>

      <div className="container mx-auto text-center max-w-3xl relative z-10">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight font-display">
          {t('hero_title')}
        </h1>
        <div className="mx-auto mb-4 h-1 w-24 rounded-full bg-gradient-to-r from-[#FFBE0B] via-[#FF8F00] to-[#D32F2F]" />
        <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">
          {t('hero_subtitle')}
        </p>

        {/* Search Box Container */}
        <div className="bg-white p-2 rounded-2xl shadow-xl max-w-2xl mx-auto transform transition-all">
          <div className="flex flex-col md:flex-row gap-2">
            {/* Location Button */}
            <button
              onClick={requestLocation}
              disabled={isLoadingLocation}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors md:w-auto whitespace-nowrap"
            >
              <MapPin className={`w-5 h-5 ${isLoadingLocation ? 'animate-pulse text-primary' : 'text-primary'}`} />
              <span className="text-sm font-medium truncate max-w-[150px]">
                {isLoadingLocation
                  ? t('locating')
                  : locationName
                    ? `${t('location_selected')}: ${locationName}`
                    : t('use_my_location')}
              </span>
            </button>

            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('search_placeholder_hero')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none text-base"
              />
            </div>

            {/* Filter Toggle (Mobile) or Radius (Desktop) */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden p-3 text-gray-500 hover:bg-gray-100 rounded-xl"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="bg-[#FFBE0B] hover:bg-[#E5AB00] text-[#001233] px-8 py-3 rounded-xl font-bold transition-colors shadow-[0_10px_24px_rgba(255,190,11,0.35)]"
            >
              {t('search_cta')}
            </button>
          </div>

          {!locationName && (
            <p className="mt-2 text-left text-xs text-gray-500">
              {t('location_permission_hint')}
            </p>
          )}

          {!locationName && (
            <div className="mt-2 flex flex-col items-start gap-2">
              <button
                type="button"
                onClick={() => setShowManualAddress((prev) => !prev)}
                className="text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                {showManualAddress ? t('hide') : t('address')}
              </button>
              {showManualAddress && (
                <div className="w-full">
                  <input
                    type="text"
                    placeholder={t('address')}
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    disabled={isGeocodingAddress}
                    className="w-full px-4 py-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none text-base border border-gray-100 rounded-xl"
                  />
                  {addressError && (
                    <p className="mt-1 text-xs text-red-600">
                      {addressError} {t('address_hint')}
                    </p>
                  )}
                  {!addressError && (
                    <p className="mt-1 text-xs text-gray-500">{t('manual_address_hint')}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Expanded Filters (Radius) */}
          <div className={`border-t border-gray-100 mt-2 p-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                {t('search_radius')}: <span className="text-primary font-bold">{radius} km</span>
              </span>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[hsl(var(--primary))]"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg whitespace-nowrap"
              >
                {t('apply')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
