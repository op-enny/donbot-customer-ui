/**
 * Auto-Cleanup Service
 * Removes expired data from localStorage (90-day retention)
 */

import LocalStorageService from './localStorageService';
import { customerProfileStorage } from './customerProfile';
import { orderHistoryStorage } from './orderHistory';
import type { StorageMetadata, CustomerProfile, OrderHistoryEntry } from './types';

/** GDPR data export structure */
interface DataExport {
  customer_profile: CustomerProfile | null;
  order_history: OrderHistoryEntry[];
  statistics: {
    total_orders: number;
    active_orders: number;
    completed_orders: number;
    total_spent: number;
    favorite_restaurant: { name: string; count: number } | null;
  };
  metadata: StorageMetadata | null;
  exported_at: string;
}

const METADATA_KEY = 'storage_metadata';
const CLEANUP_INTERVAL_DAYS = 1; // Run cleanup daily

export const cleanupService = {
  /**
   * Get cleanup metadata
   */
  getMetadata(): StorageMetadata | null {
    return LocalStorageService.get<StorageMetadata>(METADATA_KEY);
  },

  /**
   * Set cleanup metadata
   */
  setMetadata(metadata: StorageMetadata): void {
    LocalStorageService.set(METADATA_KEY, metadata);
  },

  /**
   * Check if cleanup is needed
   */
  shouldRunCleanup(): boolean {
    const metadata = this.getMetadata();
    if (!metadata) return true; // First run

    const lastCleanup = new Date(metadata.last_cleanup_at);
    const now = new Date();
    const daysSinceCleanup = (now.getTime() - lastCleanup.getTime()) / (24 * 60 * 60 * 1000);

    return daysSinceCleanup >= CLEANUP_INTERVAL_DAYS;
  },

  /**
   * Run full cleanup of expired data
   */
  runCleanup(): void {
    console.log('[Cleanup] Starting expired data cleanup...');

    const stats = {
      profile_cleaned: false,
      orders_removed: 0,
    };

    // 1. Clean up customer profile if expired (90 days)
    if (customerProfileStorage.isProfileExpired()) {
      customerProfileStorage.clearProfile();
      stats.profile_cleaned = true;
      console.log('[Cleanup] Customer profile expired, removed');
    }

    // 2. Clean up expired orders (90 days)
    const ordersBefore = orderHistoryStorage.getOrderCount();
    orderHistoryStorage.cleanupExpired();
    const ordersAfter = orderHistoryStorage.getOrderCount();
    stats.orders_removed = ordersBefore - ordersAfter;

    // 3. Update metadata
    this.setMetadata({
      version: 1,
      last_cleanup_at: new Date().toISOString(),
    });

    console.log('[Cleanup] Cleanup complete:', stats);
  },

  /**
   * Auto-cleanup on app load (if needed)
   */
  autoCleanup(): void {
    if (this.shouldRunCleanup()) {
      this.runCleanup();
    } else {
      const metadata = this.getMetadata();
      if (metadata) {
        console.log(`[Cleanup] Last cleanup: ${metadata.last_cleanup_at}`);
      }
    }
  },

  /**
   * Force cleanup (for manual trigger)
   */
  forceCleanup(): void {
    this.runCleanup();
  },

  /**
   * Get cleanup statistics
   */
  getCleanupStats(): {
    last_cleanup: string | null;
    profile_age_days: number | null;
    total_orders: number;
    trackable_orders: number;
    storage_size: string;
  } {
    const metadata = this.getMetadata();
    const profileAge = customerProfileStorage.getProfileAgeDays();
    const totalOrders = orderHistoryStorage.getOrderCount();
    const trackableOrders = orderHistoryStorage.getTrackableOrders().length;
    const storageSize = LocalStorageService.getStorageSizeFormatted();

    return {
      last_cleanup: metadata?.last_cleanup_at || null,
      profile_age_days: profileAge,
      total_orders: totalOrders,
      trackable_orders: trackableOrders,
      storage_size: storageSize,
    };
  },

  /**
   * Clear all DonBot data (GDPR right to erasure)
   */
  clearAllData(): void {
    console.log('[Cleanup] Clearing all DonBot data...');

    customerProfileStorage.clearProfile();
    orderHistoryStorage.clearHistory();
    LocalStorageService.remove(METADATA_KEY);

    console.log('[Cleanup] All data cleared');
  },

  /**
   * Export all data for GDPR compliance
   */
  exportAllData(): DataExport {
    return {
      customer_profile: customerProfileStorage.getProfile(),
      order_history: orderHistoryStorage.getOrders(),
      statistics: orderHistoryStorage.getStatistics(),
      metadata: this.getMetadata(),
      exported_at: new Date().toISOString(),
    };
  },

  /**
   * Download data export as JSON file
   */
  downloadDataExport(): void {
    const data = this.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donbot-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

export default cleanupService;
