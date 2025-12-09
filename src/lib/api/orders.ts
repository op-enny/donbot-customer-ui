import { apiClient } from './client';

export interface OrderItem {
  menu_item_id: string;
  quantity: number;
  options?: Record<string, any>;
  special_instructions?: string;
}

export interface CreateOrderDto {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_method: 'pickup' | 'delivery';
  delivery_address?: string;
  payment_method: 'cash_on_delivery' | 'card_on_delivery' | 'online';
  items: OrderItem[];
  notes?: string;
  idempotency_key?: string;
}

export interface OrderItemWithDetails {
  menu_item_name: string;
  quantity: number;
  price_snapshot: number;
  options?: Record<string, any>;
  special_instructions?: string;
}

export interface Order {
  id: string;
  restaurant_id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_method: 'pickup' | 'delivery';
  delivery_address: string | null;
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

export const ordersApi = {
  /**
   * Create a new order
   */
  createOrder: async (restaurantSlug: string, orderData: CreateOrderDto): Promise<Order> => {
    const response = await apiClient.post(`/public/restaurants/${restaurantSlug}/orders`, orderData);
    return response.data;
  },

  /**
   * Track an order by ID and token
   */
  trackOrder: async (orderId: string, token: string): Promise<Order> => {
    const response = await apiClient.get(`/public/orders/${orderId}`, {
      params: { token },
    });
    return response.data;
  },
};
