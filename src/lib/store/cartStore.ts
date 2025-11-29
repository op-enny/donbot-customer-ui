import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // Unique cart item ID (not menu item ID)
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  options: Record<string, string[]>; // Selected modifiers
  specialInstructions?: string;
  image_url: string | null;
}

interface CartStore {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  restaurantSlug: string | null;

  // Actions
  addItem: (item: Omit<CartItem, 'id'>, restaurantId: string, restaurantName: string, restaurantSlug: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: null,
      restaurantSlug: null,

      addItem: (item, restaurantId, restaurantName, restaurantSlug) => {
        const currentRestaurantId = get().restaurantId;

        // If cart has items from a different restaurant, ask to clear
        if (currentRestaurantId && currentRestaurantId !== restaurantId) {
          const shouldClear = confirm(
            `Your cart contains items from ${get().restaurantName}. Clear cart and add items from ${restaurantName}?`
          );
          if (!shouldClear) return;
          set({ items: [], restaurantId, restaurantName, restaurantSlug });
        }

        // Generate unique ID for cart item
        const cartItemId = `${item.menuItemId}-${Date.now()}-${Math.random()}`;

        set((state) => ({
          items: [
            ...state.items,
            {
              ...item,
              id: cartItemId,
            },
          ],
          restaurantId,
          restaurantName,
          restaurantSlug,
        }));
      },

      removeItem: (itemId) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== itemId);
          return {
            items: newItems,
            // Clear restaurant if cart is empty
            restaurantId: newItems.length === 0 ? null : state.restaurantId,
            restaurantName: newItems.length === 0 ? null : state.restaurantName,
            restaurantSlug: newItems.length === 0 ? null : state.restaurantSlug,
          };
        });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], restaurantId: null, restaurantName: null, restaurantSlug: null });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage', // localStorage key
    }
  )
);
