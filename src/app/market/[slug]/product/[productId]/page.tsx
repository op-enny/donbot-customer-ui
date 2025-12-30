'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Minus,
  ShoppingCart,
  Snowflake,
  Thermometer,
  Package,
  MapPin,
  Check,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMarketCartStore } from '@/lib/store/marketCartStore';
import { useLocaleStore } from '@/lib/store/localeStore';
import {
  businessesApi,
  type Business,
  type Product,
  type BusinessMenuWithCategories,
} from '@/lib/api';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLocaleStore();

  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string);
  const productId = Array.isArray(params.productId)
    ? params.productId[0]
    : (params.productId as string);

  const [market, setMarket] = useState<Business | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const addItem = useMarketCartStore((state) => state.addItem);
  const cartItems = useMarketCartStore((state) => state.items);

  // Check if product is already in cart
  const cartItem = cartItems.find((item) => item.menuItemId === productId);
  const cartQuantity = cartItem?.quantity || 0;

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch market and menu data
        const [businessData, menuData] = await Promise.all([
          businessesApi.getBusiness(slug),
          businessesApi.getMenu(slug),
        ]);

        if (!isMounted) return;

        setMarket(businessData);

        // Find the product in the menu
        const foundProduct = menuData.categories
          .flatMap((cat) => cat.items)
          .find((item) => item.id === productId);

        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load product:', err);
        setError('Failed to load product');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [slug, productId]);

  const handleAddToCart = () => {
    if (!product || !market) return;

    addItem(
      {
        menuItemId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image_url: product.image_url,
        unit_type: product.marketDetails?.unit_type || 'piece',
        brand: product.marketDetails?.brand,
        barcode: product.marketDetails?.barcode,
      },
      {
        marketId: market.id,
        marketName: market.name,
        marketSlug: market.slug,
      }
    );

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const isOutOfStock =
    product?.marketDetails && product.marketDetails.stock_quantity <= 0;
  const isLowStock =
    product?.marketDetails &&
    product.marketDetails.stock_quantity > 0 &&
    product.marketDetails.stock_quantity <= product.marketDetails.low_stock_threshold;

  const formatPrice = () => {
    if (!product) return '';
    if (
      product.marketDetails?.unit_type &&
      product.marketDetails.unit_type !== 'piece'
    ) {
      return `€${product.price.toFixed(2)}/${product.marketDetails.unit_type}`;
    }
    return `€${product.price.toFixed(2)}`;
  };

  const getStorageBadge = () => {
    if (!product?.marketDetails) return null;

    switch (product.marketDetails.storage_type) {
      case 'frozen':
        return (
          <Badge className="bg-blue-600 text-white">
            <Snowflake className="w-3 h-3 mr-1" />
            Frozen
          </Badge>
        );
      case 'chilled':
        return (
          <Badge className="bg-cyan-500 text-white">
            <Thermometer className="w-3 h-3 mr-1" />
            Chilled
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-32">
        {/* Header Skeleton */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-6 w-24" />
          </div>
        </div>

        {/* Image Skeleton */}
        <div className="bg-white">
          <Skeleton className="w-full h-72" />
        </div>

        {/* Content Skeleton */}
        <div className="container mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (error || !product || !market) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-lg text-gray-600 mb-4">{error || 'Product not found'}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('back')}</span>
          </button>
        </div>
      </div>

      {/* Product Image */}
      <div className="bg-white">
        <div className="relative w-full h-72 md:h-96">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
              <span className="text-8xl">🛍️</span>
            </div>
          )}

          {/* Status badges */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {isOutOfStock && (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
            {isLowStock && (
              <Badge className="bg-orange-500 text-white">
                Only {product.marketDetails?.stock_quantity} left
              </Badge>
            )}
            {getStorageBadge()}
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          {/* Brand */}
          {product.marketDetails?.brand && (
            <p className="text-sm text-gray-500 font-medium">
              {product.marketDetails.brand}
            </p>
          )}

          {/* Name */}
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

          {/* Price */}
          <p className="text-3xl font-bold text-green-600">{formatPrice()}</p>

          {/* VAT Info */}
          {product.vat_rate && (
            <p className="text-xs text-gray-400">
              incl. {product.vat_rate.rate}% VAT
            </p>
          )}

          {/* Description */}
          {product.description && (
            <div className="pt-4 border-t">
              <h3 className="font-semibold text-gray-900 mb-2">{t('description')}</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}

          {/* Product Details */}
          <div className="pt-4 border-t space-y-3">
            <h3 className="font-semibold text-gray-900">{t('details')}</h3>

            {product.category && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t('category')}</span>
                <span className="font-medium">{product.category}</span>
              </div>
            )}

            {product.marketDetails?.unit_type && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t('unit')}</span>
                <span className="font-medium capitalize">
                  {product.marketDetails.unit_type}
                </span>
              </div>
            )}

            {product.marketDetails?.origin_country && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t('origin')}</span>
                <span className="font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {product.marketDetails.origin_country}
                </span>
              </div>
            )}

            {product.marketDetails?.barcode && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">EAN</span>
                <span className="font-mono text-xs">
                  {product.marketDetails.barcode}
                </span>
              </div>
            )}

            {product.marketDetails && product.marketDetails.stock_quantity > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t('availability')}</span>
                <span className="font-medium text-green-600 flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  In Stock ({product.marketDetails.stock_quantity})
                </span>
              </div>
            )}
          </div>

          {/* Market info */}
          <div className="pt-4 border-t">
            <Link
              href={`/market/${market.slug}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              {market.logo_url ? (
                <Image
                  src={market.logo_url}
                  alt={market.name}
                  width={48}
                  height={48}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <span className="text-xl">🏪</span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{market.name}</p>
                <p className="text-sm text-gray-500">{t('view_all_products')}</p>
              </div>
            </Link>
          </div>

          {/* Already in cart notice */}
          {cartQuantity > 0 && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl text-green-700">
              <Check className="w-4 h-4" />
              <span className="text-sm">
                {cartQuantity} {cartQuantity === 1 ? 'item' : 'items'} in cart
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Add to Cart */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t shadow-lg p-4 z-40">
        <div className="container mx-auto flex items-center gap-4">
          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="flex items-center border rounded-xl bg-gray-50">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-3 hover:bg-gray-100 rounded-l-xl"
                disabled={quantity <= 1}
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="px-6 text-lg font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-3 hover:bg-gray-100 rounded-r-xl"
                disabled={
                  product.marketDetails &&
                  quantity >= product.marketDetails.stock_quantity
                }
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 h-14 text-lg font-semibold ${
              addedToCart
                ? 'bg-green-600 hover:bg-green-600'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isOutOfStock ? (
              'Out of Stock'
            ) : addedToCart ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Added!
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart · €{(product.price * quantity).toFixed(2)}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
