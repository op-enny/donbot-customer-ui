'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ordersApi, type Order } from '@/lib/api';
import { ArrowLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function OrderTrackingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderIdParam = params.id;
  const orderId = Array.isArray(orderIdParam) ? orderIdParam[0] : (orderIdParam as string);
  const token = searchParams.get('token');

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!token) {
      setError('Tracking token is missing. Please use the confirmation link from checkout.');
      setIsLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const data = await ordersApi.trackOrder(orderId, token);
        if (!isMounted) return;
        setOrder(data);
      } catch (err) {
        console.error('Failed to track order', err);
        if (!isMounted) return;
        setError('Unable to load order status. Please try again or contact the restaurant.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId, token]);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white border-b border-gray-200 sticky top-[73px] z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Back to home
          </Link>
          <span className="text-sm text-gray-400">/</span>
          <span className="text-sm font-semibold text-gray-800">Order Tracking</span>
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
              <h2 className="font-semibold text-red-900 mb-1">Tracking unavailable</h2>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && order && (
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <h1 className="text-2xl font-bold text-gray-900">{order.order_number || order.id}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Restaurant: <span className="font-semibold">{order.restaurant_id}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold text-sm">
                  {order.status ? order.status.toUpperCase() : 'PENDING'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <div className="flex items-center gap-2 text-gray-700 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold text-sm">Payment</span>
                </div>
                <p className="text-sm text-gray-600">
                  Method: <span className="font-medium">{order.payment_method || 'N/A'}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Status: <span className="font-medium">{order.payment_status || 'unknown'}</span>
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <div className="flex items-center gap-2 text-gray-700 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold text-sm">Fulfillment</span>
                </div>
                <p className="text-sm text-gray-600">
                  Delivery: <span className="font-medium">{order.delivery_method}</span>
                </p>
                {order.estimated_ready_time && (
                  <p className="text-sm text-gray-600">
                    ETA: <span className="font-medium">{order.estimated_ready_time}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-[#D32F2F]">€{order.total_amount.toFixed(2)}</p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[#D32F2F] text-white font-semibold hover:bg-red-700 transition-colors"
              >
                Back to restaurants
              </Link>
              <Link
                href="/orders"
                className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-gray-200 text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
              >
                View order history
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
