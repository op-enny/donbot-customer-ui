'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useOrderHistoryStore, type OrderHistoryItem } from '@/lib/store/orderHistoryStore';
import { ordersApi } from '@/lib/api';
import type { AxiosError } from 'axios';

interface OrderStatusWatcherProps {
  vertical?: 'eat' | 'market';
}

// Backoff state for rate limiting
let backoffMs = 0;
let lastRateLimitTime = 0;

export function OrderStatusWatcher({ vertical }: OrderStatusWatcherProps) {
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
    // Skip if we're in backoff period
    if (backoffMs > 0 && Date.now() - lastRateLimitTime < backoffMs) {
      return;
    }

    const currentOrders = ordersRef.current;

    // Filter by vertical if specified
    let activeOrders = currentOrders.filter(
      (order) =>
        !['delivered', 'cancelled', 'rejected', 'completed'].includes(order.status.toLowerCase())
    );

    // If vertical is specified, filter orders by vertical type
    if (vertical) {
      activeOrders = activeOrders.filter(
        (order) => {
          const orderWithVertical = order as OrderHistoryItem & { vertical?: string };
          return orderWithVertical.vertical === vertical || !orderWithVertical.vertical;
        }
      );
    }

    if (activeOrders.length === 0) return;

    // Fetch orders sequentially with small delay to avoid rate limiting
    for (const order of activeOrders) {
      try {
        const updatedOrder = await ordersApi.trackOrder(order.id, order.trackingToken);
        if (updatedOrder.status !== order.status) {
          updateOrderStatusRef.current(order.id, updatedOrder.status);
        }
        // Reset backoff on success
        backoffMs = 0;
      } catch (error) {
        const axiosError = error as AxiosError;

        // Handle rate limiting (429)
        if (axiosError.response?.status === 429) {
          backoffMs = Math.min(backoffMs === 0 ? 60000 : backoffMs * 2, 300000); // 1min, 2min, 4min, max 5min
          lastRateLimitTime = Date.now();
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Rate limited. Backing off for ${backoffMs / 1000}s`);
          }
          return; // Stop checking other orders
        }

        // Handle 404 (order not found) - silently ignore, order may have been deleted
        if (axiosError.response?.status === 404) {
          continue;
        }

        // Log other errors only in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to track order:', axiosError.message);
        }
      }
    }
  }, [vertical]);

  useEffect(() => {
    // Delay initial check to avoid burst requests on page load
    const initialDelay = setTimeout(checkOrders, 5000);
    // Check every 60 seconds (reduced from 30s to avoid rate limiting)
    const interval = setInterval(checkOrders, 60000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [checkOrders]);

  return null;
}
