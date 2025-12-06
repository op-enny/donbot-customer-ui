'use client';

import { useEffect, useState } from 'react';
import { HeroBanner } from '@/components/layout/HeroBanner';
import { RestaurantCard } from '@/components/restaurant/RestaurantCard';
import { restaurantsApi, type Restaurant } from '@/lib/api';
import { useLocationStore } from '@/lib/store/locationStore';

// Mock data for development - will be replaced with real API calls
const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Limon Grillhaus',
    slug: 'limon-grillhaus',
    logo_url: null,
    banner_image_url: null,
    cuisine_type: 'Turkish Grill',
    rating: 4.7,
    delivery_time: '20-30 min',
    minimum_order: 15,
    delivery_fee: 2.5,
    is_open: true,
    distance: 0.8,
  },
  {
    id: '2',
    name: 'Pizza Italiana',
    slug: 'pizza-italiana',
    logo_url: null,
    banner_image_url: null,
    cuisine_type: 'Italian Pizza',
    rating: 4.5,
    delivery_time: '25-35 min',
    minimum_order: 12,
    delivery_fee: 1.5,
    is_open: true,
    distance: 1.2,
  },
  {
    id: '3',
    name: 'Sushi Garden',
    slug: 'sushi-garden',
    logo_url: null,
    banner_image_url: null,
    cuisine_type: 'Japanese Sushi',
    rating: 4.8,
    delivery_time: '30-40 min',
    minimum_order: 20,
    delivery_fee: 3.0,
    is_open: false,
    distance: 2.1,
  },
  {
    id: '4',
    name: 'Burger Palace',
    slug: 'burger-palace',
    logo_url: null,
    banner_image_url: null,
    cuisine_type: 'American Burgers',
    rating: 4.3,
    delivery_time: '15-25 min',
    minimum_order: 10,
    delivery_fee: 0,
    is_open: true,
    distance: 0.5,
  },
];

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { latitude, longitude, address, setLocation } = useLocationStore();
  const [mounted, setMounted] = useState(false);

  // Local state for search params (radius, term)
  const [searchParams, setSearchParams] = useState<{
    radius: number;
    searchTerm?: string;
  }>({
    radius: 10,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchRestaurants = async (lat: number, lng: number, radius: number, term?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching restaurants with params:', { lat, lng, radius, term });
      const data = await restaurantsApi.getNearbyRestaurants(
        lat,
        lng,
        radius,
        term
      );

      if (data && data.length > 0) {
        setRestaurants(data);
      } else {
        console.log('No restaurants found from API');
        setRestaurants([]); // Clear list if nothing found
      }
    } catch (err) {
      console.error('Failed to load restaurants:', err);
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
  }, [mounted, latitude, longitude, searchParams.radius, searchParams.searchTerm]);

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
              Nearby
            </button>
            <button className="px-6 py-2.5 rounded-full text-sm font-medium bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap">
              Top Rated
            </button>
            <button className="px-6 py-2.5 rounded-full text-sm font-medium bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap">
              Fast Delivery
            </button>
            <button className="px-6 py-2.5 rounded-full text-sm font-medium bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap">
              Free Delivery
            </button>
            <button className="px-6 py-2.5 rounded-full text-sm font-medium bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap">
              Popular
            </button>
          </div>
        </div>
      </div>

      {/* Restaurant Grid */}
      <section className="container mx-auto px-4 py-6 pb-32">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {searchParams.searchTerm 
              ? `Results for "${searchParams.searchTerm}"`
              : 'Nearby Restaurants'}
          </h2>
          <span className="text-sm text-gray-500">
            {restaurants.length} {restaurants.length === 1 ? 'place' : 'places'} found
          </span>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-48 rounded-2xl bg-gray-100 animate-pulse"
              />
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
                  No restaurants found
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  We couldn't find any restaurants matching your criteria. 
                  Try increasing the search radius or changing your location.
                </p>
                <button 
                  onClick={() => handleSearch({...searchParams, radius: 50})}
                  className="mt-6 text-[#D32F2F] font-semibold hover:underline"
                >
                  Expand radius to 50km
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
