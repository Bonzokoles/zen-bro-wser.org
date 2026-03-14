// src/active/utils/cache.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time To Live in milliseconds
}

export class Cache<T> {
  private storage = new Map<string, CacheEntry<T>>();

  set(key: string, data: T, ttlMs = 3600000) { // Default TTL: 1 hour
    this.storage.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  get(key: string): T | null {
    const entry = this.storage.get(key);
    if (!entry) {
      return null;
    }

    // Check if the entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.storage.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  // Periodically clear out expired entries
  startGarbageCollection(intervalMs = 600000) { // Default: 10 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.storage.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          this.storage.delete(key);
        }
      }
    }, intervalMs);
  }
}

// Example usage (can be exported as singletons)
export const aiCache = new Cache<string>();
export const pageCache = new Cache<string>();

/*
// Example of how to use it in a service

import { aiCache } from './cache';
import { aiProvider } from './aiProvider'; // Assuming an AI provider exists

async function cachedAICall(prompt: string): Promise<string> {
  const cachedResponse = aiCache.get(prompt);
  if (cachedResponse) {
    console.log("Returning cached AI response for:", prompt);
    return cachedResponse;
  }

  const freshResponse = await aiProvider.chat(prompt);
  aiCache.set(prompt, freshResponse, 3600000); // Cache for 1 hour

  return freshResponse;
}
*/
