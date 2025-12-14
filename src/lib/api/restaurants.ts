import { apiClient } from './client';

/**
 * Input validation utilities for API parameters
 */
const validators = {
  /**
   * Validate restaurant slug format
   * Only allows lowercase letters, numbers, and hyphens
   */
  isValidSlug: (slug: string): boolean => {
    if (!slug || typeof slug !== 'string') return false;
    // Only allow alphanumeric and hyphens, 2-100 chars
    return /^[a-z0-9][a-z0-9-]{0,98}[a-z0-9]$|^[a-z0-9]{1,2}$/.test(slug);
  },

  /**
   * Validate latitude (-90 to 90)
   */
  isValidLatitude: (lat: number): boolean => {
    return typeof lat === 'number' && !isNaN(lat) && lat >= -90 && lat <= 90;
  },

  /**
   * Validate longitude (-180 to 180)
   */
  isValidLongitude: (lng: number): boolean => {
    return typeof lng === 'number' && !isNaN(lng) && lng >= -180 && lng <= 180;
  },

  /**
   * Validate radius (positive, max 100km)
   */
  isValidRadius: (radiusKm: number): boolean => {
    return typeof radiusKm === 'number' && !isNaN(radiusKm) && radiusKm > 0 && radiusKm <= 100;
  },

  /**
   * Sanitize search term
   */
  sanitizeSearchTerm: (term: string): string => {
    if (!term || typeof term !== 'string') return '';
    // Remove potentially dangerous characters, limit length
    return term
      .trim()
      .slice(0, 100)
      .replace(/[<>'"`;\\]/g, '');
  },
};

export class ApiValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiValidationError';
  }
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  banner_image_url: string | null;
  cuisine_type: string | null;
  rating?: number;
  address?: string;
  phone?: string;
  delivery_time?: string;
  minimum_order?: number;
  delivery_fee?: number;
  is_open?: boolean;
  distance?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category: string;
  is_available: boolean;
  is_active?: boolean; // Deprecated, kept for backward compatibility
  is_popular?: boolean;
}

export interface MenuWithCategories {
  restaurant: Restaurant;
  categories: {
    name: string;
    items: MenuItem[];
  }[];
}

export const restaurantsApi = {
  /**
   * Get restaurant by slug
   * @throws {ApiValidationError} if slug format is invalid
   */
  getRestaurant: async (slug: string): Promise<Restaurant> => {
    // Validate slug format to prevent path traversal
    if (!validators.isValidSlug(slug)) {
      throw new ApiValidationError('Invalid restaurant slug format');
    }

    const response = await apiClient.get(`/public/restaurants/${encodeURIComponent(slug)}`);
    return response.data;
  },

  /**
   * Get restaurant menu with categories
   * @throws {ApiValidationError} if slug format is invalid
   */
  getMenu: async (slug: string): Promise<MenuWithCategories> => {
    // Validate slug format to prevent path traversal
    if (!validators.isValidSlug(slug)) {
      throw new ApiValidationError('Invalid restaurant slug format');
    }

    const response = await apiClient.get(`/public/restaurants/${encodeURIComponent(slug)}/menu`);
    return response.data;
  },

  /**
   * Get nearby restaurants
   * @throws {ApiValidationError} if coordinates or radius are invalid
   */
  getNearbyRestaurants: async (
    latitude: number,
    longitude: number,
    radiusKm: number = 5,
    searchTerm?: string
  ): Promise<Restaurant[]> => {
    // Validate coordinates
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

      if (searchTerm) {
        const sanitizedTerm = validators.sanitizeSearchTerm(searchTerm);
        if (sanitizedTerm) {
          params.search_text = sanitizedTerm;
        }
      }

      const response = await apiClient.get('/public/restaurants/nearby', {
        params,
      });
      return response.data;
    } catch (error) {
      if (error instanceof ApiValidationError) {
        throw error;
      }
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching nearby restaurants:', error);
      }
      return [];
    }
  },
};
