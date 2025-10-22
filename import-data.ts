import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function importData() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    // Read the export file
    const exportPath = path.resolve(__dirname, "data-export.json");
    if (!fs.existsSync(exportPath)) {
      throw new Error(`Export file not found at ${exportPath}`);
    }

    const data = JSON.parse(fs.readFileSync(exportPath, "utf-8"));
    console.log("📖 Read export file");

    // Connect to PostgreSQL
    const client = postgres(databaseUrl);
    const db = drizzle(client, { schema });

    console.log("🔗 Connected to PostgreSQL");

    // Import categories first (no dependencies)
    if (data.categories?.length > 0) {
      await db.insert(schema.categories).values(data.categories).onConflictDoNothing();
      console.log(`✅ Imported ${data.categories.length} categories`);
    }

    // Import users (referenced by other tables)
    if (data.users?.length > 0) {
      await db.insert(schema.users).values(data.users).onConflictDoNothing();
      console.log(`✅ Imported ${data.users.length} users`);
    }

    // Import locations
    if (data.locations?.length > 0) {
      await db.insert(schema.locations).values(data.locations).onConflictDoNothing();
      console.log(`✅ Imported ${data.locations.length} locations`);
    }

    // Import media
    if (data.media?.length > 0) {
      await db.insert(schema.media).values(data.media).onConflictDoNothing();
      console.log(`✅ Imported ${data.media.length} media files`);
    }

    // Import settings
    if (data.settings?.length > 0) {
      await db.insert(schema.settings).values(data.settings).onConflictDoNothing();
      console.log(`✅ Imported ${data.settings.length} settings`);
    }

    console.log("\n✅ Data import completed successfully!");

    await client.end();
  } catch (error) {
    console.error("❌ Import failed:", error);
    process.exit(1);
  }
}

importData();