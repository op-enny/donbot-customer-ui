'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, MapPin, SlidersHorizontal } from 'lucide-react';
import { MarketCard } from '@/components/market/MarketCard';
import { Skeleton } from '@/components/ui/skeleton';
import { businessesApi, type Business } from '@/lib/api';
import { useLocationStore } from '@/lib/store/locationStore';
import { useLocaleStore } from '@/lib/store/localeStore';

function MarketCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Skeleton className="h-40 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export default function MarketHomePage() {
  const [markets, setMarkets] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { latitude, longitude, address } = useLocationStore();
  const { t } = useLocaleStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const fetchMarkets = useCallback(async (lat: number, lng: number, term?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // First try with 10km radius
      let data = await businessesApi.getNearbyBusinesses(
        lat,
        lng,
        10, // radius in km
        'grocery', // filter by grocery/market type
        term
      );

      // If no results, try with much larger radius (500km) to show all markets
      if (data.length === 0) {
        data = await businessesApi.getNearbyBusinesses(
          lat,
          lng,
          500, // larger radius to find all markets in country
          'grocery',
          term
        );
      }

      setMarkets(data);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load markets:', err);
      }
      setError(t('market_load_error'));
      setMarkets([]);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (mounted) {
      fetchMarkets(latitude, longitude, searchTerm || undefined);
    }
  }, [mounted, latitude, longitude, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMarkets(latitude, longitude, searchTerm || undefined);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 text-white py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">
            {t('market_hero_title')}
          </h1>
          <p className="text-green-100 text-center mb-8">
            {t('market_hero_subtitle')}
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('market_search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3.5 bg-green-800 hover:bg-green-900 rounded-xl font-medium transition-colors"
              >
                {t('market_search_button')}
              </button>
            </div>
          </form>

          {/* Location Display */}
          <div className="flex items-center justify-center gap-2 mt-4 text-green-100 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{address || 'Berlin, Germany'}</span>
          </div>
        </div>
      </div>

      {/* Category Tags */}
      <div className="sticky top-[73px] z-40 bg-white border-b border-gray-200 py-4 px-4 shadow-sm">
        <div className="container mx-auto">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            <button className="px-5 py-2.5 rounded-full text-sm font-semibold bg-green-600 text-white shadow-md whitespace-nowrap">
              {t('market_all_markets')}
            </button>
            <button className="px-5 py-2.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors whitespace-nowrap">
              {t('market_grocery')}
            </button>
            <button className="px-5 py-2.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors whitespace-nowrap">
              {t('market_organic')}
            </button>
            <button className="px-5 py-2.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors whitespace-nowrap">
              {t('market_fresh_produce')}
            </button>
            <button className="px-5 py-2.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors whitespace-nowrap">
              {t('market_bakery')}
            </button>
            <button className="px-5 py-2.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors whitespace-nowrap">
              {t('market_butcher')}
            </button>
          </div>
        </div>
      </div>

      {/* Markets Grid */}
      <section className="container mx-auto px-4 py-6 pb-32">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {searchTerm ? `${t('market_search_results')}: "${searchTerm}"` : t('market_nearby')}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {markets.length} {markets.length === 1 ? t('market_found') : t('market_found_plural')}
            </span>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm">{t('market_filter')}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <MarketCardSkeleton key={idx} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {markets.map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>

            {/* Empty State */}
            {markets.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-xl text-muted-foreground mb-2">
                  {t('market_no_markets')}
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {t('market_no_markets_subtitle')}
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
