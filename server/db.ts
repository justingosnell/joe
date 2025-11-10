import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(__dirname, "..", "migrations");

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create connection with SSL configuration for Render
// Note: DATABASE_URL should already have IPv4 address resolved by resolve-and-start.ts
const client = postgres(databaseUrl, {
  ssl: { rejectUnauthorized: false },
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Run migrations if needed
export async function runMigrations() {
  try {
    console.log("🔄 Running database migrations...");
    await migrate(db, { migrationsFolder });
    console.log("✅ Migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}