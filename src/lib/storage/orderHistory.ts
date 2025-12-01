/**
 * Order History Storage
 * Manages recent orders for tracking and reordering
 */

import LocalStorageService from './localStorageService';
import type { OrderHistoryEntry, OrderStatus } from './types';

const STORAGE_KEY = 'order_history';
const MAX_ORDERS = 50; // Keep only last 50 orders

export const orderHistoryStorage = {
  /**
   * Get all orders from localStorage
   */
  getOrders(): OrderHistoryEntry[] {
    const orders = LocalStorageService.get<OrderHistoryEntry[]>(STORAGE_KEY);
    return orders || [];
  },

  /**
   * Add a new order to history
   */
  addOrder(order: OrderHistoryEntry): void {
    let orders = this.getOrders();

    // Check if order already exists (prevent duplicates)
    const exists = orders.some((o) => o.order_id === order.order_id);
    if (exists) {
      console.warn(`[OrderHistory] Order ${order.order_number} already exists`);
      return;
    }

    // Add new order at the beginning
    orders.unshift(order);

    // Limit to MAX_ORDERS (remove oldest completed orders if needed)
    if (orders.length > MAX_ORDERS) {
      // Sort by: active orders first, then by date
      orders = orders.sort((a, b) => {
        const aActive = !['completed', 'cancelled'].includes(a.status);
        const bActive = !['completed', 'cancelled'].includes(b.status);

        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      // Keep only MAX_ORDERS
      orders = orders.slice(0, MAX_ORDERS);
    }

    LocalStorageService.set(STORAGE_KEY, orders);
  },

  /**
   * Update order status
   */
  updateOrderStatus(orderId: string, status: OrderStatus): void {
    const orders = this.getOrders();
    const updated = orders.map((order) => {
      if (order.order_id === orderId) {
        return { ...order, status };
      }
      return order;
    });

    LocalStorageService.set(STORAGE_KEY, updated);
  },

  /**
   * Update complete order entry (for polling updates)
   */
  updateOrder(orderId: string, updates: Partial<OrderHistoryEntry>): void {
    const orders = this.getOrders();
    const updated = orders.map((order) => {
      if (order.order_id === orderId) {
        return { ...order, ...updates };
      }
      return order;
    });

    LocalStorageService.set(STORAGE_KEY, updated);
  },

  /**
   * Get a specific order by ID
   */
  getOrderById(orderId: string): OrderHistoryEntry | null {
    const orders = this.getOrders();
    return orders.find((order) => order.order_id === orderId) || null;
  },

  /**
   * Get a specific order by order number
   */
  getOrderByNumber(orderNumber: string): OrderHistoryEntry | null {
    const orders = this.getOrders();
    return orders.find((order) => order.order_number === orderNumber) || null;
  },

  /**
   * Remove an order from history
   */
  removeOrder(orderId: string): void {
    const orders = this.getOrders();
    const filtered = orders.filter((order) => order.order_id !== orderId);
    LocalStorageService.set(STORAGE_KEY, filtered);
  },

  /**
   * Get active orders (not completed or cancelled)
   */
  getActiveOrders(): OrderHistoryEntry[] {
    const orders = this.getOrders();
    return orders
      .filter((order) => !['completed', 'cancelled'].includes(order.status))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  /**
   * Get completed orders
   */
  getCompletedOrders(): OrderHistoryEntry[] {
    const orders = this.getOrders();
    return orders
      .filter((order) => order.status === 'completed')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  /**
   * Get orders from a specific restaurant
   */
  getOrdersByRestaurant(restaurantSlug: string): OrderHistoryEntry[] {
    const orders = this.getOrders();
    return orders
      .filter((order) => order.restaurant_slug === restaurantSlug)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  /**
   * Get recent orders (last N days)
   */
  getRecentOrders(days: number = 7): OrderHistoryEntry[] {
    const orders = this.getOrders();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return orders
      .filter((order) => new Date(order.created_at) >= cutoffDate)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  /**
   * Get orders with valid tracking tokens (not expired)
   */
  getTrackableOrders(): OrderHistoryEntry[] {
    const orders = this.getOrders();
    const now = new Date();

    return orders
      .filter((order) => new Date(order.expires_at) > now)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  /**
   * Check if order tracking token is expired
   */
  isTrackingExpired(orderId: string): boolean {
    const order = this.getOrderById(orderId);
    if (!order) return true;

    return new Date(order.expires_at) < new Date();
  },

  /**
   * Get total number of orders
   */
  getOrderCount(): number {
    return this.getOrders().length;
  },

  /**
   * Get total spent across all orders
   */
  getTotalSpent(): number {
    const orders = this.getOrders();
    return orders.reduce((total, order) => total + order.total_amount, 0);
  },

  /**
   * Clear all order history
   */
  clearHistory(): void {
    LocalStorageService.remove(STORAGE_KEY);
  },

  /**
   * Cleanup expired orders (older than 90 days)
   */
  cleanupExpired(): void {
    const orders = this.getOrders();
    const now = new Date();
    const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;

    const filtered = orders.filter((order) => {
      const createdAt = new Date(order.created_at);
      const age = now.getTime() - createdAt.getTime();
      return age <= NINETY_DAYS;
    });

    if (filtered.length < orders.length) {
      console.log(`[OrderHistory] Cleaned up ${orders.length - filtered.length} expired orders`);
      LocalStorageService.set(STORAGE_KEY, filtered);
    }
  },

  /**
   * Group orders by date (for UI display)
   */
  getOrdersGroupedByDate(): Record<string, OrderHistoryEntry[]> {
    const orders = this.getOrders();
    const grouped: Record<string, OrderHistoryEntry[]> = {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    orders.forEach((order) => {
      const orderDate = new Date(order.created_at);
      orderDate.setHours(0, 0, 0, 0);

      let key: string;

      if (orderDate.getTime() === today.getTime()) {
        key = 'Heute';
      } else if (orderDate.getTime() === yesterday.getTime()) {
        key = 'Gestern';
      } else if (orderDate >= lastWeek) {
        key = 'Letzte 7 Tage';
      } else {
        key = 'Älter';
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(order);
    });

    return grouped;
  },

  /**
   * Get order statistics
   */
  getStatistics(): {
    total_orders: number;
    active_orders: number;
    completed_orders: number;
    total_spent: number;
    favorite_restaurant: { name: string; count: number } | null;
  } {
    const orders = this.getOrders();

    // Count by restaurant
    const restaurantCounts: Record<string, { name: string; count: number }> = {};
    orders.forEach((order) => {
      if (!restaurantCounts[order.restaurant_slug]) {
        restaurantCounts[order.restaurant_slug] = {
          name: order.restaurant_name,
          count: 0,
        };
      }
      restaurantCounts[order.restaurant_slug].count++;
    });

    // Find favorite restaurant
    const favorite = Object.values(restaurantCounts).sort((a, b) => b.count - a.count)[0] || null;

    return {
      total_orders: orders.length,
      active_orders: this.getActiveOrders().length,
      completed_orders: this.getCompletedOrders().length,
      total_spent: this.getTotalSpent(),
      favorite_restaurant: favorite,
    };
  },
};

export default orderHistoryStorage;
