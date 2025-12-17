interface CacheEntry {
  buffer: Buffer;
  mimeType: string;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
}

interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
}

export class ImageCache {
  private cache: Map<string, CacheEntry> = new Map();
  private stats = { hits: 0, misses: 0 };
  private maxSize: number;
  private maxAge: number;

  constructor(maxSize: number = 100, maxAgeMs: number = 60 * 60 * 1000) {
    this.maxSize = maxSize;
    this.maxAge = maxAgeMs;
    this.startCleanup();
  }

  set(id: string, buffer: Buffer, mimeType: string): void {
    const now = Date.now();
    
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(id, {
      buffer,
      mimeType,
      timestamp: now,
      accessCount: 0,
      lastAccess: now,
    });
  }

  get(id: string): { buffer: Buffer; mimeType: string } | null {
    const entry = this.cache.get(id);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > this.maxAge) {
      this.cache.delete(id);
      this.stats.misses++;
      return null;
    }

    entry.accessCount++;
    entry.lastAccess = now;
    this.stats.hits++;

    return { buffer: entry.buffer, mimeType: entry.mimeType };
  }

  delete(id: string): void {
    this.cache.delete(id);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0,
    };
  }

  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < lruTime) {
        lruTime = entry.lastAccess;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      console.log(`🗑️ Evicted image from cache: ${lruKey}`);
    }
  }

  private startCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > this.maxAge) {
          this.cache.delete(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        console.log(`🧹 Cache cleanup: removed ${cleaned} expired entries`);
      }
    }, 5 * 60 * 1000);
  }
}

export const imageCache = new ImageCache();
