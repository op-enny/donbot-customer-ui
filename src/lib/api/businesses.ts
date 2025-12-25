import { apiClient } from './client';
import { ApiValidationError } from './restaurants';

/**
 * Input validation utilities for API parameters
 */
const validators = {
  isValidSlug: (slug: string): boolean => {
    if (!slug || typeof slug !== 'string') return false;
    return /^[a-z0-9][a-z0-9-]{0,98}[a-z0-9]$|^[a-z0-9]{1,2}$/.test(slug);
  },
  isValidLatitude: (lat: number): boolean => {
    return typeof lat === 'number' && !isNaN(lat) && lat >= -90 && lat <= 90;
  },
  isValidLongitude: (lng: number): boolean => {
    return typeof lng === 'number' && !isNaN(lng) && lng >= -180 && lng <= 180;
  },
  isValidRadius: (radiusKm: number): boolean => {
    return typeof radiusKm === 'number' && !isNaN(radiusKm) && radiusKm > 0 && radiusKm <= 1000;
  },
  isValidDate: (dateStr: string): boolean => {
    if (!dateStr || typeof dateStr !== 'string') return false;
    // Validate YYYY-MM-DD format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  },
  sanitizeSearchTerm: (term: string): string => {
    if (!term || typeof term !== 'string') return '';
    return term.trim().slice(0, 100).replace(/[<>'"`;\\]/g, '');
  },
};

export type BusinessType = 'restaurant' | 'grocery' | 'cafe' | 'bakery';
export type UnitType = 'piece' | 'kg' | 'gram' | 'liter' | 'ml';
export type StorageType = 'ambient' | 'chilled' | 'frozen';

export interface Business {
  id: string;
  name: string;
  slug: string;
  business_type: BusinessType;
  logo_url: string | null;
  banner_image_url: string | null;
  description?: string;
  cuisine_type: string | null;
  rating?: number;
  address?: string;
  phone?: string;
  delivery_time?: string;
  minimum_order?: number;
  delivery_fee?: number;
  is_open?: boolean;
  distance?: number;
  track_inventory?: boolean;
  has_delivery_slots?: boolean;
}

export interface MarketProductDetails {
  unit_type: UnitType;
  unit_price?: number;
  barcode?: string;
  stock_quantity: number;
  low_stock_threshold: number;
  storage_type: StorageType;
  brand?: string;
  origin_country?: string;
}

export interface VatRateInfo {
  id: string;
  code: string;
  name: string;
  rate: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Legacy: same as gross_price
  gross_price: number; // Consumer price (VAT included)
  net_price: number; // Price without VAT
  vat_rate_id?: string;
  vat_rate?: VatRateInfo;
  image_url: string | null;
  category: string;
  is_available: boolean;
  is_active?: boolean;
  is_popular?: boolean;
  // Market-specific fields (populated for market products)
  marketDetails?: MarketProductDetails;
}

export interface DeliverySlot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  max_orders: number;
  current_orders: number;
  is_active: boolean;
  is_available: boolean; // computed: current_orders < max_orders
}

// Use BusinessMenuWithCategories to avoid conflict with restaurants.ts
export interface BusinessMenuWithCategories {
  restaurant: Business;
  categories: {
    name: string;
    items: Product[];
  }[];
}

export const businessesApi = {
  /**
   * Get business by slug
   */
  getBusiness: async (slug: string): Promise<Business> => {
    if (!validators.isValidSlug(slug)) {
      throw new ApiValidationError('Invalid business slug format');
    }

    // Try new endpoint first, fall back to restaurant endpoint
    try {
      const response = await apiClient.get(`/public/businesses/${encodeURIComponent(slug)}`);
      return response.data;
    } catch {
      // Fallback for backward compatibility
      const response = await apiClient.get(`/public/restaurants/${encodeURIComponent(slug)}`);
      return { ...response.data, business_type: 'restaurant' };
    }
  },

  /**
   * Get menu/products for a business
   */
  getMenu: async (slug: string): Promise<BusinessMenuWithCategories> => {
    if (!validators.isValidSlug(slug)) {
      throw new ApiValidationError('Invalid business slug format');
    }

    const response = await apiClient.get(`/public/restaurants/${encodeURIComponent(slug)}/menu`);
    return response.data;
  },

  /**
   * Get market products with stock info
   */
  getMarketProducts: async (
    slug: string,
    options?: { category?: string; inStock?: boolean }
  ): Promise<Product[]> => {
    if (!validators.isValidSlug(slug)) {
      throw new ApiValidationError('Invalid business slug format');
    }

    const params: Record<string, string | boolean> = {};
    if (options?.category) params.category = options.category;
    if (options?.inStock !== undefined) params.in_stock = options.inStock;

    const response = await apiClient.get(
      `/public/businesses/${encodeURIComponent(slug)}/products`,
      { params }
    );
    return response.data;
  },

  /**
   * Get available delivery slots for a business
   */
  getDeliverySlots: async (slug: string, date?: string): Promise<DeliverySlot[]> => {
    if (!validators.isValidSlug(slug)) {
      throw new ApiValidationError('Invalid business slug format');
    }

    if (date && !validators.isValidDate(date)) {
      throw new ApiValidationError('Invalid date format: must be YYYY-MM-DD');
    }

    const params: Record<string, string> = {};
    if (date) params.date = date;

    const response = await apiClient.get(
      `/public/businesses/${encodeURIComponent(slug)}/delivery-slots`,
      { params }
    );

    // Add computed is_available field
    type ApiDeliverySlot = Omit<DeliverySlot, 'is_available'>;
    return response.data.map((slot: ApiDeliverySlot) => ({
      ...slot,
      is_available: slot.current_orders < slot.max_orders,
    }));
  },

  /**
   * Get nearby businesses (restaurants and/or markets)
   */
  getNearbyBusinesses: async (
    latitude: number,
    longitude: number,
    radiusKm: number = 5,
    businessType?: BusinessType,
    searchTerm?: string
  ): Promise<Business[]> => {
    if (!validators.isValidLatitude(latitude)) {
      throw new ApiValidationError('Invalid latitude: must be between -90 and 90');
    }
    if (!validators.isValidLongitude(longitude)) {
      throw new ApiValidationError('Invalid longitude: must be between -180 and 180');
    }
    if (!validators.isValidRadius(radiusKm)) {
      throw new ApiValidationError('Invalid radius: must be between 0 and 100 km');
    }

    try {
      const params: Record<string, string | number> = {
        latitude,
        longitude,
        radius: radiusKm * 1000, // Convert km to meters
      };

      if (businessType) {
        params.type = businessType;
      }

      if (searchTerm) {
        const sanitizedTerm = validators.sanitizeSearchTerm(searchTerm);
        if (sanitizedTerm) {
          params.search_text = sanitizedTerm;
        }
      }

      // Try new endpoint, fall back to old only for restaurants
      try {
        const response = await apiClient.get('/public/businesses/nearby', { params });
        return response.data;
      } catch (err) {
        // Only fallback to restaurant endpoint if NOT filtering by type
        // This prevents market queries from incorrectly showing restaurants
        if (!businessType || businessType === 'restaurant') {
          const response = await apiClient.get('/public/restaurants/nearby', { params });
          type ApiRestaurant = Omit<Business, 'business_type'>;
          return response.data.map((r: ApiRestaurant) => ({ ...r, business_type: 'restaurant' as const }));
        }
        // For non-restaurant types, return empty array instead of wrong data
        console.error('Failed to fetch businesses:', err);
        return [];
      }
    } catch (error) {
      if (error instanceof ApiValidationError) {
        throw error;
      }
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching nearby businesses:', error);
      }
      return [];
    }
  },
};
