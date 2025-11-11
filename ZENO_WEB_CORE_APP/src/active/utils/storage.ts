// src/active/utils/storage.ts
/**
 * Safe localStorage/sessionStorage wrapper with error handling
 * Handles quota exceeded, privacy mode, and SSR scenarios
 */

type StorageType = 'local' | 'session';

class SafeStorage {
  private isAvailable(type: StorageType): boolean {
    try {
      const storage = type === 'local' ? localStorage : sessionStorage;
      const test = '__storage_test__';
      storage.setItem(test, test);
      storage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get item from storage with fallback
   */
  getItem(key: string, type: StorageType = 'local'): string | null {
    try {
      if (typeof window === 'undefined' || !this.isAvailable(type)) {
        return null;
      }
      const storage = type === 'local' ? localStorage : sessionStorage;
      return storage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get item from ${type}Storage:`, key, error);
      return null;
    }
  }

  /**
   * Set item in storage with error handling
   */
  setItem(key: string, value: string, type: StorageType = 'local'): boolean {
    try {
      if (typeof window === 'undefined' || !this.isAvailable(type)) {
        return false;
      }
      const storage = type === 'local' ? localStorage : sessionStorage;
      storage.setItem(key, value);
      return true;
    } catch (error) {
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error(`${type}Storage quota exceeded. Attempting to clear old data...`);
        this.clearOldEntries(type);
        // Try one more time
        try {
          const storage = type === 'local' ? localStorage : sessionStorage;
          storage.setItem(key, value);
          return true;
        } catch {
          console.error(`Failed to set item even after clearing: ${key}`);
          return false;
        }
      }
      console.warn(`Failed to set item in ${type}Storage:`, key, error);
      return false;
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string, type: StorageType = 'local'): boolean {
    try {
      if (typeof window === 'undefined' || !this.isAvailable(type)) {
        return false;
      }
      const storage = type === 'local' ? localStorage : sessionStorage;
      storage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove item from ${type}Storage:`, key, error);
      return false;
    }
  }

  /**
   * Clear all items from storage
   */
  clear(type: StorageType = 'local'): boolean {
    try {
      if (typeof window === 'undefined' || !this.isAvailable(type)) {
        return false;
      }
      const storage = type === 'local' ? localStorage : sessionStorage;
      storage.clear();
      return true;
    } catch (error) {
      console.warn(`Failed to clear ${type}Storage:`, error);
      return false;
    }
  }

  /**
   * Get and parse JSON from storage
   */
  getJSON<T>(key: string, type: StorageType = 'local'): T | null {
    const item = this.getItem(key, type);
    if (!item) return null;

    try {
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`Failed to parse JSON from ${type}Storage:`, key, error);
      return null;
    }
  }

  /**
   * Stringify and set JSON in storage
   */
  setJSON<T>(key: string, value: T, type: StorageType = 'local'): boolean {
    try {
      const json = JSON.stringify(value);
      return this.setItem(key, json, type);
    } catch (error) {
      console.warn(`Failed to stringify JSON for ${type}Storage:`, key, error);
      return false;
    }
  }

  /**
   * Check if key exists in storage
   */
  hasItem(key: string, type: StorageType = 'local'): boolean {
    return this.getItem(key, type) !== null;
  }

  /**
   * Get all keys from storage
   */
  keys(type: StorageType = 'local'): string[] {
    try {
      if (typeof window === 'undefined' || !this.isAvailable(type)) {
        return [];
      }
      const storage = type === 'local' ? localStorage : sessionStorage;
      return Object.keys(storage);
    } catch (error) {
      console.warn(`Failed to get keys from ${type}Storage:`, error);
      return [];
    }
  }

  /**
   * Get storage size estimate in bytes
   */
  getSize(type: StorageType = 'local'): number {
    try {
      if (typeof window === 'undefined' || !this.isAvailable(type)) {
        return 0;
      }
      const storage = type === 'local' ? localStorage : sessionStorage;
      let size = 0;
      for (const key in storage) {
        if (storage.hasOwnProperty(key)) {
          size += key.length + (storage.getItem(key)?.length || 0);
        }
      }
      return size;
    } catch (error) {
      console.warn(`Failed to calculate ${type}Storage size:`, error);
      return 0;
    }
  }

  /**
   * Clear entries older than specified days
   */
  private clearOldEntries(type: StorageType, daysOld: number = 30): void {
    try {
      const storage = type === 'local' ? localStorage : sessionStorage;
      const keys = Object.keys(storage);
      const now = Date.now();
      const cutoff = now - daysOld * 24 * 60 * 60 * 1000;

      keys.forEach(key => {
        try {
          const item = storage.getItem(key);
          if (item) {
            const data = JSON.parse(item);
            if (data.timestamp && data.timestamp < cutoff) {
              storage.removeItem(key);
            }
          }
        } catch {
          // Skip items that can't be parsed
        }
      });
    } catch (error) {
      console.warn(`Failed to clear old entries from ${type}Storage:`, error);
    }
  }

  /**
   * Set item with expiration
   */
  setItemWithExpiry(key: string, value: string, ttlMs: number, type: StorageType = 'local'): boolean {
    const item = {
      value,
      timestamp: Date.now(),
      expiry: Date.now() + ttlMs
    };
    return this.setJSON(key, item, type);
  }

  /**
   * Get item checking expiration
   */
  getItemWithExpiry(key: string, type: StorageType = 'local'): string | null {
    const item = this.getJSON<{value: string; expiry: number}>(key, type);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.removeItem(key, type);
      return null;
    }

    return item.value;
  }
}

// Export singleton instance
export const storage = new SafeStorage();

// Export convenience functions
export const {
  getItem,
  setItem,
  removeItem,
  clear,
  getJSON,
  setJSON,
  hasItem,
  keys,
  getSize,
  setItemWithExpiry,
  getItemWithExpiry
} = storage;

export default storage;
