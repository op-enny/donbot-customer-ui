'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Star } from 'lucide-react';
import { ItemModal } from './ItemModal';
import { useLocaleStore } from '@/lib/store/localeStore';

interface MenuItemProps {
  item: {
    id: string;
    name: string;
    description?: string;
    price: number;
    image_url: string | null;
    category: string;
    is_available?: boolean;
    is_active?: boolean;
    is_popular?: boolean;
    rating?: number;
  };
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  deliveryFee?: number;
  minimumOrder?: number;
}

export function MenuItem({ item, restaurantId, restaurantName, restaurantSlug, deliveryFee, minimumOrder }: MenuItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useLocaleStore();

  // Check availability (support both fields for compatibility)
  const isAvailable = item.is_available ?? item.is_active ?? true;

  if (!isAvailable) return null;

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group border border-gray-100 active:scale-[0.98]"
      >
        {/* Item Image - Mobilde daha kompakt */}
        <div className="relative w-full aspect-square sm:aspect-[4/3] bg-gray-50">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 480px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <span className="text-4xl sm:text-5xl opacity-60">🍽️</span>
            </div>
          )}

          {/* Popular Badge - Mobilde daha küçük */}
          {item.is_popular && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
              <span className="hidden sm:inline">🔥</span>
              <span>{t('popular')}</span>
            </div>
          )}

          {/* Add Button - Her zaman görünür */}
          <button
            className="absolute bottom-2 right-2 bg-[#D32F2F] text-white h-8 w-8 sm:h-9 sm:w-auto sm:px-3 rounded-full flex items-center justify-center gap-1.5 shadow-lg group-hover:scale-110 active:scale-95 transition-transform"
            aria-label={`${t('customize_order')}: ${item.name}`}
            title={t('customize_order')}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline text-[11px] font-semibold leading-none">
              {t('customize_order')}
            </span>
          </button>
        </div>

        {/* Item Info - Mobilde daha kompakt */}
        <div className="p-2.5 sm:p-4">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-0.5 sm:mb-1 line-clamp-2 group-hover:text-[#D32F2F] transition-colors leading-tight">
            {item.name}
          </h3>

          {/* Açıklama - Sadece tablet ve üstünde */}
          <p className="hidden sm:block text-xs sm:text-sm text-gray-500 mb-2 line-clamp-2">
            {item.description || t('no_description')}
          </p>

          {/* Alt bilgi - Fiyat ve Rating */}
          <div className="flex items-center justify-between mt-1.5 sm:mt-2">
            {/* Rating (varsa) veya kategori etiketi */}
            {item.rating ? (
              <div className="flex items-center gap-1 text-gray-500">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-xs sm:text-sm font-medium">{item.rating.toFixed(1)}</span>
              </div>
            ) : (
              <span className="text-[10px] sm:text-xs text-gray-400 truncate max-w-[60px] sm:max-w-none">
                {item.category}
              </span>
            )}

            {/* Fiyat */}
            <span className="text-sm sm:text-lg font-bold text-[#D32F2F]">
              €{item.price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Item Modal for Customization */}
      {isModalOpen && (
        <ItemModal
          item={item}
          restaurantId={restaurantId}
          restaurantName={restaurantName}
          restaurantSlug={restaurantSlug}
          deliveryFee={deliveryFee}
          minimumOrder={minimumOrder}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
