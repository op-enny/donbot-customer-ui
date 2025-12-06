import { apiClient } from './client';

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
  is_active: boolean;
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
   */
  getRestaurant: async (slug: string): Promise<Restaurant> => {
    const response = await apiClient.get(`/public/restaurants/${slug}`);
    return response.data;
  },

  /**
   * Get restaurant menu with categories
   */
  getMenu: async (slug: string): Promise<MenuWithCategories> => {
    const response = await apiClient.get(`/public/restaurants/${slug}/menu`);
    return response.data;
  },

  /**
   * Get nearby restaurants
   */
  getNearbyRestaurants: async (latitude: number, longitude: number, radiusKm: number = 5, searchTerm?: string): Promise<Restaurant[]> => {
    try {
      const params: any = {
        latitude,
        longitude,
        radius: radiusKm * 1000, // Convert km to meters
      };

      if (searchTerm) {
        params.search_text = searchTerm;
      }

      const response = await apiClient.get('/public/restaurants/nearby', {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby restaurants:', error);
      return [];
    }
  },
};
