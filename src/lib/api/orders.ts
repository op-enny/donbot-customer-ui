import { apiClient } from './client';

/**
 * Client-side rate limiting for order submissions
 * Prevents accidental double-clicks and spam
 */
class OrderRateLimiter {
  private lastSubmissionTime: number = 0;
  private submissionCount: number = 0;
  private windowStart: number = Date.now();

  private readonly MIN_INTERVAL_MS = 2000; // 2 seconds between submissions
  private readonly MAX_SUBMISSIONS_PER_WINDOW = 5; // Max 5 submissions per window
  private readonly WINDOW_DURATION_MS = 60000; // 1 minute window

  /**
   * Check if a new submission is allowed
   * @returns { allowed: boolean, retryAfterMs?: number, reason?: string }
   */
  canSubmit(): { allowed: boolean; retryAfterMs?: number; reason?: string } {
    const now = Date.now();

    // Reset window if expired
    if (now - this.windowStart > this.WINDOW_DURATION_MS) {
      this.windowStart = now;
      this.submissionCount = 0;
    }

    // Check minimum interval
    const timeSinceLastSubmission = now - this.lastSubmissionTime;
    if (timeSinceLastSubmission < this.MIN_INTERVAL_MS) {
      return {
        allowed: false,
        retryAfterMs: this.MIN_INTERVAL_MS - timeSinceLastSubmission,
        reason: 'Please wait a moment before trying again',
      };
    }

    // Check submissions per window
    if (this.submissionCount >= this.MAX_SUBMISSIONS_PER_WINDOW) {
      const windowRemainingMs = this.WINDOW_DURATION_MS - (now - this.windowStart);
      return {
        allowed: false,
        retryAfterMs: windowRemainingMs,
        reason: 'Too many order attempts. Please wait before trying again.',
      };
    }

    return { allowed: true };
  }

  /**
   * Record a submission attempt
   */
  recordSubmission(): void {
    this.lastSubmissionTime = Date.now();
    this.submissionCount++;
  }

  /**
   * Reset the rate limiter (e.g., after successful order)
   */
  reset(): void {
    this.submissionCount = 0;
    this.windowStart = Date.now();
  }
}

// Singleton instance
const orderRateLimiter = new OrderRateLimiter();

/**
 * Input validation for orders API
 */
const orderValidators = {
  /**
   * Validate restaurant slug format
   */
  isValidSlug: (slug: string): boolean => {
    if (!slug || typeof slug !== 'string') return false;
    return /^[a-z0-9][a-z0-9-]{0,98}[a-z0-9]$|^[a-z0-9]{1,2}$/.test(slug);
  },

  /**
   * Validate order ID format (UUID)
   */
  isValidOrderId: (id: string): boolean => {
    if (!id || typeof id !== 'string') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  },

  /**
   * Validate tracking token format (64 hex chars)
   */
  isValidToken: (token: string): boolean => {
    if (!token || typeof token !== 'string') return false;
    return /^[0-9a-f]{64}$/i.test(token);
  },

  /**
   * Validate order items
   */
  validateOrderItems: (items: OrderItem[]): string | null => {
    if (!Array.isArray(items) || items.length === 0) {
      return 'Order must contain at least one item';
    }
    if (items.length > 50) {
      return 'Order cannot contain more than 50 items';
    }
    for (const item of items) {
      if (!item.menu_item_id || typeof item.menu_item_id !== 'string') {
        return 'Invalid menu item ID';
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
        return 'Invalid quantity: must be between 1 and 99';
      }
    }
    return null;
  },
};

export class OrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderValidationError';
  }
}

/** Modifier selection options (e.g., { sauce: "Knoblauch", salad: "Alles" }) */
export type ModifierOptions = Record<string, string | number | boolean | string[]>;

export interface OrderItem {
  menu_item_id: string;
  quantity: number;
  unit_quantity?: number; // For market items (kg, liter)
  options?: ModifierOptions;
  special_instructions?: string;
}

export interface CreateOrderDto {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_method: 'pickup' | 'delivery';
  delivery_address?: string;
  delivery_slot_id?: string; // For market orders with scheduled delivery
  payment_method: 'cash_on_delivery' | 'card_on_delivery' | 'online';
  items: OrderItem[];
  notes?: string;
  idempotency_key?: string;
}

export interface OrderItemWithDetails {
  menu_item_name: string;
  quantity: number;
  price_snapshot: number;
  options?: ModifierOptions;
  special_instructions?: string;
}

export interface Order {
  id: string;
  restaurant_id: string;
  restaurant_name?: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_method: 'pickup' | 'delivery';
  delivery_address: string | null;
  delivery_slot_id?: string | null; // For market orders with scheduled delivery
  payment_method: string;
  payment_status: string;
  status: string;
  total_amount: number;
  notes: string | null;
  created_at: string;
  tracking_token?: string;
  tracking_url?: string;
  estimated_ready_time?: string;
  items?: OrderItemWithDetails[];
}

/**
 * Custom error for rate limiting
 */
export class RateLimitError extends Error {
  retryAfterMs: number;

  constructor(message: string, retryAfterMs: number) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfterMs = retryAfterMs;
  }
}

export const ordersApi = {
  /**
   * Create a new order with client-side rate limiting and validation
   * @throws {RateLimitError} if rate limit is exceeded
   * @throws {OrderValidationError} if input validation fails
   */
  createOrder: async (restaurantSlug: string, orderData: CreateOrderDto): Promise<Order> => {
    // Validate restaurant slug
    if (!orderValidators.isValidSlug(restaurantSlug)) {
      throw new OrderValidationError('Invalid restaurant slug format');
    }

    // Validate order items
    const itemsError = orderValidators.validateOrderItems(orderData.items);
    if (itemsError) {
      throw new OrderValidationError(itemsError);
    }

    // Check rate limit before submission
    const rateLimitCheck = orderRateLimiter.canSubmit();
    if (!rateLimitCheck.allowed) {
      throw new RateLimitError(
        rateLimitCheck.reason || 'Rate limit exceeded',
        rateLimitCheck.retryAfterMs || 2000
      );
    }

    // Record submission attempt
    orderRateLimiter.recordSubmission();

    try {
      const response = await apiClient.post(
        `/public/restaurants/${encodeURIComponent(restaurantSlug)}/orders`,
        orderData
      );
      // Reset rate limiter on successful order
      orderRateLimiter.reset();
      return response.data;
    } catch (error) {
      // Re-throw the error for handling upstream
      throw error;
    }
  },

  /**
   * Track an order by ID and token
   * @throws {OrderValidationError} if order ID or token format is invalid
   */
  trackOrder: async (orderId: string, token: string): Promise<Order> => {
    // Validate order ID format
    if (!orderValidators.isValidOrderId(orderId)) {
      throw new OrderValidationError('Invalid order ID format');
    }

    // Validate token format
    if (!orderValidators.isValidToken(token)) {
      throw new OrderValidationError('Invalid tracking token format');
    }

    const response = await apiClient.get(`/public/orders/${encodeURIComponent(orderId)}`, {
      params: { token },
    });
    return response.data;
  },

  /**
   * Check if order submission is currently rate limited
   */
  checkRateLimit: (): { allowed: boolean; retryAfterMs?: number; reason?: string } => {
    return orderRateLimiter.canSubmit();
  },
};
