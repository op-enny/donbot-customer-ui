/**
 * Customer Profile Storage
 * Manages customer information for auto-fill on checkout
 */

import { v4 as uuidv4 } from 'uuid';
import LocalStorageService from './localStorageService';
import type { CustomerProfile, DeliveryAddress, PaymentMethod, DeliveryMethod } from './types';

const STORAGE_KEY = 'customer_profile';

export const customerProfileStorage = {
  /**
   * Get customer profile from localStorage
   */
  getProfile(): CustomerProfile | null {
    return LocalStorageService.get<CustomerProfile>(STORAGE_KEY);
  },

  /**
   * Save complete customer profile
   */
  saveProfile(profile: Partial<CustomerProfile>): void {
    const now = new Date().toISOString();
    const existing = this.getProfile();

    const updated: CustomerProfile = {
      customer_name: profile.customer_name || existing?.customer_name || '',
      customer_phone: profile.customer_phone || existing?.customer_phone || '',
      customer_email: profile.customer_email || existing?.customer_email,
      delivery_addresses: profile.delivery_addresses || existing?.delivery_addresses || [],
      preferred_payment_method: profile.preferred_payment_method || existing?.preferred_payment_method,
      preferred_delivery_method: profile.preferred_delivery_method || existing?.preferred_delivery_method,
      created_at: existing?.created_at || now,
      updated_at: now,
    };

    LocalStorageService.set(STORAGE_KEY, updated);
  },

  /**
   * Update specific fields in customer profile
   */
  updateProfile(updates: Partial<CustomerProfile>): void {
    const existing = this.getProfile();
    if (!existing) {
      this.saveProfile(updates);
      return;
    }

    const updated: CustomerProfile = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    LocalStorageService.set(STORAGE_KEY, updated);
  },

  /**
   * Add a new delivery address
   */
  addDeliveryAddress(address: Omit<DeliveryAddress, 'id' | 'last_used_at'>): void {
    const profile = this.getProfile();
    const addresses = profile?.delivery_addresses || [];

    // If this is the first address or marked as default, set all others to non-default
    if (address.is_default || addresses.length === 0) {
      addresses.forEach((addr) => {
        addr.is_default = false;
      });
    }

    const newAddress: DeliveryAddress = {
      ...address,
      id: uuidv4(),
      is_default: address.is_default || addresses.length === 0, // First address is default
      last_used_at: new Date().toISOString(),
    };

    this.updateProfile({
      delivery_addresses: [...addresses, newAddress],
    });
  },

  /**
   * Update an existing delivery address
   */
  updateDeliveryAddress(id: string, updates: Partial<DeliveryAddress>): void {
    const profile = this.getProfile();
    if (!profile) return;

    const addresses = profile.delivery_addresses.map((addr) => {
      if (addr.id === id) {
        return {
          ...addr,
          ...updates,
          last_used_at: new Date().toISOString(),
        };
      }
      // If setting this as default, unset others
      if (updates.is_default) {
        return { ...addr, is_default: false };
      }
      return addr;
    });

    this.updateProfile({ delivery_addresses: addresses });
  },

  /**
   * Remove a delivery address
   */
  removeDeliveryAddress(id: string): void {
    const profile = this.getProfile();
    if (!profile) return;

    const addresses = profile.delivery_addresses.filter((addr) => addr.id !== id);

    // If we removed the default address and there are others, set first as default
    const hasDefault = addresses.some((addr) => addr.is_default);
    if (!hasDefault && addresses.length > 0) {
      addresses[0].is_default = true;
    }

    this.updateProfile({ delivery_addresses: addresses });
  },

  /**
   * Set an address as default
   */
  setDefaultAddress(id: string): void {
    const profile = this.getProfile();
    if (!profile) return;

    const addresses = profile.delivery_addresses.map((addr) => ({
      ...addr,
      is_default: addr.id === id,
    }));

    this.updateProfile({ delivery_addresses: addresses });
  },

  /**
   * Get default delivery address
   */
  getDefaultAddress(): DeliveryAddress | null {
    const profile = this.getProfile();
    if (!profile) return null;

    return profile.delivery_addresses.find((addr) => addr.is_default) || null;
  },

  /**
   * Get all delivery addresses sorted by last used
   */
  getDeliveryAddresses(): DeliveryAddress[] {
    const profile = this.getProfile();
    if (!profile) return [];

    return profile.delivery_addresses.sort((a, b) => {
      // Default address first
      if (a.is_default) return -1;
      if (b.is_default) return 1;

      // Then by last used
      return new Date(b.last_used_at).getTime() - new Date(a.last_used_at).getTime();
    });
  },

  /**
   * Update last used timestamp for an address
   */
  markAddressAsUsed(id: string): void {
    const profile = this.getProfile();
    if (!profile) return;

    const addresses = profile.delivery_addresses.map((addr) => {
      if (addr.id === id) {
        return {
          ...addr,
          last_used_at: new Date().toISOString(),
        };
      }
      return addr;
    });

    this.updateProfile({ delivery_addresses: addresses });
  },

  /**
   * Set preferred payment method
   */
  setPreferredPaymentMethod(method: PaymentMethod): void {
    this.updateProfile({ preferred_payment_method: method });
  },

  /**
   * Set preferred delivery method
   */
  setPreferredDeliveryMethod(method: DeliveryMethod): void {
    this.updateProfile({ preferred_delivery_method: method });
  },

  /**
   * Clear customer profile
   */
  clearProfile(): void {
    LocalStorageService.remove(STORAGE_KEY);
  },

  /**
   * Check if profile exists
   */
  hasProfile(): boolean {
    return LocalStorageService.has(STORAGE_KEY);
  },

  /**
   * Check if profile is expired (90 days)
   */
  isProfileExpired(): boolean {
    const profile = this.getProfile();
    if (!profile) return true;

    const updatedAt = new Date(profile.updated_at);
    const now = new Date();
    const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;

    return now.getTime() - updatedAt.getTime() > NINETY_DAYS;
  },

  /**
   * Get profile age in days
   */
  getProfileAgeDays(): number | null {
    const profile = this.getProfile();
    if (!profile) return null;

    const updatedAt = new Date(profile.updated_at);
    const now = new Date();
    const diffMs = now.getTime() - updatedAt.getTime();

    return Math.floor(diffMs / (24 * 60 * 60 * 1000));
  },
};

export default customerProfileStorage;
