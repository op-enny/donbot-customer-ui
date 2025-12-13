'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cartStore';
import { useOrderHistoryStore } from '@/lib/store/orderHistoryStore';
import { useLocationStore } from '@/lib/store/locationStore';
import { useLocaleStore, translations } from '@/lib/store/localeStore';
import { ordersApi } from '@/lib/api';
import { ArrowLeft, CreditCard, Wallet, Smartphone, MapPin, User, Phone, Mail, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { items, restaurantId, restaurantName, restaurantSlug, getTotalPrice, clearCart } = useCartStore();
  const { locale } = useLocaleStore();
  const t = translations[locale];

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

  // Load user info from local storage
  useEffect(() => {
    if (!mounted) return;

    const storedData = localStorage.getItem('donbot_user_info');
    let initialAddress = '';

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        const now = Date.now();
        const fifteenDays = 15 * 24 * 60 * 60 * 1000;

        if (now - parsedData.timestamp < fifteenDays) {
          setFormData((prev) => ({
            ...prev,
            customerName: parsedData.customerName || '',
            customerPhone: parsedData.customerPhone || '',
            customerEmail: parsedData.customerEmail || '',
            deliveryAddress: parsedData.deliveryAddress || '',
          }));
          initialAddress = parsedData.deliveryAddress || '';
        } else {
          localStorage.removeItem('donbot_user_info');
        }
      } catch (e) {
        console.error('Failed to parse user info', e);
      }
    }

    // If no address from user info, try location store
    if (!initialAddress) {
      const locationStore = useLocationStore.getState();
      if (locationStore.isSet && locationStore.address) {
        setFormData((prev) => ({
          ...prev,
          deliveryAddress: locationStore.address,
        }));
      }
    }
  }, [mounted]);

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

  // Strict German phone number validation
  const isValidGermanPhone = (phone: string): boolean => {
    // Remove all whitespace and dashes for validation
    const cleaned = phone.replace(/[\s-]/g, '');

    // Valid formats:
    // +49XXXXXXXXXX (10-14 digits after +49)
    // 0049XXXXXXXXXX (10-14 digits after 0049)
    // 0XXXXXXXXXX (10-12 digits starting with 0)
    const germanPhoneRegex = /^(\+49|0049|0)[1-9]\d{8,13}$/;

    return germanPhoneRegex.test(cleaned);
  };

  // Sanitize text input to prevent XSS and limit length
  const sanitizeInput = (input: string, maxLength: number = 500): string => {
    return input
      .trim()
      .slice(0, maxLength)
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>]/g, ''); // Remove remaining angle brackets
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      errors.customerName = 'Name is required';
    } else if (formData.customerName.trim().length < 2) {
      errors.customerName = 'Name must be at least 2 characters';
    } else if (formData.customerName.trim().length > 100) {
      errors.customerName = 'Name must be less than 100 characters';
    }

    if (!formData.customerPhone.trim()) {
      errors.customerPhone = 'Phone number is required';
    } else if (!isValidGermanPhone(formData.customerPhone)) {
      errors.customerPhone = 'Please enter a valid German phone number (e.g., +49 171 1234567)';
    }

    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      errors.customerEmail = 'Invalid email address';
    }

    if (formData.deliveryMethod === 'delivery' && !formData.deliveryAddress.trim()) {
      errors.deliveryAddress = 'Delivery address is required';
    }

    // Validate notes length
    if (formData.notes && formData.notes.length > 500) {
      errors.notes = 'Notes must be less than 500 characters';
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

      // Submit order to backend with sanitized inputs
      const order = await ordersApi.createOrder(targetSlug, {
        customer_name: sanitizeInput(formData.customerName, 100),
        customer_phone: formattedPhone,
        customer_email: formData.customerEmail ? sanitizeInput(formData.customerEmail, 255) : undefined,
        delivery_method: formData.deliveryMethod,
        delivery_address: formData.deliveryMethod === 'delivery' ? sanitizeInput(formData.deliveryAddress, 500) : undefined,
        payment_method: formData.paymentMethod,
        items: orderItems.map((item) => ({
          ...item,
          special_instructions: item.special_instructions
            ? sanitizeInput(item.special_instructions, 500)
            : undefined,
        })),
        notes: formData.notes ? sanitizeInput(formData.notes, 500) : undefined,
        idempotency_key: idempotencyKey,
      });

      // Save user info to local storage (15 days validity)
      const userInfo = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        deliveryAddress: formData.deliveryAddress,
        timestamp: Date.now(),
      };
      localStorage.setItem('donbot_user_info', JSON.stringify(userInfo));

      // Save to order history
      useOrderHistoryStore.getState().addOrder({
        id: order.id,
        restaurantName: restaurantName || 'Restaurant',
        total: grandTotal,
        status: order.status,
        createdAt: new Date().toISOString(),
        trackingToken: order.tracking_token || '',
      });

      // Clear cart
      clearCart();

      // Store tracking token securely in sessionStorage instead of URL
      // This prevents token exposure via browser history and Referer headers
      if (order.tracking_token) {
        sessionStorage.setItem(`order_token_${order.id}`, order.tracking_token);
      }

      // Redirect to order confirmation without token in URL
      router.push(`/orders/${order.id}`);
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Order submission error:', err);
      }
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
              <h1 className="text-2xl font-bold text-gray-900">{t['checkout']}</h1>
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
                      {t['name']} <span className="text-red-600">*</span>
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
                      placeholder={t['name']}
                    />
                    {formErrors.customerName && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.customerName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                      {t['phone']} <span className="text-red-600">*</span>
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
                      {t['email']} ({t['optional']})
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
                  {t['delivery_address']}
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
                      <div className="font-semibold text-gray-900">{t['pickup']}</div>
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
                      <div className="font-semibold text-gray-900">{t['delivery']}</div>
                      <div className="text-sm text-gray-600">€{deliveryFee.toFixed(2)}</div>
                    </div>
                  </button>
                </div>

                {formData.deliveryMethod === 'delivery' && (
                  <div>
                    <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 mb-2">
                      {t['delivery_address']} <span className="text-red-600">*</span>
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
                      placeholder={t['address']}
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
                  {t['payment_method']}
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
                      <div className="font-semibold text-gray-900">{t['cash']}</div>
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
                      <div className="font-semibold text-gray-900">{t['card']}</div>
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
                <h2 className="text-lg font-bold text-gray-900 mb-4">{t['order_notes']} ({t['optional']})</h2>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D32F2F] focus:outline-none transition-colors resize-none"
                  placeholder={t['notes']}
                />
              </div>
            </form>
          </div>

          {/* Order Summary (Sticky Sidebar) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-[150px]">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t['your_cart']}</h2>

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
                  <span>{t['subtotal']}</span>
                  <span className="font-medium">€{totalPrice.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>{t['delivery_fee']}</span>
                  <span className="font-medium">
                    {deliveryFee > 0 ? `€${deliveryFee.toFixed(2)}` : 'Free'}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t['total']}</span>
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
                {isSubmitting ? 'Placing Order...' : `${t['place_order']} - €${grandTotal.toFixed(2)}`}
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
