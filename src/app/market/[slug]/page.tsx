'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Clock, Star, MapPin, Phone, Search, SlidersHorizontal, Truck } from 'lucide-react';
import { ProductCard } from '@/components/market/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  businessesApi,
  type Business,
  type Product,
  type BusinessMenuWithCategories,
} from '@/lib/api';
import { useLocaleStore } from '@/lib/store/localeStore';

// Category emoji mapping for markets
const categoryEmojis: Record<string, string> = {
  'Fruits': '🍎',
  'Vegetables': '🥬',
  'Dairy': '🥛',
  'Meat': '🥩',
  'Fish': '🐟',
  'Bakery': '🍞',
  'Frozen': '🧊',
  'Drinks': '🥤',
  'Snacks': '🍿',
  'Household': '🧹',
  'Personal Care': '🧴',
  'Baby': '👶',
  'Pet': '🐕',
  'All': '🛒',
};

function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Skeleton className="h-36 w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}

function MarketHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

const getCategoryId = (categoryName: string): string => {
  const normalized = categoryName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const slugified = normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return slugified || 'category';
};

export default function MarketProductsPage() {
  const [mounted, setMounted] = useState(false);
  const params = useParams();
  const slugParam = params.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : (slugParam as string);
  const { t } = useLocaleStore();

  const [market, setMarket] = useState<Business | null>(null);
  const [menuData, setMenuData] = useState<BusinessMenuWithCategories | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const getCategoryEmoji = (categoryName: string): string => {
    if (categoryEmojis[categoryName]) return categoryEmojis[categoryName];
    const lowerName = categoryName.toLowerCase();
    for (const [key, emoji] of Object.entries(categoryEmojis)) {
      if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
        return emoji;
      }
    }
    return '🛍️';
  };

  // Filter products based on search and stock
  const filteredCategories = useMemo(() => {
    if (!menuData?.categories) return [];

    let categories = menuData.categories;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      categories = categories
        .map((category) => ({
          ...category,
          items: category.items.filter(
            (item) =>
              item.name.toLowerCase().includes(query) ||
              item.description?.toLowerCase().includes(query) ||
              item.marketDetails?.brand?.toLowerCase().includes(query)
          ),
        }))
        .filter((category) => category.items.length > 0);
    }

    // Filter by stock
    if (showInStockOnly) {
      categories = categories
        .map((category) => ({
          ...category,
          items: category.items.filter(
            (item) => !item.marketDetails || item.marketDetails.stock_quantity > 0
          ),
        }))
        .filter((category) => category.items.length > 0);
    }

    return categories;
  }, [menuData?.categories, searchQuery, showInStockOnly]);

  useEffect(() => {
    let isMounted = true;

    const fetchMarketData = async () => {
      try {
        // Fetch market info and menu in parallel
        const [businessData, menu] = await Promise.all([
          businessesApi.getBusiness(slug),
          businessesApi.getMenu(slug),
        ]);

        if (!isMounted) return;

        setMarket(businessData);
        setMenuData(menu);

        const initialCategory = menu.categories[0]?.name;
        setActiveCategoryId(initialCategory ? getCategoryId(initialCategory) : null);
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load market:', err);
        setError('Failed to load market. Please try again.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (mounted) {
      fetchMarketData();
    }

    return () => {
      isMounted = false;
    };
  }, [slug, mounted]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen pb-8">
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <MarketHeaderSkeleton />
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !market || !menuData) {
    return (
      <div className="container mx-auto px-4 py-10">
        <p className="text-lg text-gray-700">{error || 'Market not found'}</p>
      </div>
    );
  }

  const categories = menuData.categories;

  return (
    <div className="min-h-screen pb-8">
      {/* Market Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          {/* Banner Image */}
          <div className="relative w-full h-48 rounded-2xl mb-6 overflow-hidden">
            {market.banner_image_url ? (
              <Image
                src={market.banner_image_url}
                alt={`Banner for ${market.name}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center">
                <span className="text-6xl">🛒</span>
              </div>
            )}
          </div>

          {/* Market Info */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{market.name}</h1>
              {market.description && (
                <p className="text-gray-600 mb-3">{market.description}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-600">
                {market.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{market.rating}</span>
                  </div>
                )}
                {market.delivery_time && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{market.delivery_time}</span>
                  </div>
                )}
                {market.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{market.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex flex-col gap-2">
              <Badge className="bg-green-600">Open</Badge>
              {market.has_delivery_slots && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Scheduled
                </Badge>
              )}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="flex items-center gap-6 text-sm bg-green-50 rounded-lg px-4 py-3">
            <div>
              <span className="text-gray-600">Min. order:</span>
              <span className="font-semibold ml-2">
                €{(market.minimum_order ?? 0).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Truck className="w-4 h-4 text-gray-600" />
              <span className="text-gray-600">Delivery:</span>
              <span className="font-semibold ml-1">
                {market.delivery_fee && market.delivery_fee > 0
                  ? `€${market.delivery_fee.toFixed(2)}`
                  : 'Free'}
              </span>
            </div>
            {market.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-600" />
                <span className="font-medium">{market.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="sticky top-[73px] z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 py-3 px-4">
        <div className="container mx-auto">
          <div className="relative flex items-center gap-3">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-green-600 flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
              <input
                type="text"
                placeholder="Search products, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-3.5 rounded-full bg-gray-50 border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm"
              />
            </div>
            <button
              onClick={() => setShowInStockOnly(!showInStockOnly)}
              className={`px-4 py-3.5 rounded-full border text-sm font-medium transition-colors ${
                showInStockOnly
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              In Stock
            </button>
            <button className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
              <SlidersHorizontal className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="sticky top-[145px] z-30 bg-white border-b border-gray-100 py-3 px-4">
        <div className="container mx-auto">
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => {
                setActiveCategoryId(null);
                setSearchQuery('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                activeCategoryId === null && !searchQuery
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              <span>🛒</span>
              <span>All</span>
            </button>
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => {
                  const categoryId = getCategoryId(category.name);
                  setActiveCategoryId(categoryId);
                  document
                    .getElementById(categoryId)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  activeCategoryId === getCategoryId(category.name)
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <span>{getCategoryEmoji(category.name)}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products by Category */}
      <div className="container mx-auto px-4 py-6">
        {/* Search results message */}
        {searchQuery && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-medium">&quot;{searchQuery}&quot;</span> results
              {filteredCategories.length === 0 && (
                <span className="block mt-1 text-gray-500">No products found</span>
              )}
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm text-green-600 hover:underline"
            >
              Clear
            </button>
          </div>
        )}

        {(searchQuery ? filteredCategories : categories).map((category) => (
          <div
            key={category.name}
            id={getCategoryId(category.name)}
            className="mb-8 scroll-mt-48"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">{getCategoryEmoji(category.name)}</span>
              {category.name}
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({category.items?.length || 0})
              </span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {category.items?.map((item: Product) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  marketId={market.id}
                  marketName={market.name}
                  marketSlug={market.slug}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredCategories.length === 0 && searchQuery && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-muted-foreground mb-2">No products found</p>
            <p className="text-sm text-muted-foreground">
              Try a different search term or browse categories
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
