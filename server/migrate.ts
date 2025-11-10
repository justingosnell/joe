import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(__dirname, "..", "migrations");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Note: DATABASE_URL should already have IPv4 address resolved by resolve-and-start.ts
const sql = postgres(databaseUrl, { 
  max: 1,
  ssl: { rejectUnauthorized: false },
  // Force IPv4 connection - Render has issues with IPv6
  socket: {
    family: 4, // 4 = IPv4, 6 = IPv6
  },
});
const db = drizzle(sql);

console.log("Running migrations...");
await migrate(db, { migrationsFolder });
console.log("✓ Migrations completed successfully");

await sql.end();