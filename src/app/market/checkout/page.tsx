'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMarketCartStore } from '@/lib/store/marketCartStore';
import { useOrderHistoryStore } from '@/lib/store/orderHistoryStore';
import { useLocationStore } from '@/lib/store/locationStore';
import { useLocaleStore, translations } from '@/lib/store/localeStore';
import { ordersApi, RateLimitError } from '@/lib/api';
import { saveSecureUserInfo, loadSecureUserInfo } from '@/lib/utils/crypto';
import { sanitizeText, sanitizeEmail, sanitizeNotes } from '@/lib/utils/sanitize';
import { DeliverySlotPicker } from '@/components/market/DeliverySlotPicker';
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Smartphone,
  MapPin,
  User,
  Phone,
  Mail,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  Truck,
} from 'lucide-react';
import Link from 'next/link';

export default function MarketCheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const {
    items,
    marketName,
    marketSlug,
    getTotalPrice,
    getDeliveryFee,
    getMinimumOrder,
    selectedDeliverySlotId,
    setDeliverySlot,
    clearCart,
  } = useMarketCartStore();

  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);
  const { locale } = useLocaleStore();
  const t = translations[locale];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryAddress: '',
    paymentMethod: 'cash_on_delivery' as 'cash_on_delivery' | 'card_on_delivery' | 'online',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const totalPrice = getTotalPrice();
  const deliveryFee = getDeliveryFee();
  const grandTotal = totalPrice + deliveryFee;

  useEffect(() => {
    const timeoutId = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push('/cart');
    }
  }, [mounted, items.length, router]);

  useEffect(() => {
    if (!mounted) return;

    const loadUserData = async () => {
      try {
        const secureData = await loadSecureUserInfo();
        let initialAddress = '';

        if (secureData) {
          setFormData((prev) => ({
            ...prev,
            customerName: secureData.customerName || '',
            customerPhone: secureData.customerPhone || '',
            customerEmail: secureData.customerEmail || '',
            deliveryAddress: secureData.deliveryAddress || '',
          }));
          initialAddress = secureData.deliveryAddress || '';
        }

        if (!initialAddress) {
          const locationStore = useLocationStore.getState();
          if (locationStore.isSet && locationStore.address) {
            setFormData((prev) => ({
              ...prev,
              deliveryAddress: locationStore.address,
            }));
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to load user info:', error);
        }
      }
    };

    loadUserData();
  }, [mounted]);

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
    return null;
  }

  const isValidGermanPhone = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s-]/g, '');
    const germanPhoneRegex = /^(\+49|0049|0)[1-9]\d{8,13}$/;
    return germanPhoneRegex.test(cleaned);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      errors.customerName = 'Name is required';
    } else if (formData.customerName.trim().length < 2) {
      errors.customerName = 'Name must be at least 2 characters';
    }

    if (!formData.customerPhone.trim()) {
      errors.customerPhone = 'Phone number is required';
    } else if (!isValidGermanPhone(formData.customerPhone)) {
      errors.customerPhone = 'Please enter a valid German phone number';
    }

    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      errors.customerEmail = 'Please enter a valid email address';
    }

    if (!formData.deliveryAddress.trim()) {
      errors.deliveryAddress = 'Delivery address is required';
    }

    if (!selectedDeliverySlotId) {
      errors.deliverySlot = 'Please select a delivery time slot';
    }

    if (!acceptedTerms) {
      errors.terms = 'You must accept the terms and conditions';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const formatPhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('0049')) {
      cleaned = '+49' + cleaned.slice(4);
    } else if (cleaned.startsWith('0') && !cleaned.startsWith('+')) {
      cleaned = '+49' + cleaned.slice(1);
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
      const orderItems = items.map((item) => ({
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        unit_quantity: item.unit_quantity,
      }));

      const targetSlug = marketSlug || 'market';
      const formattedPhone = formatPhoneNumber(formData.customerPhone);

      const order = await ordersApi.createOrder(targetSlug, {
        customer_name: sanitizeText(formData.customerName, 100),
        customer_phone: formattedPhone,
        customer_email: formData.customerEmail ? sanitizeEmail(formData.customerEmail) : undefined,
        delivery_method: 'delivery',
        delivery_address: sanitizeText(formData.deliveryAddress, 500),
        delivery_slot_id: selectedDeliverySlotId || undefined,
        payment_method: formData.paymentMethod,
        items: orderItems,
        notes: formData.notes ? sanitizeNotes(formData.notes, 500) : undefined,
        idempotency_key: idempotencyKey,
      });

      await saveSecureUserInfo({
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || undefined,
        deliveryAddress: formData.deliveryAddress || undefined,
      });

      useOrderHistoryStore.getState().addOrder({
        id: order.id,
        restaurantName: marketName || 'Market',
        total: grandTotal,
        status: order.status,
        createdAt: new Date().toISOString(),
        trackingToken: order.tracking_token || '',
      });

      clearCart();

      if (order.tracking_token) {
        sessionStorage.setItem(`order_token_${order.id}`, order.tracking_token);
      }

      router.push(`/orders/${order.id}`);
    } catch (err: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Order submission error:', err);
      }

      if (err instanceof RateLimitError) {
        const secondsRemaining = Math.ceil(err.retryAfterMs / 1000);
        setError(`${err.message} (${secondsRemaining} seconds)`);
      } else if (err instanceof Error) {
        const axiosError = err as Error & { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || err.message || 'Failed to place order. Please try again.');
      } else {
        setError('Failed to place order. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
                From <span className="font-semibold text-green-600">{marketName}</span>
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
                  <User className="w-5 h-5 text-green-600" />
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
                      } focus:border-green-500 focus:outline-none transition-colors`}
                      placeholder="Your name"
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
                        } focus:border-green-500 focus:outline-none transition-colors`}
                        placeholder="+49 171 1234567"
                      />
                    </div>
                    {formErrors.customerPhone && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.customerPhone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Email (optional)
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
                        } focus:border-green-500 focus:outline-none transition-colors`}
                        placeholder="your.email@example.com"
                      />
                    </div>
                    {formErrors.customerEmail && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.customerEmail}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Delivery Address
                </h2>

                <div>
                  <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Address <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="deliveryAddress"
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl border-2 ${
                      formErrors.deliveryAddress ? 'border-red-500' : 'border-gray-200'
                    } focus:border-green-500 focus:outline-none transition-colors resize-none`}
                    placeholder="Street, house number, apartment, city, postal code"
                  />
                  {formErrors.deliveryAddress && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.deliveryAddress}</p>
                  )}
                </div>
              </div>

              {/* Delivery Time Slot */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  Delivery Time <span className="text-red-600">*</span>
                </h2>

                {marketSlug && (
                  <DeliverySlotPicker
                    businessSlug={marketSlug}
                    selectedSlotId={selectedDeliverySlotId || undefined}
                    onSelect={(slotId) => {
                      setDeliverySlot(slotId);
                      if (formErrors.deliverySlot) {
                        setFormErrors((prev) => ({ ...prev, deliverySlot: '' }));
                      }
                    }}
                  />
                )}
                {formErrors.deliverySlot && (
                  <p className="text-sm text-red-600 mt-2">{formErrors.deliverySlot}</p>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-green-600" />
                  Payment Method
                </h2>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'cash_on_delivery' }))}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      formData.paymentMethod === 'cash_on_delivery'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Wallet className="w-6 h-6 text-gray-700" />
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-900">Cash on Delivery</div>
                      <div className="text-sm text-gray-600">Pay when you receive your order</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'card_on_delivery' }))}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      formData.paymentMethod === 'card_on_delivery'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 text-gray-700" />
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-900">Card on Delivery</div>
                      <div className="text-sm text-gray-600">Pay with card when you receive</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="w-full p-4 rounded-xl border-2 border-gray-200 opacity-50 cursor-not-allowed flex items-center gap-4"
                    disabled
                  >
                    <Smartphone className="w-6 h-6 text-gray-700" />
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-900">Online Payment</div>
                      <div className="text-sm text-gray-600">Coming soon</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Notes (optional)</h2>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors resize-none"
                  placeholder="Any special instructions for your delivery..."
                />
              </div>
            </form>
          </div>

          {/* Order Summary (Sticky Sidebar) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-[150px]">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.quantity}× {item.name}
                      {item.brand && <span className="text-gray-400 ml-1">({item.brand})</span>}
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
                  <span className="flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    Delivery
                  </span>
                  <span className="font-medium">
                    {deliveryFee > 0 ? `€${deliveryFee.toFixed(2)}` : 'Free'}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-green-600">€{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Legal Notice */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900 text-sm mb-1">Order Information</h3>
                    <p className="text-xs text-green-800">
                      Orders cannot be cancelled once confirmed. Fresh products are prepared/packed upon order.
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="mb-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => {
                        setAcceptedTerms(e.target.checked);
                        if (formErrors.terms) {
                          setFormErrors((prev) => ({ ...prev, terms: '' }));
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div
                      className={`w-5 h-5 border-2 rounded transition-all flex items-center justify-center ${
                        acceptedTerms
                          ? 'bg-green-600 border-green-600'
                          : formErrors.terms
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 group-hover:border-gray-400'
                      }`}
                    >
                      {acceptedTerms && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                  <span className={`text-sm ${formErrors.terms ? 'text-red-600' : 'text-gray-700'}`}>
                    I accept the terms and conditions <span className="text-red-600">*</span>
                  </span>
                </label>
                {formErrors.terms && <p className="text-xs text-red-600 mt-1 ml-8">{formErrors.terms}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || !acceptedTerms}
                className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isSubmitting || !acceptedTerms
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span>Place Order - €{grandTotal.toFixed(2)}</span>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                <Link href="/agb" className="text-green-600 hover:underline">
                  Terms of Service
                </Link>
                {' • '}
                <Link href="/datenschutz" className="text-green-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
