import Link from 'next/link';
import Image from 'next/image';
import { Clock, Star, Euro } from 'lucide-react';
import type { Restaurant } from '@/lib/api';
import { useLocaleStore } from '@/lib/store/localeStore';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const { t } = useLocaleStore();
  const {
    slug,
    name,
    logo_url,
    cuisine_type,
    rating = 4.5,
    delivery_time = '20-30 min',
    minimum_order = 15,
    delivery_fee = 2.5,
    is_open = true,
    distance,
  } = restaurant;

  return (
    <Link href={`/${slug}`}>
      <div className="restaurant-card group cursor-pointer">
        {/* Restaurant Image */}
        <div className="relative w-full aspect-[4/3] bg-secondary">
          {logo_url ? (
            <Image
              src={logo_url}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-4xl">🍽️</span>
            </div>
          )}

          {/* Minimum Order Badge (Price Badge) */}
          <div className="absolute top-3 right-3 bg-[#D32F2F] text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
            €{minimum_order.toFixed(2)}
          </div>

          {/* Open/Closed Status */}
          <div className="absolute bottom-2 left-2">
            {is_open ? (
              <span className="status-badge-open">{t('open')}</span>
            ) : (
              <span className="status-badge-closed">{t('closed')}</span>
            )}
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
              {name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Cuisine Type */}
          {cuisine_type && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
              {cuisine_type}
            </p>
          )}

          {/* Delivery Info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{delivery_time}</span>
            </div>

            <div className="flex items-center gap-1">
              <Euro className="w-3.5 h-3.5" />
              <span>{delivery_fee > 0 ? `€${delivery_fee.toFixed(2)}` : t('free')}</span>
            </div>

            {distance && (
              <span>
                {distance < 1
                  ? `${Math.round(distance * 1000)}m`
                  : `${distance.toFixed(1)}km`}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
