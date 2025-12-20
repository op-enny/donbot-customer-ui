'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Clock, Star, MapPin, Phone, Search, SlidersHorizontal } from 'lucide-react';
import Image from 'next/image';
import { MenuItem } from '@/components/menu/MenuItem';
import { RestaurantHeaderSkeleton, MenuItemSkeleton } from '@/components/ui/skeleton';
import { restaurantsApi, type MenuWithCategories } from '@/lib/api';
import { useLocaleStore } from '@/lib/store/localeStore';

// Kategori emoji mapping
const categoryEmojis: Record<string, string> = {
  'Döner & Dürüm': '🥙',
  'Döner': '🥙',
  'Dürüm': '🌯',
  'Pizza': '🍕',
  'Burger': '🍔',
  'Pasta': '🍝',
  'Salate': '🥗',
  'Salat': '🥗',
  'Getränke': '🥤',
  'Desserts': '🍰',
  'Dessert': '🍰',
  'Vorspeisen': '🥟',
  'Suppen': '🍜',
  'Fleisch': '🥩',
  'Fisch': '🐟',
  'Vegetarisch': '🥬',
  'Vegan': '🌱',
  'Kinder': '👶',
  'Frühstück': '🍳',
  'Kebab': '🍢',
  'Lahmacun': '🫓',
  'Pide': '🫓',
  'Pommes': '🍟',
  'Beilagen': '🍟',
  'Extras': '✨',
  'Aktionen': '🔥',
  'Neu': '🆕',
  'Beliebt': '⭐',
  'Alle': '🍽️',
};

// Mock menu data - will be replaced with API call
const mockMenuData: MenuWithCategories = {
  restaurant: {
    id: '1',
    name: 'Limon Grillhaus',
    slug: 'limon-grillhaus',
    cuisine_type: 'Turkish Grill',
    rating: 4.7,
    logo_url: null,
    banner_image_url: null,
    phone: '+49 221 1234567',
    address: 'Musterstr. 12, 50667 Köln',
    delivery_time: '20-30 min',
    minimum_order: 15,
    delivery_fee: 2.5,
    is_open: true,
  },
  categories: [
    {
      name: 'Döner & Dürüm',
      items: [
        {
          id: '1',
          name: 'Dönertasche groß + Käse',
          description: 'Mit Salat, Tomaten, Zwiebeln und Soße nach Wahl',
          price: 8.0,
          image_url: null,
          category: 'Döner & Dürüm',
          is_available: true,
          is_active: true,
          is_popular: true,
        },
        {
          id: '2',
          name: 'Dönerteller',
          description: 'Mit Reis, Salat und Pommes',
          price: 12.0,
          image_url: null,
          category: 'Döner & Dürüm',
          is_available: true,
          is_active: true,
          is_popular: false,
        },
        {
          id: '3',
          name: 'Dürüm Spezial',
          description: 'Mit extra Fleisch und Käse',
          price: 9.5,
          image_url: null,
          category: 'Döner & Dürüm',
          is_available: true,
          is_active: true,
          is_popular: true,
        },
      ],
    },
    {
      name: 'Pizza',
      items: [
        {
          id: '4',
          name: 'Margherita',
          description: 'Tomatensoße, Mozzarella, Basilikum',
          price: 7.5,
          image_url: null,
          category: 'Pizza',
          is_available: true,
          is_active: true,
          is_popular: false,
        },
        {
          id: '5',
          name: 'Pizza Salami',
          description: 'Tomatensoße, Mozzarella, Salami',
          price: 9.0,
          image_url: null,
          category: 'Pizza',
          is_available: true,
          is_active: true,
          is_popular: true,
        },
        {
          id: '6',
          name: 'Pizza Quattro Formaggi',
          description: 'Vier Käsesorten',
          price: 10.5,
          image_url: null,
          category: 'Pizza',
          is_available: true,
          is_active: true,
          is_popular: false,
        },
      ],
    },
    {
      name: 'Getränke',
      items: [
        {
          id: '7',
          name: 'Cola 0.33l',
          description: 'Coca-Cola',
          price: 2.5,
          image_url: null,
          category: 'Getränke',
          is_available: true,
          is_active: true,
          is_popular: false,
        },
        {
          id: '8',
          name: 'Wasser 0.5l',
          description: 'Still oder Sprudel',
          price: 2.0,
          image_url: null,
          category: 'Getränke',
          is_available: true,
          is_active: true,
          is_popular: false,
        },
      ],
    },
  ],
};

const getCategoryId = (categoryName: string): string => {
  const normalized = categoryName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const slugified = normalized
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slugified || 'category';
};

export default function RestaurantMenuPage() {
  const params = useParams();
  const slugParam = params.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : (slugParam as string);
  const { locale, t } = useLocaleStore();

  const [menuData, setMenuData] = useState<MenuWithCategories | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Kategoriye emoji getiren yardımcı fonksiyon
  const getCategoryEmoji = (categoryName: string): string => {
    // Exact match
    if (categoryEmojis[categoryName]) return categoryEmojis[categoryName];

    // Partial match
    const lowerName = categoryName.toLowerCase();
    for (const [key, emoji] of Object.entries(categoryEmojis)) {
      if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
        return emoji;
      }
    }
    return '🍽️'; // Default emoji
  };

  // Filtrelenmiş kategoriler (arama sorgusu uygulanmış)
  const filteredCategories = useMemo(() => {
    if (!menuData?.categories || !searchQuery.trim()) {
      return menuData?.categories || [];
    }

    const query = searchQuery.toLowerCase().trim();

    return menuData.categories
      .map(category => ({
        ...category,
        items: category.items.filter(item =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
        )
      }))
      .filter(category => category.items.length > 0);
  }, [menuData?.categories, searchQuery]);

  useEffect(() => {
    let isMounted = true;

    const fetchMenu = async () => {
      try {
        const data = await restaurantsApi.getMenu(slug);

        if (!isMounted) return;

        if (!data || !Array.isArray(data.categories)) {
          throw new Error('Menu response missing categories');
        }

        setMenuData(data);
        const initialCategory = data.categories[0]?.name;
        setActiveCategoryId(initialCategory ? getCategoryId(initialCategory) : null);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to load menu:', err);
          // Only use mock data in development
          if (!isMounted) return;
          setError(t('menu_using_mock'));
          setMenuData(mockMenuData);
          const initialCategory = mockMenuData.categories[0]?.name;
          setActiveCategoryId(initialCategory ? getCategoryId(initialCategory) : null);
        } else {
          if (!isMounted) return;
          setError(t('menu_load_error'));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMenu();

    return () => {
      isMounted = false;
    };
  }, [slug, locale, t]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-8">
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <RestaurantHeaderSkeleton />
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <MenuItemSkeleton key={idx} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!menuData || !Array.isArray(menuData.categories)) {
    return (
      <div className="container mx-auto px-4 py-10">
        <p className="text-lg text-gray-700">{t('menu_not_available')}</p>
      </div>
    );
  }

  const { restaurant, categories } = menuData;

  return (
    <div className="min-h-screen pb-8">
      {/* Restaurant Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          {/* Banner Image */}
          <div className="relative w-full h-48 rounded-2xl mb-6 overflow-hidden">
            {restaurant.banner_image_url ? (
              <Image
                src={restaurant.banner_image_url}
                alt={`Banner image for ${restaurant.name}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-[#D32F2F] to-red-600 flex items-center justify-center">
                <span className="text-6xl">🍽️</span>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              {error}
            </div>
          )}

          {/* Restaurant Info */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {restaurant.name}
              </h1>
              <p className="text-gray-600 mb-3">{restaurant.cuisine_type}</p>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                {restaurant.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{restaurant.rating}</span>
                  </div>
                )}
                {restaurant.delivery_time && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{restaurant.delivery_time}</span>
                  </div>
                )}
                {restaurant.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{restaurant.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <div>
              {restaurant.is_open ? (
                <span className="bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-full">
                  {t('open')}
                </span>
              ) : (
                <span className="bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-full">
                  {t('closed')}
                </span>
              )}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="flex items-center gap-6 text-sm bg-gray-50 rounded-lg px-4 py-3">
            <div>
              <span className="text-gray-600">{t('min_order')}:</span>
              <span className="font-semibold ml-2">
                €{(restaurant.minimum_order ?? 0).toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">{t('delivery_fee')}:</span>
              <span className="font-semibold ml-2">
                {restaurant.delivery_fee && restaurant.delivery_fee > 0
                  ? `€${restaurant.delivery_fee.toFixed(2)}`
                  : t('free')}
              </span>
            </div>
            {restaurant.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-600" />
                <span className="font-medium">{restaurant.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar (Sticky) */}
      <div className="sticky top-[73px] z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 py-3 px-4">
        <div className="container mx-auto">
          <div className="relative flex items-center gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#D32F2F] flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-3.5 rounded-full bg-gray-50 border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all shadow-sm"
              />
            </div>
            {/* Filter Button (optional, for future use) */}
            <button className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
              <SlidersHorizontal className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs (Horizontal Scroll with Emoji) */}
      <div className="sticky top-[145px] z-30 bg-white border-b border-gray-100 py-3 px-4">
        <div className="container mx-auto">
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
            {/* "Tümü" butonu */}
            <button
              onClick={() => {
                setActiveCategoryId(null);
                setSearchQuery('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                activeCategoryId === null && !searchQuery
                  ? 'bg-[#D32F2F] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              <span>🍽️</span>
              <span>{t('all') || 'Tümü'}</span>
            </button>
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => {
                  const categoryId = getCategoryId(category.name);
                  setActiveCategoryId(categoryId);
                  document.getElementById(categoryId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  activeCategoryId === getCategoryId(category.name)
                    ? 'bg-[#D32F2F] text-white shadow-md'
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

      {/* Menu Items by Category */}
      <div className="container mx-auto px-4 py-6">
        {/* Arama sonuç mesajı */}
        {searchQuery && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-medium">&quot;{searchQuery}&quot;</span> {t('search_results') || 'için sonuçlar'}
              {filteredCategories.length === 0 && (
                <span className="block mt-1 text-gray-500">
                  {t('no_results') || 'Sonuç bulunamadı'}
                </span>
              )}
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm text-[#D32F2F] hover:underline"
            >
              {t('clear') || 'Temizle'}
            </button>
          </div>
        )}

        {(searchQuery ? filteredCategories : categories)?.map((category) => (
            <div key={category.name} id={getCategoryId(category.name)} className="mb-8 scroll-mt-48">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">{getCategoryEmoji(category.name)}</span>
                {category.name}
                <span className="text-sm font-normal text-gray-400 ml-2">
                  ({category.items?.length || 0})
                </span>
              </h2>

              {/* 2 kolon mobilde, 3 kolon tablette, 4 kolon desktopda */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {category.items?.map((item) => (
                  <MenuItem
                    key={item.id}
                    item={item}
                    restaurantId={restaurant.id}
                    restaurantName={restaurant.name}
                    restaurantSlug={restaurant.slug}
                    deliveryFee={restaurant.delivery_fee}
                    minimumOrder={restaurant.minimum_order}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
