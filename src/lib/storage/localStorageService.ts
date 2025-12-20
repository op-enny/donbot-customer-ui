/**
 * Local Storage Service
 * Type-safe wrapper around browser localStorage with expiration support
 */

const STORAGE_PREFIX = 'donbot_';

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export class LocalStorageService {
  /**
   * Get item from localStorage with automatic JSON parsing
   */
  static get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      if (!item) return null;

      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`[LocalStorage] Error reading key "${key}":`, error);
      return null;
    }
  }

  /**
   * Set item in localStorage with automatic JSON stringification
   */
  static set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;

    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(STORAGE_PREFIX + key, serialized);
    } catch (error) {
      console.error(`[LocalStorage] Error writing key "${key}":`, error);
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('[LocalStorage] Storage quota exceeded. Consider clearing old data.');
      }
    }
  }

  /**
   * Remove item from localStorage
   */
  static remove(key: string): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
      console.error(`[LocalStorage] Error removing key "${key}":`, error);
    }
  }

  /**
   * Clear all DonBot items from localStorage
   */
  static clear(): void {
    if (typeof window === 'undefined') return;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      console.log('[LocalStorage] All DonBot data cleared');
    } catch (error) {
      console.error('[LocalStorage] Error clearing storage:', error);
    }
  }

  /**
   * Check if item exists in localStorage
   */
  static has(key: string): boolean {
    if (typeof window === 'undefined') return false;

    return localStorage.getItem(STORAGE_PREFIX + key) !== null;
  }

  /**
   * Get all DonBot keys in localStorage
   */
  static getAllKeys(): string[] {
    if (typeof window === 'undefined') return [];

    const keys = Object.keys(localStorage);
    return keys
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .map((key) => key.replace(STORAGE_PREFIX, ''));
  }

  /**
   * Get storage size in bytes (approximate)
   */
  static getStorageSize(): number {
    if (typeof window === 'undefined') return 0;

    let totalSize = 0;
    const keys = Object.keys(localStorage);

    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      }
    });

    return totalSize;
  }

  /**
   * Get storage size in human-readable format
   */
  static getStorageSizeFormatted(): string {
    const bytes = this.getStorageSize();

    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  /**
   * Export all DonBot data as JSON (for GDPR compliance)
   */
  static exportData(): Record<string, JsonValue> {
    if (typeof window === 'undefined') return {};

    const data: Record<string, JsonValue> = {};
    const keys = this.getAllKeys();

    keys.forEach((key) => {
      const value = this.get<JsonValue>(key);
      if (value !== null) {
        data[key] = value;
      }
    });

    return data;
  }

  /**
   * Import data from JSON export
   */
  static importData(data: Record<string, JsonValue>): void {
    Object.entries(data).forEach(([key, value]) => {
      this.set(key, value);
    });
  }
}

export default LocalStorageService;
