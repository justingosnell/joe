import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function mergeData() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    // Read the export file (backup with all 53 locations)
    const exportPath = path.resolve(__dirname, "data-export.json");
    if (!fs.existsSync(exportPath)) {
      throw new Error(`Export file not found at ${exportPath}`);
    }

    const backupData = JSON.parse(fs.readFileSync(exportPath, "utf-8"));
    console.log("📖 Read backup file with", backupData.locations.length, "locations");

    // Connect to PostgreSQL with SSL
    const client = postgres(databaseUrl, {
      ssl: "require",
      max: 1,
    });
    const db = drizzle(client, { schema });
    console.log("🔗 Connected to PostgreSQL");

    // Get current locations from database
    const currentLocations = await db.select().from(schema.locations);
    console.log("📍 Found", currentLocations.length, "current locations in database (with pictures)");

    // Create a set of current location IDs
    const currentLocationIds = new Set(currentLocations.map(loc => loc.id));

    // Find locations in backup that aren't in current database
    const missingLocations = backupData.locations.filter(
      loc => !currentLocationIds.has(loc.id)
    );

    console.log("🆕 Found", missingLocations.length, "missing locations to import");

    if (missingLocations.length === 0) {
      console.log("✅ Database is already up to date!");
      await client.end();
      return;
    }

    // Import missing locations
    if (missingLocations.length > 0) {
      await db.insert(schema.locations).values(missingLocations);
      console.log(`✅ Imported ${missingLocations.length} missing locations`);
    }

    // Import media for the new locations (if any)
    if (backupData.media?.length > 0) {
      const missingLocationIds = new Set(missingLocations.map(loc => loc.id));
      const newMedia = backupData.media.filter(
        m => missingLocationIds.has(m.locationId)
      );
      
      if (newMedia.length > 0) {
        await db.insert(schema.media).values(newMedia);
        console.log(`✅ Imported ${newMedia.length} media files for new locations`);
      }
    }

    console.log("\n✅ Data merge completed successfully!");
    console.log(`   Total locations now: ${currentLocations.length + missingLocations.length}`);

    await client.end();
  } catch (error) {
    console.error("❌ Merge failed:", error);
    process.exit(1);
  }
}

mergeData();