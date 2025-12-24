import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Cart limits for security and performance
const MAX_CART_ITEMS = 100;
const MAX_ITEM_QUANTITY = 99;

export type UnitType = 'piece' | 'kg' | 'gram' | 'liter' | 'ml';

export interface MarketCartItem {
  id: string; // Unique cart item ID
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  // Market-specific fields
  unit_type: UnitType;
  unit_quantity?: number; // For kg/liter items (e.g., 0.5 for 500g)
  brand?: string;
  barcode?: string;
}

interface MarketInfo {
  marketId: string;
  marketName: string;
  marketSlug: string;
  deliveryFee?: number;
  minimumOrder?: number;
}

interface MarketCartConflict {
  hasConflict: boolean;
  currentMarketName: string | null;
}

interface MarketCartStore {
  items: MarketCartItem[];
  marketId: string | null;
  marketName: string | null;
  marketSlug: string | null;
  deliveryFee: number;
  minimumOrder: number;
  selectedDeliverySlotId: string | null;

  // Actions
  checkMarketConflict: (marketId: string) => MarketCartConflict;
  addItem: (item: Omit<MarketCartItem, 'id'>, marketInfo: MarketInfo) => void;
  addItemAfterClear: (item: Omit<MarketCartItem, 'id'>, marketInfo: MarketInfo) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateUnitQuantity: (itemId: string, unitQuantity: number) => void;
  setDeliverySlot: (slotId: string | null) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getDeliveryFee: () => number;
  getMinimumOrder: () => number;
}

export const useMarketCartStore = create<MarketCartStore>()(
  persist(
    (set, get) => ({
      items: [],
      marketId: null,
      marketName: null,
      marketSlug: null,
      deliveryFee: 0,
      minimumOrder: 0,
      selectedDeliverySlotId: null,

      checkMarketConflict: (marketId: string): MarketCartConflict => {
        const currentMarketId = get().marketId;
        if (currentMarketId && currentMarketId !== marketId) {
          return {
            hasConflict: true,
            currentMarketName: get().marketName,
          };
        }
        return { hasConflict: false, currentMarketName: null };
      },

      addItem: (item, marketInfo) => {
        const { marketId, marketName, marketSlug, deliveryFee, minimumOrder } = marketInfo;
        const currentMarketId = get().marketId;
        const currentItems = get().items;

        // If cart has items from a different market, do nothing
        if (currentMarketId && currentMarketId !== marketId) {
          return;
        }

        // Enforce quantity limit
        const safeQuantity = Math.min(item.quantity, MAX_ITEM_QUANTITY);

        // Check if same product already in cart (for piece items, merge quantity)
        const existingItemIndex = currentItems.findIndex(
          (i) => i.menuItemId === item.menuItemId && item.unit_type === 'piece'
        );

        if (existingItemIndex !== -1 && item.unit_type === 'piece') {
          // Merge quantities for piece items (with limit)
          set((state) => ({
            items: state.items.map((i, idx) =>
              idx === existingItemIndex
                ? { ...i, quantity: Math.min(i.quantity + safeQuantity, MAX_ITEM_QUANTITY) }
                : i
            ),
            marketId,
            marketName,
            marketSlug,
            deliveryFee: deliveryFee ?? state.deliveryFee,
            minimumOrder: minimumOrder ?? state.minimumOrder,
          }));
          return;
        }

        // Enforce cart item limit
        if (currentItems.length >= MAX_CART_ITEMS) {
          console.warn('Cart item limit reached');
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
              quantity: safeQuantity,
            },
          ],
          marketId,
          marketName,
          marketSlug,
          deliveryFee: deliveryFee ?? state.deliveryFee,
          minimumOrder: minimumOrder ?? state.minimumOrder,
        }));
      },

      addItemAfterClear: (item, marketInfo) => {
        const { marketId, marketName, marketSlug, deliveryFee, minimumOrder } = marketInfo;
        const cartItemId = `${item.menuItemId}-${Date.now()}-${Math.random()}`;
        set({
          items: [{ ...item, id: cartItemId }],
          marketId,
          marketName,
          marketSlug,
          deliveryFee: deliveryFee ?? 0,
          minimumOrder: minimumOrder ?? 0,
          selectedDeliverySlotId: null,
        });
      },

      removeItem: (itemId) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== itemId);
          return {
            items: newItems,
            marketId: newItems.length === 0 ? null : state.marketId,
            marketName: newItems.length === 0 ? null : state.marketName,
            marketSlug: newItems.length === 0 ? null : state.marketSlug,
            deliveryFee: newItems.length === 0 ? 0 : state.deliveryFee,
            minimumOrder: newItems.length === 0 ? 0 : state.minimumOrder,
            selectedDeliverySlotId: newItems.length === 0 ? null : state.selectedDeliverySlotId,
          };
        });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        // Enforce quantity limit
        const safeQuantity = Math.min(quantity, MAX_ITEM_QUANTITY);

        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity: safeQuantity } : item
          ),
        }));
      },

      updateUnitQuantity: (itemId, unitQuantity) => {
        if (unitQuantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, unit_quantity: unitQuantity } : item
          ),
        }));
      },

      setDeliverySlot: (slotId) => {
        set({ selectedDeliverySlotId: slotId });
      },

      clearCart: () => {
        set({
          items: [],
          marketId: null,
          marketName: null,
          marketSlug: null,
          deliveryFee: 0,
          minimumOrder: 0,
          selectedDeliverySlotId: null,
        });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          // For unit-based items (kg, liter), use unit_quantity
          if (item.unit_type !== 'piece' && item.unit_quantity) {
            return total + item.price * item.unit_quantity;
          }
          return total + item.price * item.quantity;
        }, 0);
      },

      getDeliveryFee: () => {
        return get().deliveryFee;
      },

      getMinimumOrder: () => {
        return get().minimumOrder;
      },
    }),
    {
      name: 'market-cart-storage', // Separate localStorage key from eat cart
    }
  )
);
