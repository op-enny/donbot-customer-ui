'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ordersApi, type Order } from '@/lib/api';
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Package } from 'lucide-react';
import { useLocaleStore } from '@/lib/store/localeStore';
import { useOrderHistoryStore } from '@/lib/store/orderHistoryStore';

export default function OrderTrackingPage() {
  const [mounted, setMounted] = useState(false);
  const params = useParams();
  const searchParams = useSearchParams();
  const orderIdParam = params.id;
  const orderId = Array.isArray(orderIdParam) ? orderIdParam[0] : (orderIdParam as string);

  // Try to get token from multiple sources (prioritized):
  // 1. URL search params (for backwards compatibility/shared links)
  // 2. sessionStorage (for secure same-session access)
  // 3. orderHistoryStore (for returning users)
  const urlToken = searchParams.get('token');
  const { orders: historyOrders } = useOrderHistoryStore();
  const historyOrder = historyOrders.find((o) => o.id === orderId);

  const [token, setToken] = useState<string | null>(null);
  const t = useLocaleStore((state) => state.t);
  const currencySymbol = useLocaleStore((state) => state.currencySymbol);

  useEffect(() => {
    const timeoutId = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resolve token on mount (client-side only)
  useEffect(() => {
    const resolvedToken =
      urlToken ||
      (typeof window !== 'undefined' ? sessionStorage.getItem(`order_token_${orderId}`) : null) ||
      historyOrder?.trackingToken ||
      null;
    setToken(resolvedToken);
  }, [orderId, urlToken, historyOrder?.trackingToken]);

  useEffect(() => {
    // Wait for token resolution
    if (token === null && !urlToken && !historyOrder?.trackingToken) {
      // Still checking sessionStorage
      return;
    }

    let isMounted = true;

    if (!token) {
      setError(t('tracking_token_missing'));
      setIsLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const data = await ordersApi.trackOrder(orderId, token);
        if (!isMounted) return;
        setOrder(data);

        // Clear sessionStorage token after successful fetch (security best practice)
        // This reduces the window of token exposure
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(`order_token_${orderId}`);
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to track order', err);
        }
        if (!isMounted) return;
        setError(t('unable_to_load_order'));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId, token, t, urlToken, historyOrder?.trackingToken]);

  // Helper to get translated status
  const getStatusLabel = (status: string) => {
    const statusKey = `status_${status.toLowerCase()}` as const;
    return t(statusKey) || status;
  };

  // Helper to get translated payment status
  const getPaymentStatusLabel = (status: string) => {
    const statusKey = `payment_status_${status.toLowerCase()}` as const;
    return t(statusKey) || status;
  };

  // Show loading spinner during hydration to avoid SSR mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 pb-12 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white border-b border-gray-200 sticky top-[73px] z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            {t('back_to_home')}
          </Link>
          <span className="text-sm text-gray-400">/</span>
          <span className="text-sm font-semibold text-gray-800">{t('order_tracking')}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6">
        {isLoading && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="h-5 w-40 bg-gray-100 animate-pulse rounded mb-3" />
            <div className="h-4 w-56 bg-gray-100 animate-pulse rounded mb-6" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-4 bg-gray-100 animate-pulse rounded" />
              ))}
            </div>
          </div>
        )}

        {!isLoading && error && (
          <div className="bg-white rounded-2xl shadow-md p-6 border border-red-200 text-red-800 flex gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-red-900 mb-1">{t('tracking_unavailable')}</h2>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && order && (
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('order_id')}</p>
                <h1 className="text-2xl font-bold text-gray-900">{order.order_number || order.id}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {t('restaurant')}: <span className="font-semibold">{order.restaurant_id}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold text-sm">
                  {getStatusLabel(order.status)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <div className="flex items-center gap-2 text-gray-700 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold text-sm">{t('payment')}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {t('method')}: <span className="font-medium">{order.payment_method || 'N/A'}</span>
                </p>
                <p className="text-sm text-gray-600">
                  {t('status')}: <span className="font-medium">{getPaymentStatusLabel(order.payment_status)}</span>
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <div className="flex items-center gap-2 text-gray-700 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold text-sm">{t('fulfillment')}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {t(order.delivery_method)}: <span className="font-medium">{t(order.delivery_method)}</span>
                </p>
                {order.estimated_ready_time && (
                  <p className="text-sm text-gray-600">
                    {t('estimated_ready_time')}: <span className="font-medium">{order.estimated_ready_time}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <div className="flex items-center gap-2 text-gray-700 mb-3">
                  <Package className="w-5 h-5" />
                  <h3 className="font-semibold">{t('order_items')}</h3>
                </div>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-start justify-between py-2 border-b border-gray-200 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {item.quantity}x {item.menu_item_name}
                        </p>
                        {item.options && Object.keys(item.options).length > 0 && (
                          <p className="text-xs text-gray-600 mt-1">
                            {Object.entries(item.options).map(([key, value]) => (
                              <span key={key} className="mr-2">
                                {key}: {String(value)}
                              </span>
                            ))}
                          </p>
                        )}
                        {item.special_instructions && (
                          <p className="text-xs text-gray-600 italic mt-1">
                            {item.special_instructions}
                          </p>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900 ml-3">
                        {currencySymbol}{item.price_snapshot.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
              <p className="text-sm text-gray-600 mb-1">{t('total')}</p>
              <p className="text-2xl font-bold text-primary">{currencySymbol}{order.total_amount.toFixed(2)}</p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
              >
                {t('back_to_restaurants')}
              </Link>
              <Link
                href="/orders"
                className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-gray-200 text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
              >
                {t('view_order_history')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
