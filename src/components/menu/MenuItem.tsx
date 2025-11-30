'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { ItemModal } from './ItemModal';

interface MenuItemProps {
  item: {
    id: string;
    name: string;
    description?: string;
    price: number;
    image_url: string | null;
    category: string;
    is_available: boolean;
    is_popular?: boolean;
  };
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
}

export function MenuItem({ item, restaurantId, restaurantName, restaurantSlug }: MenuItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!item.is_available) return null;

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group border border-gray-100"
      >
        {/* Item Image */}
        <div className="relative w-full aspect-[4/3] bg-gray-100">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-5xl">🍽️</span>
            </div>
          )}

          {/* Popular Badge */}
          {item.is_popular && (
            <div className="absolute top-3 left-3 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              🔥 Popular
            </div>
          )}

          {/* Add Button */}
          <div className="absolute bottom-3 right-3 bg-[#D32F2F] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
        </div>

        {/* Item Info */}
        <div className="p-4">
          <h3 className="font-semibold text-base text-gray-900 mb-1 line-clamp-1 group-hover:text-[#D32F2F] transition-colors">
            {item.name}
          </h3>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {item.description || 'Keine Beschreibung verfügbar'}
          </p>

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-[#D32F2F]">
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
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
