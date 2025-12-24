'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, MapPin, Star, Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Business } from '@/lib/api';

interface MarketCardProps {
  market: Business;
}

export function MarketCard({ market }: MarketCardProps) {
  const isOpen = true; // TODO: Calculate from business hours

  return (
    <Link href={`/${market.slug}`}>
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
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
              <span className="text-4xl">🛒</span>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <Badge
              variant={isOpen ? 'default' : 'secondary'}
              className={isOpen ? 'bg-green-600' : 'bg-gray-500'}
            >
              {isOpen ? 'Open' : 'Closed'}
            </Badge>
          </div>

          {/* Delivery Badge */}
          {market.has_delivery_slots && (
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className="bg-white/90">
                <Clock className="w-3 h-3 mr-1" />
                Scheduled Delivery
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
                    ? 'Free delivery'
                    : `€${market.delivery_fee.toFixed(2)} delivery`}
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
              Min. order: €{market.minimum_order.toFixed(2)}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
