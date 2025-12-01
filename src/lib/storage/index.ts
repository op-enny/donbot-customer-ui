/**
 * Local Storage Module
 * Exports all storage services and types
 */

export { LocalStorageService, default as storage } from './localStorageService';
export { customerProfileStorage } from './customerProfile';
export { orderHistoryStorage } from './orderHistory';
export { cleanupService } from './cleanup';

export type {
  CustomerProfile,
  DeliveryAddress,
  OrderHistoryEntry,
  RecentRestaurant,
  PrivacyConsent,
  StorageMetadata,
  OrderStatus,
  PaymentMethod,
  DeliveryMethod,
} from './types';
