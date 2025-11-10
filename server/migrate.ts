import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import path from "path";
import { fileURLToPath } from "url";
import { lookup } from "dns/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(__dirname, "..", "migrations");

// Force IPv4 address resolution by querying DNS directly
async function resolveToIPv4(hostname: string): Promise<string> {
  try {
    console.log(`🔍 Resolving ${hostname} to IPv4...`);
    const result = await lookup(hostname, { family: 4 });
    console.log(`✅ Resolved to IPv4: ${result.address}`);
    return result.address;
  } catch (error) {
    console.warn(`⚠️  Could not resolve ${hostname} to IPv4: ${(error as Error).message}`);
    return hostname;
  }
}

async function runMigrations() {
  let client: postgres.Sql | null = null;
  
  try {
    console.log("📋 Starting database migrations...");
    
    // Resolve DATABASE_URL hostname to IPv4 first (with graceful fallback)
    console.log("🔌 Resolving database connection...");
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    
    const urlObj = new URL(databaseUrl);
    const hostname = urlObj.hostname;
    if (!hostname) {
      throw new Error("Could not extract hostname from DATABASE_URL");
    }
    
    let finalUrl = databaseUrl;
    if (!/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      const ipv4 = await resolveToIPv4(hostname);
      if (ipv4 !== hostname) {
        finalUrl = databaseUrl.replace(hostname, ipv4);
        console.log(`✅ Updated connection URL with IPv4 address`);
      }
    } else {
      console.log(`✅ DATABASE_URL already has IPv4 address: ${hostname}`);
    }
    
    // Create connection with resolved IPv4 address
    try {
      console.log("🔗 Creating database connection...");
      client = postgres(finalUrl, { 
        ssl: { rejectUnauthorized: false },
        socket: {
          family: 4,  // Force IPv4
        },
      });
      console.log("✅ Database connection created");
    } catch (connError) {
      console.error("❌ Failed to create database connection:", connError);
      throw connError;
    }
    
    const db = drizzle(client);
    
    try {
      console.log("📝 Running migrations...");
      await migrate(db, { migrationsFolder });
      console.log("✅ Migrations completed successfully");
    } catch (migrateError) {
      console.error("❌ Migration execution failed:", migrateError);
      throw migrateError;
    }
    
    try {
      console.log("🔌 Closing database connection...");
      await client.end();
      console.log("✅ Connection closed");
    } catch (closeError) {
      console.error("⚠️  Error closing connection:", closeError);
      // Don't throw, we already succeeded with migrations
    }
    
  } catch (error) {
    console.error("\n❌ MIGRATION FAILED ❌");
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    
    // Try to close connection if it exists
    if (client) {
      try {
        await client.end();
      } catch {
        // Ignore cleanup errors
      }
    }
    
    process.exit(1);
  }
}

// Run migrations with timeout protection
const migrationTimeout = setTimeout(() => {
  console.error("❌ Migration timeout - process exceeded 60 seconds");
  process.exit(1);
}, 60000); // 60 second timeout for entire migration process

runMigrations()
  .then(() => {
    clearTimeout(migrationTimeout);
    console.log("\n✅ All done!\n");
  })
  .catch((error) => {
    clearTimeout(migrationTimeout);
    console.error("Unhandled error:", error);
    process.exit(1);
  });