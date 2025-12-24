'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus, Snowflake, Thermometer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMarketCartStore } from '@/lib/store/marketCartStore';
import type { Product } from '@/lib/api';

interface ProductCardProps {
  product: Product;
  marketId: string;
  marketName: string;
  marketSlug: string;
}

export function ProductCard({
  product,
  marketId,
  marketName,
  marketSlug,
}: ProductCardProps) {
  const { marketDetails } = product;
  const isOutOfStock = marketDetails && marketDetails.stock_quantity <= 0;
  const isLowStock = marketDetails && marketDetails.stock_quantity > 0 && marketDetails.stock_quantity <= marketDetails.low_stock_threshold;

  const [quantity, setQuantity] = useState(1);
  const addItem = useMarketCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(
      {
        menuItemId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image_url: product.image_url,
        unit_type: marketDetails?.unit_type || 'piece',
        brand: marketDetails?.brand,
        barcode: marketDetails?.barcode,
      },
      {
        marketId,
        marketName,
        marketSlug,
      }
    );
    setQuantity(1); // Reset quantity after adding
  };

  const getStorageIcon = () => {
    if (!marketDetails) return null;

    switch (marketDetails.storage_type) {
      case 'frozen':
        return (
          <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
            <Snowflake className="w-3 h-3 mr-1" />
            Frozen
          </Badge>
        );
      case 'chilled':
        return (
          <Badge className="absolute top-2 left-2 bg-cyan-500 text-white">
            <Thermometer className="w-3 h-3 mr-1" />
            Chilled
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatPrice = () => {
    if (marketDetails?.unit_type && marketDetails.unit_type !== 'piece') {
      return `€${product.price.toFixed(2)}/${marketDetails.unit_type}`;
    }
    return `€${product.price.toFixed(2)}`;
  };

  return (
    <Card className={`overflow-hidden h-full ${isOutOfStock ? 'opacity-60' : ''}`}>
      {/* Image Section */}
      <div className="relative h-36 bg-gray-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
            <span className="text-3xl">🛍️</span>
          </div>
        )}

        {/* Storage type badge */}
        {getStorageIcon()}

        {/* Stock badge */}
        {isOutOfStock && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Out of Stock
          </Badge>
        )}
        {isLowStock && (
          <Badge className="absolute top-2 right-2 bg-orange-500 text-white">
            Only {marketDetails?.stock_quantity} left
          </Badge>
        )}
      </div>

      {/* Content Section */}
      <CardContent className="p-3">
        {/* Brand */}
        {marketDetails?.brand && (
          <p className="text-xs text-muted-foreground mb-1">{marketDetails.brand}</p>
        )}

        {/* Name */}
        <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>

        {/* Price */}
        <p className="font-bold text-green-700 mb-3">{formatPrice()}</p>

        {/* Quantity & Add to Cart */}
        {!isOutOfStock ? (
          <div className="flex items-center gap-2">
            {/* Quantity Selector */}
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-1.5 hover:bg-gray-100"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-3 text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-1.5 hover:bg-gray-100"
                disabled={marketDetails && quantity >= marketDetails.stock_quantity}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add Button */}
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        ) : (
          <Button disabled className="w-full" variant="secondary">
            Out of Stock
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
