'use client';

import { useState, useEffect } from 'react';
import { useMarketCartStore } from '@/lib/store/marketCartStore';
import { useLocaleStore, translations } from '@/lib/store/localeStore';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, Snowflake, Thermometer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function MarketCartPage() {
  const [mounted, setMounted] = useState(false);
  const {
    items,
    marketName,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalPrice,
    getDeliveryFee,
    getMinimumOrder,
  } = useMarketCartStore();
  const { locale } = useLocaleStore();
  const t = translations[locale];

  const totalPrice = getTotalPrice();
  const deliveryFee = getDeliveryFee();
  const minimumOrder = getMinimumOrder();
  const grandTotal = totalPrice + deliveryFee;
  const isBelowMinimum = totalPrice < minimumOrder;

  useEffect(() => {
    const timeoutId = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeoutId);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-green-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">
            Start shopping from your favorite local markets
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-full transition-colors shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Browse Markets
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (item: typeof items[0]) => {
    if (item.unit_type !== 'piece' && item.unit_quantity) {
      return (item.price * item.unit_quantity).toFixed(2);
    }
    return (item.price * item.quantity).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-[73px] z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
              <p className="text-sm text-gray-600">
                From <span className="font-semibold text-green-600">{marketName}</span>
              </p>
            </div>

            <button
              onClick={clearCart}
              className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cart
            </button>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6">
          <div className="divide-y divide-gray-200">
            {items.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex gap-4">
                  {/* Item Image */}
                  <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 relative">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        🛍️
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1">
                    {item.brand && (
                      <p className="text-xs text-gray-500 mb-0.5">{item.brand}</p>
                    )}
                    <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>

                    {/* Unit Type Display */}
                    {item.unit_type !== 'piece' && (
                      <p className="text-xs text-gray-600 mb-1">
                        €{item.price.toFixed(2)}/{item.unit_type}
                        {item.unit_quantity && (
                          <span className="ml-1">
                            x {item.unit_quantity} {item.unit_type}
                          </span>
                        )}
                      </p>
                    )}

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <span className="text-base font-semibold text-gray-900 w-8 text-center">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-base font-bold text-green-600">
                          €{formatPrice(item)}
                        </p>
                        {item.quantity > 1 && item.unit_type === 'piece' && (
                          <p className="text-xs text-gray-500">
                            €{item.price.toFixed(2)} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal ({items.length} items)</span>
              <span className="font-medium">€{totalPrice.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Delivery Fee</span>
              <span className="font-medium">
                {deliveryFee === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  `€${deliveryFee.toFixed(2)}`
                )}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span className="text-green-600">€{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Minimum Order Warning */}
          {isBelowMinimum && minimumOrder > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-sm text-yellow-800">
                Minimum order is <span className="font-bold">€{minimumOrder.toFixed(2)}</span>.
                Add <span className="font-bold">€{(minimumOrder - totalPrice).toFixed(2)}</span> more to checkout.
              </p>
            </div>
          )}

          {/* Delivery Slot Note */}
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-800">
              You&apos;ll select a delivery time slot on the next step
            </p>
          </div>

          {/* Checkout Button */}
          {isBelowMinimum && minimumOrder > 0 ? (
            <button
              disabled
              className="block w-full bg-gray-300 text-gray-500 font-bold text-center py-4 rounded-full cursor-not-allowed"
            >
              Add €{(minimumOrder - totalPrice).toFixed(2)} more
            </button>
          ) : (
            <Link
              href="/checkout"
              className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold text-center py-4 rounded-full transition-colors shadow-lg"
            >
              Continue to Checkout
            </Link>
          )}

          {/* Continue Shopping */}
          <Link
            href="/"
            className="block w-full text-center text-gray-600 hover:text-gray-900 font-medium py-3 mt-3"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
