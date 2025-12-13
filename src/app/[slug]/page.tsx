'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Clock, Star, MapPin, Phone } from 'lucide-react';
import Image from 'next/image';
import { MenuItem } from '@/components/menu/MenuItem';
import { restaurantsApi, type MenuWithCategories } from '@/lib/api';
import { useLocaleStore } from '@/lib/store/localeStore';

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

export default function RestaurantMenuPage() {
  const params = useParams();
  const slugParam = params.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : (slugParam as string);
  const { locale, t } = useLocaleStore();

  const [menuData, setMenuData] = useState<MenuWithCategories | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setActiveCategory(data.categories[0]?.name ?? null);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to load menu:', err);
          // Only use mock data in development
          if (!isMounted) return;
          setError('Using mock menu until the API is available.');
          setMenuData(mockMenuData);
          setActiveCategory(mockMenuData.categories[0]?.name ?? null);
        } else {
          if (!isMounted) return;
          setError('Unable to load menu. Please try again later.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMenu();

    return () => {
      isMounted = false;
    };
  }, [slug, locale]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="h-48 rounded-2xl bg-gray-100 animate-pulse mb-6" />
        <div className="h-6 w-48 bg-gray-100 animate-pulse rounded mb-2" />
        <div className="h-4 w-32 bg-gray-100 animate-pulse rounded mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!menuData || !Array.isArray(menuData.categories)) {
    return (
      <div className="container mx-auto px-4 py-10">
        <p className="text-lg text-gray-700">Menu not available.</p>
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

      {/* Category Tabs (Sticky) */}
      <div className="sticky top-[73px] z-40 bg-white border-b border-gray-200 py-4 px-4 shadow-sm">
        <div className="container mx-auto">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => {
                  setActiveCategory(category.name);
                  document.getElementById(category.name)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  activeCategory === category.name
                    ? 'bg-[#D32F2F] text-white shadow-md'
                    : 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items by Category */}
      <div className="container mx-auto px-4 py-6">
        {categories?.map((category) => (
            <div key={category.name} id={category.name} className="mb-8 scroll-mt-32">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {category.name}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.items?.map((item) => (
                  <MenuItem
                    key={item.id}
                    item={item}
                    restaurantId={restaurant.id}
                    restaurantName={restaurant.name}
                    restaurantSlug={restaurant.slug}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
