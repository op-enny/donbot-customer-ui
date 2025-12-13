import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // Unique cart item ID (not menu item ID)
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  options: Record<string, string[]>; // Selected modifiers (IDs)
  selectedModifiers?: { groupName: string; options: string[] }[]; // Human readable for display
  specialInstructions?: string;
  image_url: string | null;
}

interface CartConflict {
  hasConflict: boolean;
  currentRestaurantName: string | null;
}

interface RestaurantInfo {
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  deliveryFee?: number;
  minimumOrder?: number;
}

interface CartStore {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  restaurantSlug: string | null;
  deliveryFee: number;
  minimumOrder: number;

  // Actions
  checkRestaurantConflict: (restaurantId: string) => CartConflict;
  addItem: (item: Omit<CartItem, 'id'>, restaurantInfo: RestaurantInfo) => void;
  addItemAfterClear: (item: Omit<CartItem, 'id'>, restaurantInfo: RestaurantInfo) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getDeliveryFee: () => number;
  getMinimumOrder: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: null,
      restaurantSlug: null,
      deliveryFee: 0,
      minimumOrder: 0,

      // Check if adding from a different restaurant would conflict
      checkRestaurantConflict: (restaurantId: string): CartConflict => {
        const currentRestaurantId = get().restaurantId;
        if (currentRestaurantId && currentRestaurantId !== restaurantId) {
          return {
            hasConflict: true,
            currentRestaurantName: get().restaurantName,
          };
        }
        return { hasConflict: false, currentRestaurantName: null };
      },

      addItem: (item, restaurantInfo) => {
        const { restaurantId, restaurantName, restaurantSlug, deliveryFee, minimumOrder } = restaurantInfo;
        const currentRestaurantId = get().restaurantId;

        // If cart has items from a different restaurant, do nothing
        // The component should handle conflict with confirm dialog first
        if (currentRestaurantId && currentRestaurantId !== restaurantId) {
          return;
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
          deliveryFee: deliveryFee ?? state.deliveryFee,
          minimumOrder: minimumOrder ?? state.minimumOrder,
        }));
      },

      // Add item after clearing cart (used when user confirms clearing)
      addItemAfterClear: (item, restaurantInfo) => {
        const { restaurantId, restaurantName, restaurantSlug, deliveryFee, minimumOrder } = restaurantInfo;
        // Clear cart and add new item
        const cartItemId = `${item.menuItemId}-${Date.now()}-${Math.random()}`;
        set({
          items: [{ ...item, id: cartItemId }],
          restaurantId,
          restaurantName,
          restaurantSlug,
          deliveryFee: deliveryFee ?? 0,
          minimumOrder: minimumOrder ?? 0,
        });
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
            deliveryFee: newItems.length === 0 ? 0 : state.deliveryFee,
            minimumOrder: newItems.length === 0 ? 0 : state.minimumOrder,
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
        set({
          items: [],
          restaurantId: null,
          restaurantName: null,
          restaurantSlug: null,
          deliveryFee: 0,
          minimumOrder: 0,
        });
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

      getDeliveryFee: () => {
        return get().deliveryFee;
      },

      getMinimumOrder: () => {
        return get().minimumOrder;
      },
    }),
    {
      name: 'cart-storage', // localStorage key
    }
  )
);
