import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "path";
import { fileURLToPath } from "url";
import { resolveDatabase } from "./ipv4-resolver";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(__dirname, "..", "migrations");

// Initialize database connection with IPv4 resolution
let client: postgres.Sql | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

export async function initializeDatabase() {
  if (_db) return _db;
  
  // Resolve DATABASE_URL hostname to IPv4 (with graceful fallback)
  const resolvedUrl = await resolveDatabase();
  
  // Create connection with resolved IPv4 address
  client = postgres(resolvedUrl, {
    ssl: { rejectUnauthorized: false },
  });
  
  _db = drizzle(client, { schema });
  return _db;
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