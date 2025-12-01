'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cartStore';
import { ordersApi } from '@/lib/api';
import { ArrowLeft, CreditCard, Wallet, Smartphone, MapPin, User, Phone, Mail, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { items, restaurantId, restaurantName, restaurantSlug, getTotalPrice, clearCart } = useCartStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryMethod: 'pickup' as 'pickup' | 'delivery',
    deliveryAddress: '',
    paymentMethod: 'cash_on_delivery' as 'cash_on_delivery' | 'card_on_delivery' | 'online',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const totalPrice = getTotalPrice();
  const deliveryFee = formData.deliveryMethod === 'delivery' ? 2.5 : 0;
  const grandTotal = totalPrice + deliveryFee;

  // Wait for client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if cart is empty (only after mount)
  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push('/cart');
    }
  }, [mounted, items.length, router]);

  // Show loading during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D32F2F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Return null while redirecting
  if (items.length === 0) {
    return null;
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      errors.customerName = 'Name is required';
    }

    if (!formData.customerPhone.trim()) {
      errors.customerPhone = 'Phone number is required';
    } else if (!/^\+?[0-9\s-]{10,}$/.test(formData.customerPhone)) {
      errors.customerPhone = 'Invalid phone number';
    }

    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      errors.customerEmail = 'Invalid email address';
    }

    if (formData.deliveryMethod === 'delivery' && !formData.deliveryAddress.trim()) {
      errors.deliveryAddress = 'Delivery address is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // If starts with +49, format as +49 XXX XXXXXXX
    if (cleaned.startsWith('+49')) {
      cleaned = cleaned.replace(/^\+49(\d{3})(\d+)/, '+49 $1 $2');
    } else if (cleaned.startsWith('0049')) {
      // Convert 0049 to +49
      cleaned = cleaned.replace(/^0049(\d{3})(\d+)/, '+49 $1 $2');
    } else if (cleaned.startsWith('0')) {
      // Convert 0171... to +49 171...
      cleaned = cleaned.replace(/^0(\d{3})(\d+)/, '+49 $1 $2');
    }

    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order items for API
      const orderItems = items.map((item) => ({
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        options: item.options,
        special_instructions: item.specialInstructions,
      }));

      // Generate idempotency key
      const idempotencyKey = `${Date.now()}-${Math.random()}`;

      const targetSlug = restaurantSlug || 'limon-grillhaus';

      // Format phone number for German validation
      const formattedPhone = formatPhoneNumber(formData.customerPhone);
      console.log('Original phone:', formData.customerPhone);
      console.log('Formatted phone:', formattedPhone);

      // Submit order to backend
      const order = await ordersApi.createOrder(targetSlug, {
        customer_name: formData.customerName,
        customer_phone: formattedPhone,
        customer_email: formData.customerEmail || undefined,
        delivery_method: formData.deliveryMethod,
        delivery_address: formData.deliveryMethod === 'delivery' ? formData.deliveryAddress : undefined,
        payment_method: formData.paymentMethod,
        items: orderItems,
        notes: formData.notes || undefined,
        idempotency_key: idempotencyKey,
      });

      // Clear cart
      clearCart();

      // Redirect to order confirmation
      router.push(`/orders/${order.id}?token=${order.tracking_token}`);
    } catch (err: any) {
      console.error('Order submission error:', err);
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-[73px] z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/cart" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
              <p className="text-sm text-gray-600">
                from <span className="font-semibold">{restaurantName}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900">Order Failed</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Customer Information */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#D32F2F]" />
                  Contact Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="customerName"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        formErrors.customerName ? 'border-red-500' : 'border-gray-200'
                      } focus:border-[#D32F2F] focus:outline-none transition-colors`}
                      placeholder="Enter your full name"
                    />
                    {formErrors.customerName && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.customerName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        id="customerPhone"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 ${
                          formErrors.customerPhone ? 'border-red-500' : 'border-gray-200'
                        } focus:border-[#D32F2F] focus:outline-none transition-colors`}
                        placeholder="+49 171 1234567"
                      />
                    </div>
                    {formErrors.customerPhone && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.customerPhone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Email (Optional)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        id="customerEmail"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 ${
                          formErrors.customerEmail ? 'border-red-500' : 'border-gray-200'
                        } focus:border-[#D32F2F] focus:outline-none transition-colors`}
                        placeholder="your.email@example.com"
                      />
                    </div>
                    {formErrors.customerEmail && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.customerEmail}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Method */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#D32F2F]" />
                  Delivery Method
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, deliveryMethod: 'pickup' }))}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.deliveryMethod === 'pickup'
                        ? 'border-[#D32F2F] bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🏪</div>
                      <div className="font-semibold text-gray-900">Pickup</div>
                      <div className="text-sm text-gray-600">Free</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, deliveryMethod: 'delivery' }))}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.deliveryMethod === 'delivery'
                        ? 'border-[#D32F2F] bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🚚</div>
                      <div className="font-semibold text-gray-900">Delivery</div>
                      <div className="text-sm text-gray-600">€{deliveryFee.toFixed(2)}</div>
                    </div>
                  </button>
                </div>

                {formData.deliveryMethod === 'delivery' && (
                  <div>
                    <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      id="deliveryAddress"
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        formErrors.deliveryAddress ? 'border-red-500' : 'border-gray-200'
                      } focus:border-[#D32F2F] focus:outline-none transition-colors resize-none`}
                      placeholder="Street, Building, Apartment, City, Postal Code"
                    />
                    {formErrors.deliveryAddress && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.deliveryAddress}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-[#D32F2F]" />
                  Payment Method
                </h2>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'cash_on_delivery' }))}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      formData.paymentMethod === 'cash_on_delivery'
                        ? 'border-[#D32F2F] bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Wallet className="w-6 h-6 text-gray-700" />
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-900">Cash on {formData.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}</div>
                      <div className="text-sm text-gray-600">Pay with cash when you receive your order</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'card_on_delivery' }))}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      formData.paymentMethod === 'card_on_delivery'
                        ? 'border-[#D32F2F] bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 text-gray-700" />
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-900">Card on {formData.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}</div>
                      <div className="text-sm text-gray-600">Pay with card when you receive your order</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'online' }))}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 opacity-50 cursor-not-allowed ${
                      formData.paymentMethod === 'online'
                        ? 'border-[#D32F2F] bg-red-50'
                        : 'border-gray-200'
                    }`}
                    disabled
                  >
                    <Smartphone className="w-6 h-6 text-gray-700" />
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-900">Online Payment</div>
                      <div className="text-sm text-gray-600">Coming soon - PayPal, Credit Card</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Notes (Optional)</h2>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D32F2F] focus:outline-none transition-colors resize-none"
                  placeholder="Any special requests or instructions for the restaurant?"
                />
              </div>
            </form>
          </div>

          {/* Order Summary (Sticky Sidebar) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-[150px]">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="font-medium text-gray-900">
                      €{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">€{totalPrice.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Delivery Fee</span>
                  <span className="font-medium">
                    {deliveryFee > 0 ? `€${deliveryFee.toFixed(2)}` : 'Free'}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-[#D32F2F]">€{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-[#D32F2F] hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-full transition-colors shadow-lg"
              >
                {isSubmitting ? 'Placing Order...' : `Place Order - €${grandTotal.toFixed(2)}`}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
