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
      {/* Hero Section with Wave Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-16 px-4">
        {/* Animated Wave Background */}
        <div className="absolute inset-0 overflow-hidden">
          <svg
            className="absolute bottom-0 left-0 w-full h-32 text-white"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
          >
            <path
              fill="currentColor"
              d="M0,64 C288,120 576,0 864,64 C1152,128 1296,32 1440,64 L1440,120 L0,120 Z"
            >
              <animate
                attributeName="d"
                dur="10s"
                repeatCount="indefinite"
                values="
                  M0,64 C288,120 576,0 864,64 C1152,128 1296,32 1440,64 L1440,120 L0,120 Z;
                  M0,80 C288,32 576,96 864,48 C1152,0 1296,80 1440,48 L1440,120 L0,120 Z;
                  M0,64 C288,120 576,0 864,64 C1152,128 1296,32 1440,64 L1440,120 L0,120 Z
                "
              />
            </path>
          </svg>
          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-4xl relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-center text-gray-800">
            {t('market_hero_title')}
          </h1>
          <p className="text-gray-600 text-center mb-8 max-w-xl mx-auto">
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
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 shadow-lg shadow-emerald-100/50 border border-gray-100"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-200/50"
              >
                {t('market_search_button')}
              </button>
            </div>
          </form>

          {/* Location Display */}
          <div className="flex items-center justify-center gap-2 mt-4 text-gray-500 text-sm">
            <MapPin className="w-4 h-4 text-emerald-500" />
            <span>{address || 'Berlin, Germany'}</span>
          </div>
        </div>
      </div>

      {/* Category Tags */}
      <div className="sticky top-[73px] z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 px-4">
        <div className="container mx-auto">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            <button className="px-5 py-2.5 rounded-full text-sm font-semibold bg-emerald-500 text-white shadow-md shadow-emerald-200/50 whitespace-nowrap">
              {t('market_all_markets')}
            </button>
            <button className="px-5 py-2.5 rounded-full text-sm font-medium bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors whitespace-nowrap border border-gray-200">
              {t('market_grocery')}
            </button>
            <button className="px-5 py-2.5 rounded-full text-sm font-medium bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors whitespace-nowrap border border-gray-200">
              {t('market_organic')}
            </button>
            <button className="px-5 py-2.5 rounded-full text-sm font-medium bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors whitespace-nowrap border border-gray-200">
              {t('market_fresh_produce')}
            </button>
            <button className="px-5 py-2.5 rounded-full text-sm font-medium bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors whitespace-nowrap border border-gray-200">
              {t('market_bakery')}
            </button>
            <button className="px-5 py-2.5 rounded-full text-sm font-medium bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors whitespace-nowrap border border-gray-200">
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
