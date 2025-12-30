'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, MapPin, Star, Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocaleStore } from '@/lib/store/localeStore';
import type { Business } from '@/lib/api';

interface MarketCardProps {
  market: Business;
}

// Generate consistent color based on market name
function getMarketColor(name: string): { from: string; to: string; text: string } {
  const colors = [
    { from: 'from-emerald-400', to: 'to-teal-500', text: 'text-white' },
    { from: 'from-cyan-400', to: 'to-blue-500', text: 'text-white' },
    { from: 'from-violet-400', to: 'to-purple-500', text: 'text-white' },
    { from: 'from-rose-400', to: 'to-pink-500', text: 'text-white' },
    { from: 'from-amber-400', to: 'to-orange-500', text: 'text-white' },
    { from: 'from-lime-400', to: 'to-green-500', text: 'text-white' },
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

// Food pattern SVG as background
function FoodPatternBackground({ patternId }: { patternId: string }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.12]"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id={patternId} x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <text x="2" y="14" fontSize="12">🥬</text>
          <text x="16" y="14" fontSize="12">🍞</text>
          <text x="2" y="28" fontSize="12">🥩</text>
          <text x="16" y="28" fontSize="12">🧀</text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

export function MarketCard({ market }: MarketCardProps) {
  const { t } = useLocaleStore();
  const isOpen = true; // TODO: Calculate from business hours
  const initial = market.name.charAt(0).toUpperCase();
  const colorScheme = getMarketColor(market.name);

  return (
    <Link href={`/market/${market.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        {/* Image Section */}
        <div className="relative h-40 bg-gray-100">
          {market.logo_url ? (
            <Image
              src={market.logo_url}
              alt={market.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${colorScheme.from} ${colorScheme.to} relative overflow-hidden`}>
              {/* Food pattern background */}
              <FoodPatternBackground patternId={`foodPattern-${market.id}`} />
              {/* Market initial */}
              <span className={`text-6xl font-bold ${colorScheme.text} drop-shadow-lg relative z-10`}>
                {initial}
              </span>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <Badge
              variant={isOpen ? 'default' : 'secondary'}
              className={isOpen ? 'bg-emerald-500 shadow-md' : 'bg-gray-500'}
            >
              {isOpen ? t('open') : t('closed')}
            </Badge>
          </div>

          {/* Delivery Badge */}
          {market.has_delivery_slots && (
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className="bg-white/90">
                <Clock className="w-3 h-3 mr-1" />
                {t('delivery')}
              </Badge>
            </div>
          )}
        </div>

        {/* Content Section */}
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">
            {market.name}
          </h3>

          {market.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {market.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {/* Rating */}
            {market.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span>{market.rating.toFixed(1)}</span>
              </div>
            )}

            {/* Delivery Info */}
            {market.delivery_fee !== undefined && (
              <div className="flex items-center gap-1">
                <Truck className="w-4 h-4" />
                <span>
                  {market.delivery_fee === 0
                    ? t('free_delivery')
                    : `€${market.delivery_fee.toFixed(2)} ${t('delivery_fee')}`}
                </span>
              </div>
            )}

            {/* Distance */}
            {market.distance !== undefined && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{market.distance.toFixed(1)} km</span>
              </div>
            )}
          </div>

          {/* Minimum Order */}
          {market.minimum_order && market.minimum_order > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {t('min_order')}: €{market.minimum_order.toFixed(2)}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
