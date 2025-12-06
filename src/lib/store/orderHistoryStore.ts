import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OrderHistoryItem {
  id: string;
  restaurantName: string;
  total: number;
  status: string;
  createdAt: string;
  trackingToken: string;
}

interface OrderHistoryStore {
  orders: OrderHistoryItem[];
  addOrder: (order: OrderHistoryItem) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
}

export const useOrderHistoryStore = create<OrderHistoryStore>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) =>
        set((state) => {
          // Add new order to the beginning and keep only the last 5
          const newOrders = [order, ...state.orders].slice(0, 5);
          return { orders: newOrders };
        }),
      updateOrderStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          ),
        })),
    }),
    {
      name: 'donbot_order_history',
    }
  )
);
