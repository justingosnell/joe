import { supabase } from "./supabase-client";

const SUPABASE_BUCKET_LIMIT_BYTES = 1 * 1024 * 1024 * 1024;
const THRESHOLD_PERCENTAGE = 0.95;

interface StorageStats {
  usedBytes: number;
  limitBytes: number;
  percentageUsed: number;
  isNearCapacity: boolean;
}

let cachedStats: StorageStats | null = null;
let lastCheckTime = 0;
const CACHE_DURATION = 60 * 1000;

export async function getStorageStats(): Promise<StorageStats> {
  const now = Date.now();

  if (cachedStats && now - lastCheckTime < CACHE_DURATION) {
    return cachedStats;
  }

  try {
    if (!supabase) {
      console.warn("⚠️ Supabase not configured, returning empty storage stats");
      return {
        usedBytes: 0,
        limitBytes: SUPABASE_BUCKET_LIMIT_BYTES,
        percentageUsed: 0,
        isNearCapacity: false,
      };
    }

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET || "media")
      .list();

    if (error) {
      console.error("❌ Failed to get bucket stats:", error.message);
      return {
        usedBytes: 0,
        limitBytes: SUPABASE_BUCKET_LIMIT_BYTES,
        percentageUsed: 0,
        isNearCapacity: false,
      };
    }

    let totalBytes = 0;
    if (data) {
      for (const file of data) {
        if (file.metadata?.size) {
          totalBytes += file.metadata.size;
        }
      }
    }

    const percentageUsed = (totalBytes / SUPABASE_BUCKET_LIMIT_BYTES) * 100;
    const isNearCapacity = percentageUsed >= THRESHOLD_PERCENTAGE * 100;

    cachedStats = {
      usedBytes: totalBytes,
      limitBytes: SUPABASE_BUCKET_LIMIT_BYTES,
      percentageUsed,
      isNearCapacity,
    };

    lastCheckTime = now;

    console.log(`📊 Storage stats:`, {
      usedGB: (totalBytes / (1024 * 1024 * 1024)).toFixed(2),
      limitGB: 1,
      percentageUsed: percentageUsed.toFixed(2),
      nearCapacity: isNearCapacity,
    });

    return cachedStats;
  } catch (error) {
    console.error("❌ Storage monitoring error:", error);
    return {
      usedBytes: 0,
      limitBytes: SUPABASE_BUCKET_LIMIT_BYTES,
      percentageUsed: 0,
      isNearCapacity: false,
    };
  }
}

export async function shouldUseCloudinary(): Promise<boolean> {
  const stats = await getStorageStats();
  return stats.isNearCapacity;
}
