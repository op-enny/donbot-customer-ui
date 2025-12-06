'use client';

import { MapPin, Search, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocaleStore, translations } from '@/lib/store/localeStore';

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

// Helper function for reverse geocoding
async function getCityName(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12`
    );
    const data = await response.json();
    
    // Try to find the most relevant location name
    const address = data.address || {};
    const city = address.city || address.town || address.village || address.suburb || address.district;
    
    if (city) {
      return city;
    }
    
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.error('Error fetching city name:', error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

export function HeroBanner({ onSearch, initialLatitude, initialLongitude, initialAddress }: HeroBannerProps) {
  console.log('HeroBanner rendering', { initialLatitude, initialLongitude, initialAddress });
  const { locale, t } = useLocaleStore();
  
  const [locationName, setLocationName] = useState<string | null>(initialAddress || null);
  const [latitude, setLatitude] = useState<number | null>(initialLatitude || null);
  const [longitude, setLongitude] = useState<number | null>(initialLongitude || null);
  const [radius, setRadius] = useState(10); // Default 10km
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Update local state if props change (e.g. initial load)
  useEffect(() => {
    if (initialLatitude && initialLongitude) {
      setLatitude(initialLatitude);
      setLongitude(initialLongitude);
      
      if (initialAddress) {
        setLocationName(initialAddress);
      } else {
        // Fetch city name instead of showing coordinates
        getCityName(initialLatitude, initialLongitude).then(setLocationName);
      }
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

  const handleSearch = () => {
    if (latitude && longitude) {
      onSearch({
        latitude,
        longitude,
        radius,
        searchTerm: searchTerm || undefined,
        address: locationName || undefined,
      });
    } else {
      // If no location yet, try to get it first
      requestLocation();
    }
  };

  return (
    <div className="bg-[#D32F2F] text-white py-8 md:py-12 px-4 shadow-md relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-yellow-400 blur-3xl"></div>
      </div>

      <div className="container mx-auto text-center max-w-3xl relative z-10">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight font-display">
          {t('hero_title')}
        </h1>
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
              <MapPin className={`w-5 h-5 ${isLoadingLocation ? 'animate-pulse text-[#D32F2F]' : 'text-[#D32F2F]'}`} />
              <span className="text-sm font-medium truncate max-w-[150px]">
                {isLoadingLocation ? t('locating') : locationName ? locationName : t('use_my_location')}
              </span>
            </button>

            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('search_placeholder')}
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
              className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm"
            >
              {t('search')}
            </button>
          </div>

          {/* Expanded Filters (Radius) */}
          <div className={`border-t border-gray-100 mt-2 p-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                {t('search_radius')}: <span className="text-[#D32F2F] font-bold">{radius} km</span>
              </span>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                onMouseUp={handleSearch}
                onTouchEnd={handleSearch}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#D32F2F]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
