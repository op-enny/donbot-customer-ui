'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useOrderHistoryStore } from '@/lib/store/orderHistoryStore';
import { ordersApi } from '@/lib/api';

export function OrderStatusWatcher() {
  const { orders, updateOrderStatus } = useOrderHistoryStore();

  // Use refs to avoid recreating interval on every order change
  const ordersRef = useRef(orders);
  const updateOrderStatusRef = useRef(updateOrderStatus);

  // Keep refs in sync
  useEffect(() => {
    ordersRef.current = orders;
    updateOrderStatusRef.current = updateOrderStatus;
  }, [orders, updateOrderStatus]);

  const checkOrders = useCallback(async () => {
    const currentOrders = ordersRef.current;
    const activeOrders = currentOrders.filter(
      (order) =>
        !['delivered', 'cancelled', 'rejected', 'completed'].includes(order.status.toLowerCase())
    );

    if (activeOrders.length === 0) return;

    // Fetch all orders in parallel instead of sequentially
    const results = await Promise.allSettled(
      activeOrders.map(async (order) => {
        const updatedOrder = await ordersApi.trackOrder(order.id, order.trackingToken);
        return { orderId: order.id, currentStatus: order.status, newStatus: updatedOrder.status };
      })
    );

    // Process results
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { orderId, currentStatus, newStatus } = result.value;
        if (newStatus !== currentStatus) {
          updateOrderStatusRef.current(orderId, newStatus);
          if (process.env.NODE_ENV === 'development') {
            console.log(`Order ${orderId} status updated to ${newStatus}`);
          }
        }
      } else {
        // Log errors only in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to track order:', result.reason);
        }
      }
    });
  }, []);

  useEffect(() => {
    // Check immediately and then every 30 seconds
    checkOrders();
    const interval = setInterval(checkOrders, 30000);

    return () => clearInterval(interval);
  }, [checkOrders]);

  return null;
}
