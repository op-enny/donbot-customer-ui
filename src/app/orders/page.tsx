'use client';

import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useOrderHistoryStore } from '@/lib/store/orderHistoryStore';
import { useState, useEffect } from 'react';

export default function OrdersPage() {
  const [mounted, setMounted] = useState(false);
  const orders = useOrderHistoryStore((state) => state.orders);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#D32F2F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
      case 'confirmed':
      case 'preparing':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'ready':
      case 'out_for_delivery':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: 'New',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      ready: 'Ready for Pickup',
      out_for_delivery: 'Out for Delivery',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
      case 'confirmed':
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-600 mt-1">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} in last 7 days
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No orders yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start ordering from your favorite restaurants
            </p>
            <Link
              href="/"
              className="inline-block bg-[#D32F2F] hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}?token=${order.trackingToken}`}
                className="block bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{order.restaurantName}</p>
                  </div>
                  {getStatusIcon(order.status)}
                </div>

                <div className="flex items-center justify-between text-sm mt-3">
                  <span className="text-gray-600">{formatDate(order.createdAt)}</span>
                  <span className="font-bold text-gray-900">
                    €{order.total.toFixed(2)}
                  </span>
                </div>

                {['new', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(
                  order.status
                ) && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button className="w-full bg-[#D32F2F] hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors text-sm">
                      Track Order
                    </button>
                  </div>
                )}

                {order.status === 'completed' && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button className="w-full border-2 border-[#D32F2F] text-[#D32F2F] hover:bg-red-50 font-semibold py-2 rounded-lg transition-colors text-sm">
                      Reorder
                    </button>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
