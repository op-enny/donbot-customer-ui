/**
 * React Hook for Customer Profile
 * Provides reactive access to customer profile data
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { customerProfileStorage } from '../customerProfile';
import type { CustomerProfile, DeliveryAddress, PaymentMethod, DeliveryMethod } from '../types';

export function useCustomerProfile() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile on mount
  useEffect(() => {
    const loadProfile = () => {
      const data = customerProfileStorage.getProfile();
      setProfile(data);
      setLoading(false);
    };

    loadProfile();
  }, []);

  // Update profile
  const updateProfile = useCallback((updates: Partial<CustomerProfile>) => {
    customerProfileStorage.updateProfile(updates);
    setProfile(customerProfileStorage.getProfile());
  }, []);

  // Save complete profile
  const saveProfile = useCallback((data: Partial<CustomerProfile>) => {
    customerProfileStorage.saveProfile(data);
    setProfile(customerProfileStorage.getProfile());
  }, []);

  // Add delivery address
  const addAddress = useCallback((address: Omit<DeliveryAddress, 'id' | 'last_used_at'>) => {
    customerProfileStorage.addDeliveryAddress(address);
    setProfile(customerProfileStorage.getProfile());
  }, []);

  // Update delivery address
  const updateAddress = useCallback((id: string, updates: Partial<DeliveryAddress>) => {
    customerProfileStorage.updateDeliveryAddress(id, updates);
    setProfile(customerProfileStorage.getProfile());
  }, []);

  // Remove delivery address
  const removeAddress = useCallback((id: string) => {
    customerProfileStorage.removeDeliveryAddress(id);
    setProfile(customerProfileStorage.getProfile());
  }, []);

  // Set default address
  const setDefaultAddress = useCallback((id: string) => {
    customerProfileStorage.setDefaultAddress(id);
    setProfile(customerProfileStorage.getProfile());
  }, []);

  // Get default address
  const getDefaultAddress = useCallback(() => {
    return customerProfileStorage.getDefaultAddress();
  }, []);

  // Get all addresses sorted
  const getAddresses = useCallback(() => {
    return customerProfileStorage.getDeliveryAddresses();
  }, []);

  // Set preferred payment method
  const setPreferredPayment = useCallback((method: PaymentMethod) => {
    customerProfileStorage.setPreferredPaymentMethod(method);
    setProfile(customerProfileStorage.getProfile());
  }, []);

  // Set preferred delivery method
  const setPreferredDelivery = useCallback((method: DeliveryMethod) => {
    customerProfileStorage.setPreferredDeliveryMethod(method);
    setProfile(customerProfileStorage.getProfile());
  }, []);

  // Clear profile
  const clearProfile = useCallback(() => {
    customerProfileStorage.clearProfile();
    setProfile(null);
  }, []);

  // Check if profile exists
  const hasProfile = useCallback(() => {
    return customerProfileStorage.hasProfile();
  }, []);

  // Get profile age
  const getProfileAge = useCallback(() => {
    return customerProfileStorage.getProfileAgeDays();
  }, []);

  return {
    profile,
    loading,
    updateProfile,
    saveProfile,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
    getDefaultAddress,
    getAddresses,
    setPreferredPayment,
    setPreferredDelivery,
    clearProfile,
    hasProfile,
    getProfileAge,
  };
}
