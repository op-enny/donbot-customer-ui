'use client';

import { useEffect } from 'react';
import { useOrderHistoryStore } from '@/lib/store/orderHistoryStore';
import { ordersApi } from '@/lib/api';

export function OrderStatusWatcher() {
  const { orders, updateOrderStatus } = useOrderHistoryStore();

  useEffect(() => {
    const checkOrders = async () => {
      const activeOrders = orders.filter(
        (order) =>
          !['delivered', 'cancelled', 'rejected', 'completed'].includes(order.status.toLowerCase())
      );

      if (activeOrders.length === 0) return;

      for (const order of activeOrders) {
        try {
          const updatedOrder = await ordersApi.trackOrder(order.id, order.trackingToken);
          if (updatedOrder.status !== order.status) {
            updateOrderStatus(order.id, updatedOrder.status);
            // Here we could trigger a toast or notification
            console.log(`Order ${order.id} status updated to ${updatedOrder.status}`);
          }
        } catch (error) {
          console.error(`Failed to track order ${order.id}`, error);
        }
      }
    };

    // Check immediately and then every 30 seconds
    checkOrders();
    const interval = setInterval(checkOrders, 30000);

    return () => clearInterval(interval);
  }, [orders, updateOrderStatus]);

  return null;
}
