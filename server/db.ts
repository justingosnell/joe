import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "path";
import { fileURLToPath } from "url";
import { lookup } from "dns/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(__dirname, "..", "migrations");

// Initialize database connection with IPv4 resolution
let client: postgres.Sql | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

// Force IPv4 address resolution by querying DNS directly
async function resolveToIPv4(hostname: string): Promise<string> {
  try {
    console.log(`🔍 Resolving ${hostname} to IPv4...`);
    const result = await lookup(hostname, { family: 4 });
    console.log(`✅ Resolved to IPv4: ${result.address}`);
    return result.address;
  } catch (error) {
    console.warn(`⚠️  Could not resolve ${hostname} to IPv4: ${(error as Error).message}`);
    // Return hostname as-is and hope for IPv4
    return hostname;
  }
}

export async function initializeDatabase() {
  if (_db) return _db;
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  
  try {
    const urlObj = new URL(databaseUrl);
    const hostname = urlObj.hostname;
    
    if (!hostname) {
      throw new Error("Could not extract hostname from DATABASE_URL");
    }
    
    let finalUrl = databaseUrl;
    
    // Only try to resolve if it's not already an IP address
    if (!/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      const ipv4 = await resolveToIPv4(hostname);
      if (ipv4 !== hostname) {
        finalUrl = databaseUrl.replace(hostname, ipv4);
        console.log(`✅ Updated connection URL with IPv4 address`);
      }
    } else {
      console.log(`✅ DATABASE_URL already has IPv4 address: ${hostname}`);
    }
    
    // Create connection with localhost binding to force IPv4
    client = postgres(finalUrl, {
      ssl: { rejectUnauthorized: false },
      socket: {
        family: 4,  // Force IPv4
      },
    });
    
    _db = drizzle(client, { schema });
    return _db;
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
    throw error;
  }
}

// Export getter that initializes on first access (for backward compatibility)
export function getDb(): ReturnType<typeof drizzle> {
  if (!_db) {
    throw new Error("Database not initialized. Call initializeDatabase() first.");
  }
  return _db;
}

// Create a lazy proxy for the db export
export const db = new Proxy({} as any, {
  get(target, prop) {
    if (!_db) {
      throw new Error("Database not initialized. Call initializeDatabase() first.");
    }
    return (_db as any)[prop];
  }
});

// Run migrations if needed
export async function runMigrations() {
  try {
    if (!_db) {
      throw new Error("Database not initialized");
    }
    console.log("🔄 Running database migrations...");
    await migrate(_db, { migrationsFolder });
    console.log("✅ Migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}