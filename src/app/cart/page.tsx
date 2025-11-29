'use client';

import { useCartStore } from '@/lib/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const { items, restaurantName, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore();

  const totalPrice = getTotalPrice();
  const deliveryFee = 2.5; // TODO: Get from restaurant settings
  const grandTotal = totalPrice + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">
            Add some delicious items from our restaurants to get started!
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#D32F2F] hover:bg-red-700 text-white font-bold px-8 py-4 rounded-full transition-colors shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-[73px] z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
              <p className="text-sm text-gray-600">
                from <span className="font-semibold">{restaurantName}</span>
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
                  <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
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
                        🍽️
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>

                    {/* Selected Options */}
                    {Object.entries(item.options).map(([groupKey, selectedIds]) => {
                      if (selectedIds.length === 0) return null;
                      return (
                        <p key={groupKey} className="text-xs text-gray-600 mb-1">
                          <span className="font-medium capitalize">{groupKey}:</span>{' '}
                          {selectedIds.join(', ')}
                        </p>
                      );
                    })}

                    {/* Special Instructions */}
                    {item.specialInstructions && (
                      <p className="text-xs text-gray-600 italic">
                        Note: {item.specialInstructions}
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
                        <p className="text-base font-bold text-[#D32F2F]">
                          €{(item.price * item.quantity).toFixed(2)}
                        </p>
                        {item.quantity > 1 && (
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
              <span>Subtotal</span>
              <span className="font-medium">€{totalPrice.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Delivery Fee</span>
              <span className="font-medium">€{deliveryFee.toFixed(2)}</span>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span className="text-[#D32F2F]">€{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <Link
            href="/checkout"
            className="block w-full bg-[#D32F2F] hover:bg-red-700 text-white font-bold text-center py-4 rounded-full transition-colors shadow-lg"
          >
            Proceed to Checkout
          </Link>

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
