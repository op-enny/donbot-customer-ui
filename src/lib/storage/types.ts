/**
 * Local Storage Type Definitions
 * All data stored in browser localStorage
 */

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';

export type PaymentMethod = 'cash_on_delivery' | 'card_on_delivery' | 'online';

export type DeliveryMethod = 'pickup' | 'delivery';

/**
 * Customer Profile
 * Stores customer information for auto-fill on checkout
 * Retention: 90 days from last update
 */
export interface CustomerProfile {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_addresses: DeliveryAddress[];
  preferred_payment_method?: PaymentMethod;
  preferred_delivery_method?: DeliveryMethod;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * Delivery Address
 * Stored as part of customer profile
 */
export interface DeliveryAddress {
  id: string; // UUID
  label: string; // "Home", "Work", "Other"
  address: string; // Full address string
  is_default: boolean;
  last_used_at: string; // ISO timestamp
}

/**
 * Order History Entry
 * Stores recent orders for tracking and reordering
 * Retention: 90 days from order creation
 */
export interface OrderHistoryEntry {
  order_id: string; // UUID from backend
  order_number: string; // "LIM-2025-000017"
  restaurant_slug: string; // "limon-grillhaus"
  restaurant_name: string; // "Limon Grillhaus"
  tracking_token: string; // For order tracking (expires after 7 days)
  total_amount: number;
  delivery_method: DeliveryMethod;
  payment_method: PaymentMethod;
  status: OrderStatus;
  created_at: string; // ISO timestamp
  estimated_ready_time?: string; // ISO timestamp
  items_summary: string; // "2x Döner im Brot, 1x Pizza Margherita"
  expires_at: string; // Tracking token expiry (created_at + 7 days)
}

/**
 * Recent Restaurant
 * Quick access to recently ordered restaurants
 * Retention: 90 days from last order
 */
export interface RecentRestaurant {
  slug: string;
  name: string;
  logo_url: string | null;
  last_ordered_at: string; // ISO timestamp
  order_count: number; // Total orders from this restaurant
}

/**
 * Privacy Consent
 * Tracks whether user has accepted data storage
 */
export interface PrivacyConsent {
  accepted: boolean;
  accepted_at: string; // ISO timestamp
  version: number; // Privacy policy version
}

/**
 * Storage Metadata
 * Version tracking for schema migrations
 */
export interface StorageMetadata {
  version: number;
  last_cleanup_at: string; // ISO timestamp
}
