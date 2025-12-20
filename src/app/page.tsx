'use client';

import { useEffect, useState } from 'react';
import { HeroBanner } from '@/components/layout/HeroBanner';
import { RestaurantCard } from '@/components/restaurant/RestaurantCard';
import { RestaurantCardSkeleton } from '@/components/ui/skeleton';
import { restaurantsApi, type Restaurant } from '@/lib/api';
import { useLocationStore } from '@/lib/store/locationStore';
import { useLocaleStore } from '@/lib/store/localeStore';

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { latitude, longitude, address, setLocation } = useLocationStore();
  const { locale, t } = useLocaleStore();
  const [mounted, setMounted] = useState(false);

  // Local state for search params (radius, term)
  const [searchParams, setSearchParams] = useState<{
    radius: number;
    searchTerm?: string;
  }>({
    radius: 10,
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const fetchRestaurants = async (lat: number, lng: number, radius: number, term?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await restaurantsApi.getNearbyRestaurants(
        lat,
        lng,
        radius,
        term
      );

      if (data && data.length > 0) {
        setRestaurants(data);
      } else {
        setRestaurants([]); // Clear list if nothing found
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load restaurants:', err);
      }
      setError('Failed to load restaurants. Please try again.');
      setRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load & when location changes
  useEffect(() => {
    if (mounted) {
      fetchRestaurants(latitude, longitude, searchParams.radius, searchParams.searchTerm);
    }
  }, [mounted, latitude, longitude, searchParams.radius, searchParams.searchTerm, locale]);

  const handleSearch = (params: { latitude: number; longitude: number; radius: number; searchTerm?: string; address?: string }) => {
    // Update store if location changed
    if (params.latitude !== latitude || params.longitude !== longitude) {
      setLocation(params.latitude, params.longitude, params.address || 'Unknown Location');
    }
    
    setSearchParams({
      radius: params.radius,
      searchTerm: params.searchTerm
    });
    
    // fetchRestaurants is triggered by useEffect
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <HeroBanner 
        onSearch={handleSearch} 
        initialLatitude={latitude}
        initialLongitude={longitude}
        initialAddress={address}
      />

      {/* Category Tabs */}
      <div className="sticky top-[73px] z-40 bg-white border-b border-gray-200 py-4 px-4 shadow-sm">
        <div className="container mx-auto">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            <button className="px-6 py-2.5 rounded-full text-sm font-semibold bg-[#D32F2F] text-white shadow-md whitespace-nowrap">
              {t('nearby')}
            </button>
            <button className="px-6 py-2.5 rounded-full text-sm font-medium bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap">
              {t('top_rated')}
            </button>
            <button className="px-6 py-2.5 rounded-full text-sm font-medium bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap">
              {t('fast_delivery')}
            </button>
            <button className="px-6 py-2.5 rounded-full text-sm font-medium bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap">
              {t('free_delivery')}
            </button>
            <button className="px-6 py-2.5 rounded-full text-sm font-medium bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap">
              {t('popular')}
            </button>
          </div>
        </div>
      </div>

      {/* Restaurant Grid */}
      <section className="container mx-auto px-4 py-6 pb-32">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {searchParams.searchTerm 
              ? `${t('search')}: "${searchParams.searchTerm}"`
              : t('nearby_restaurants')}
          </h2>
          <span className="text-sm text-gray-500">
            {restaurants.length} {restaurants.length === 1 ? t('place_found') : t('places_found')}
          </span>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            {t('error_generic')}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <RestaurantCardSkeleton key={idx} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>

            {/* Empty State (shown when no restaurants) */}
            {restaurants.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-xl text-muted-foreground mb-2">
                  {t('no_restaurants')}
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {t('error_not_found')}
                </p>
                <button 
                  onClick={() => handleSearch({
                    ...searchParams, 
                    radius: 50,
                    latitude,
                    longitude,
                    address
                  })}
                  className="mt-6 text-[#D32F2F] font-semibold hover:underline"
                >
                  {t('expand_radius')}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
