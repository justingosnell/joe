/**
 * Geocoding service using OpenStreetMap Nominatim
 * Converts city/state to latitude/longitude coordinates
 */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const CACHE = new Map<string, { latitude: number; longitude: number }>();

// Add rate limiting to respect Nominatim's 1 request/second limit
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1100; // 1.1 seconds to be safe

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function geocodeLocation(
  city: string,
  state: string,
  country: string = "USA"
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    // Create cache key
    const cacheKey = `${city}|${state}|${country}`.toLowerCase();
    
    // Check cache first
    if (CACHE.has(cacheKey)) {
      const cached = CACHE.get(cacheKey);
      if (cached) {
        console.log(`✓ Cache hit for ${city}, ${state}`);
        return cached;
      }
    }

    // Rate limiting - wait if needed
    const timeSinceLastRequest = Date.now() - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
    }

    lastRequestTime = Date.now();

    // Build query
    const query = `${city}, ${state}, ${country}`;
    const url = new URL(NOMINATIM_URL);
    url.searchParams.append("q", query);
    url.searchParams.append("format", "json");
    url.searchParams.append("limit", "1");

    console.log(`🌍 Geocoding: ${query}`);

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "RoadsideMap/1.0", // Nominatim requires a User-Agent
      },
    });

    if (!response.ok) {
      console.warn(`⚠️ Geocoding API error: ${response.status} for ${query}`);
      return null;
    }

    const results = await response.json();

    if (Array.isArray(results) && results.length > 0) {
      const result = results[0];
      const coords = {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
      };

      // Validate coordinates
      if (
        !isNaN(coords.latitude) &&
        !isNaN(coords.longitude) &&
        coords.latitude >= -90 &&
        coords.latitude <= 90 &&
        coords.longitude >= -180 &&
        coords.longitude <= 180
      ) {
        // Cache the result
        CACHE.set(cacheKey, coords);
        console.log(`✅ Geocoded ${query}: (${coords.latitude}, ${coords.longitude})`);
        return coords;
      }
    }

    console.warn(`⚠️ No geocoding results for ${query}`);
    return null;
  } catch (error) {
    console.error(`❌ Geocoding error for ${city}, ${state}:`, error);
    return null;
  }
}

export function clearGeocodeCache(): void {
  CACHE.clear();
  console.log("🗑️ Geocode cache cleared");
}

export function getGeocodeCache(): Map<string, { latitude: number; longitude: number }> {
  return CACHE;
}