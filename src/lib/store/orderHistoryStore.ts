import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

export interface OrderHistoryItem {
  id: string;
  restaurantName: string;
  total: number;
  status: string;
  createdAt: string;
  trackingToken: string; // Will be encrypted in storage
}

interface OrderHistoryStore {
  orders: OrderHistoryItem[];
  addOrder: (order: OrderHistoryItem) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
  clearExpiredOrders: () => void;
}

// Simple obfuscation for tracking tokens in localStorage
// Note: This is NOT encryption - it's obfuscation to prevent casual inspection
// True security requires not storing sensitive data client-side
const obfuscateToken = (token: string): string => {
  if (!token) return '';
  // XOR with a fixed key and base64 encode
  const key = 'donbot-order-key';
  let result = '';
  for (let i = 0; i < token.length; i++) {
    result += String.fromCharCode(token.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result);
};

const deobfuscateToken = (obfuscated: string): string => {
  if (!obfuscated) return '';
  try {
    const decoded = atob(obfuscated);
    const key = 'donbot-order-key';
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch {
    return obfuscated; // Return as-is if deobfuscation fails (legacy data)
  }
};

// Custom storage with token obfuscation
const obfuscatedStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(name);
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored);
      // Deobfuscate tokens when reading
      if (parsed.state?.orders) {
        parsed.state.orders = parsed.state.orders.map((order: OrderHistoryItem) => ({
          ...order,
          trackingToken: deobfuscateToken(order.trackingToken),
        }));
      }
      return JSON.stringify(parsed);
    } catch {
      return stored;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      const parsed = JSON.parse(value);
      // Obfuscate tokens when storing
      if (parsed.state?.orders) {
        parsed.state.orders = parsed.state.orders.map((order: OrderHistoryItem) => ({
          ...order,
          trackingToken: obfuscateToken(order.trackingToken),
        }));
      }
      localStorage.setItem(name, JSON.stringify(parsed));
    } catch {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(name);
  },
};

// 7 days in milliseconds
const ORDER_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export const useOrderHistoryStore = create<OrderHistoryStore>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) =>
        set((state) => {
          // Filter expired orders first
          const now = Date.now();
          const validOrders = state.orders.filter((o) => {
            const orderTime = new Date(o.createdAt).getTime();
            return now - orderTime < ORDER_EXPIRY_MS;
          });
          // Add new order to the beginning and keep only the last 10
          const newOrders = [order, ...validOrders].slice(0, 10);
          return { orders: newOrders };
        }),
      updateOrderStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          ),
        })),
      clearExpiredOrders: () =>
        set((state) => {
          const now = Date.now();
          const validOrders = state.orders.filter((order) => {
            const orderTime = new Date(order.createdAt).getTime();
            return now - orderTime < ORDER_EXPIRY_MS;
          });
          return { orders: validOrders };
        }),
    }),
    {
      name: 'donbot_order_history_v2', // New key to avoid conflicts with old data
      storage: createJSONStorage(() => obfuscatedStorage),
    }
  )
);
