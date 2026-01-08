/**
 * Geocoding service using Geoapify
 * Converts city/state to latitude/longitude coordinates with precise accuracy
 */

const GEOAPIFY_URL = "https://api.geoapify.com/v1/geocode/search";
const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY || process.env.VITE_GEOAPIFY_API_KEY;
const CACHE = new Map<string, { latitude: number; longitude: number }>();

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function tryGeocodeQuery(query: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    if (!GEOAPIFY_API_KEY) {
      console.error("❌ Geoapify API key not configured");
      return null;
    }

    const url = new URL(GEOAPIFY_URL);
    url.searchParams.append("text", query);
    url.searchParams.append("apiKey", GEOAPIFY_API_KEY);
    url.searchParams.append("limit", "1");
    url.searchParams.append("format", "json");

    console.log(`🌍 Trying geocoding query: ${query}`);

    const response = await fetch(url.toString());

    console.log(`   Response status: ${response.status}`);

    if (!response.ok) {
      console.warn(`⚠️ Geocoding API error: ${response.status} for ${query}`);
      return null;
    }

    const data = await response.json();
    console.log(`   Results count: ${data.results?.length || 0}`);

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const coords = {
        latitude: result.lat,
        longitude: result.lon,
      };
      
      console.log(`   Raw coords: (${coords.latitude}, ${coords.longitude})`);
      console.log(`   US bounds check: ${isValidUSCoordinates(coords.latitude, coords.longitude)}`);

      // Validate coordinates
      if (
        !isNaN(coords.latitude) &&
        !isNaN(coords.longitude) &&
        coords.latitude >= -90 &&
        coords.latitude <= 90 &&
        coords.longitude >= -180 &&
        coords.longitude <= 180 &&
        isValidUSCoordinates(coords.latitude, coords.longitude)
      ) {
        console.log(`✅ Geocoded ${query}: (${coords.latitude}, ${coords.longitude})`);
        return coords;
      } else {
        console.warn(`⚠️ Invalid coordinates for ${query}: (${coords.latitude}, ${coords.longitude}) - not in valid US bounds`);
      }
    } else {
      console.log(`   No results found for query: ${query}`);
    }

    return null;
  } catch (error) {
    console.error(`❌ Geocoding error for query ${query}:`, error);
    return null;
  }
}

export async function geocodeLocation(
  city: string,
  state: string,
  country: string = "USA"
): Promise<{ latitude: number; longitude: number } | null> {
  if (!city?.trim() || !state?.trim()) {
    console.warn(`⚠️ Missing city or state for geocoding: city="${city}", state="${state}"`);
    return null;
  }

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

    // Try multiple query formats in order of preference
    const queries = [
      `${city}, ${state}, ${country}`,           // Full format
      `${city}, ${state}`,                       // City, State
      `${city} ${state}`,                        // City State (no comma)
      `${state}, ${country}`,                    // State, Country (fallback)
    ];

    for (const query of queries) {
      const result = await tryGeocodeQuery(query);
      if (result) {
        // Cache the result
        CACHE.set(cacheKey, result);
        return result;
      }
    }

    console.warn(`⚠️ No valid geocoding results found for ${city}, ${state} after trying ${queries.length} queries`);
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

/**
 * Check if coordinates are within reasonable bounds for US/Canada locations
 * This helps detect geocoding errors that place markers in wrong continents
 */
export function isValidUSCoordinates(latitude: number, longitude: number): boolean {
  // US and Canada bounds
  const minLat = 18.0;  // Southern Florida
  const maxLat = 84.0;  // Northern Canada
  const minLon = -180.0; // Western Pacific
  const maxLon = -50.0;  // Eastern Atlantic

  return (
    latitude >= minLat &&
    latitude <= maxLat &&
    longitude >= minLon &&
    longitude <= maxLon &&
    // Exclude obvious non-US/Canada locations (e.g., Africa would be around 0,0 to 40,40)
    !(latitude >= -10 && latitude <= 40 && longitude >= -20 && longitude <= 50)
  );
}