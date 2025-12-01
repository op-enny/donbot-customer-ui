/**
 * React Hook for Order History
 * Provides reactive access to order history data
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { orderHistoryStorage } from '../orderHistory';
import type { OrderHistoryEntry, OrderStatus } from '../types';

export function useOrderHistory() {
  const [orders, setOrders] = useState<OrderHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load orders on mount
  useEffect(() => {
    const loadOrders = () => {
      const data = orderHistoryStorage.getOrders();
      setOrders(data);
      setLoading(false);
    };

    loadOrders();
  }, []);

  // Refresh orders (for polling updates)
  const refreshOrders = useCallback(() => {
    const data = orderHistoryStorage.getOrders();
    setOrders(data);
  }, []);

  // Add new order
  const addOrder = useCallback((order: OrderHistoryEntry) => {
    orderHistoryStorage.addOrder(order);
    refreshOrders();
  }, [refreshOrders]);

  // Update order status
  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    orderHistoryStorage.updateOrderStatus(orderId, status);
    refreshOrders();
  }, [refreshOrders]);

  // Update complete order
  const updateOrder = useCallback((orderId: string, updates: Partial<OrderHistoryEntry>) => {
    orderHistoryStorage.updateOrder(orderId, updates);
    refreshOrders();
  }, [refreshOrders]);

  // Get order by ID
  const getOrderById = useCallback((orderId: string) => {
    return orderHistoryStorage.getOrderById(orderId);
  }, [orders]);

  // Get order by number
  const getOrderByNumber = useCallback((orderNumber: string) => {
    return orderHistoryStorage.getOrderByNumber(orderNumber);
  }, [orders]);

  // Remove order
  const removeOrder = useCallback((orderId: string) => {
    orderHistoryStorage.removeOrder(orderId);
    refreshOrders();
  }, [refreshOrders]);

  // Get active orders
  const getActiveOrders = useCallback(() => {
    return orderHistoryStorage.getActiveOrders();
  }, [orders]);

  // Get completed orders
  const getCompletedOrders = useCallback(() => {
    return orderHistoryStorage.getCompletedOrders();
  }, [orders]);

  // Get orders by restaurant
  const getOrdersByRestaurant = useCallback((restaurantSlug: string) => {
    return orderHistoryStorage.getOrdersByRestaurant(restaurantSlug);
  }, [orders]);

  // Get recent orders
  const getRecentOrders = useCallback((days: number = 7) => {
    return orderHistoryStorage.getRecentOrders(days);
  }, [orders]);

  // Get trackable orders
  const getTrackableOrders = useCallback(() => {
    return orderHistoryStorage.getTrackableOrders();
  }, [orders]);

  // Check if tracking expired
  const isTrackingExpired = useCallback((orderId: string) => {
    return orderHistoryStorage.isTrackingExpired(orderId);
  }, [orders]);

  // Get grouped orders
  const getOrdersGroupedByDate = useCallback(() => {
    return orderHistoryStorage.getOrdersGroupedByDate();
  }, [orders]);

  // Get statistics
  const getStatistics = useCallback(() => {
    return orderHistoryStorage.getStatistics();
  }, [orders]);

  // Get total spent
  const getTotalSpent = useCallback(() => {
    return orderHistoryStorage.getTotalSpent();
  }, [orders]);

  // Clear history
  const clearHistory = useCallback(() => {
    orderHistoryStorage.clearHistory();
    setOrders([]);
  }, []);

  // Cleanup expired
  const cleanupExpired = useCallback(() => {
    orderHistoryStorage.cleanupExpired();
    refreshOrders();
  }, [refreshOrders]);

  return {
    orders,
    loading,
    refreshOrders,
    addOrder,
    updateOrderStatus,
    updateOrder,
    getOrderById,
    getOrderByNumber,
    removeOrder,
    getActiveOrders,
    getCompletedOrders,
    getOrdersByRestaurant,
    getRecentOrders,
    getTrackableOrders,
    isTrackingExpired,
    getOrdersGroupedByDate,
    getStatistics,
    getTotalSpent,
    clearHistory,
    cleanupExpired,
  };
}
