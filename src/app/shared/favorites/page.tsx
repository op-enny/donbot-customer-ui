'use client';

import { useState, useEffect } from 'react';
import { Heart, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocaleStore } from '@/lib/store/localeStore';

export default function FavoritesPage() {
  const [mounted, setMounted] = useState(false);
  const { t } = useLocaleStore();

  useEffect(() => {
    const timeoutId = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeoutId);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  // Mock data - will be replaced with actual favorites from localStorage
  const favorites = [
    {
      id: '1',
      slug: 'limon-grillhaus',
      name: 'Limon Grillhaus',
      cuisine: 'Turkish Grill',
      rating: 4.5,
      deliveryTime: '20-30 min',
      deliveryFee: 0,
      imageUrl: 'https://res.cloudinary.com/dkeuzp87n/image/upload/v1764360634/lsdw6tjfbf6cxojvyxpb.png',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('favorites')}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {favorites.length} {favorites.length === 1 ? t('restaurant_singular') : t('restaurant_plural')} {t('saved')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t('no_favorites')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('save_favorites_hint')}
            </p>
            <Link
              href="/"
              className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-full transition-colors"
            >
              {t('browse_restaurants')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/${restaurant.slug}`}
                className="block bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-4 p-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0 overflow-hidden relative">
                    {restaurant.imageUrl ? (
                      <Image
                        src={restaurant.imageUrl}
                        alt={`Logo of ${restaurant.name}`}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        🍴
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg truncate">
                          {restaurant.name}
                        </h3>
                        <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Heart className="w-5 h-5 text-primary fill-primary" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium">{restaurant.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{restaurant.deliveryTime}</span>
                      </div>
                      {restaurant.deliveryFee === 0 ? (
                        <div className="flex items-center gap-1 text-green-600 font-medium">
                          <MapPin className="w-4 h-4" />
                          <span>{t('free_delivery')}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>€{restaurant.deliveryFee.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
