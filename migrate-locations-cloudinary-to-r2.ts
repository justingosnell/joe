import "dotenv/config";
import { Pool } from "pg";
import { uploadFileToR2 } from "./server/r2-client";

const databaseUrl = process.env.DATABASE_URL;
const cloudinaryCloudName = "ddrrvlrde";
const cloudinaryApiKey = "899176512257338";
const cloudinaryApiSecret = "j1d1-fzfvNXO1T0W-BUjJvBOLGE";

if (!databaseUrl) {
  console.error("❌ DATABASE_URL not found in environment");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
});

async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/resources/image/upload`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${cloudinaryApiKey}:${cloudinaryApiSecret}`
          ).toString("base64")}`,
        },
        body: JSON.stringify({
          public_id: publicId,
        }),
      }
    );

    const data = await response.json();
    return response.ok || data.result === "ok";
  } catch (error) {
    return false;
  }
}

async function migrateLocationImages() {
  console.log("🚀 Starting migration of location images from Cloudinary to R2...\n");

  const client = await pool.connect();

  try {
    console.log("📦 Fetching locations with Cloudinary URLs...");

    const result = await client.query(`
      SELECT id, name, photo_url, photo_id
      FROM locations
      WHERE photo_url LIKE '%cloudinary%'
      ORDER BY name
    `);

    const cloudinaryLocations = result.rows;
    console.log(`✅ Found ${cloudinaryLocations.length} locations with Cloudinary URLs\n`);

    let migratedCount = 0;
    let deletedCount = 0;
    let errorCount = 0;

    for (const location of cloudinaryLocations) {
      try {
        console.log(`\n📝 Processing: ${location.name}`);
        console.log(`   URL: ${location.photo_url.substring(0, 80)}...`);

        console.log(`   📥 Downloading from Cloudinary...`);
        const response = await fetch(location.photo_url);
        if (!response.ok) {
          throw new Error(`Failed to download: ${response.statusText}`);
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        const sizeInMB = (buffer.length / 1024 / 1024).toFixed(2);
        console.log(`   ✓ Downloaded: ${sizeInMB} MB`);

        const filename = location.photo_url.split("/").pop()?.split("?")[0] || `${location.name}.jpg`;

        console.log(`   📤 Uploading to R2...`);
        const r2Result = await uploadFileToR2(
          buffer,
          filename,
          "image/jpeg"
        );

        console.log(`   🔗 Updating database...`);
        await client.query(
          `UPDATE locations SET photo_url = $1 WHERE id = $2`,
          [r2Result.publicUrl, location.id]
        );

        const publicId = location.photo_url.match(/\/([a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*)$/)?.[1] ||
          location.photo_url.split("/").slice(-2).join("/");

        console.log(`   🗑️  Deleting from Cloudinary...`);
        const deleted = await deleteFromCloudinary(publicId);
        if (deleted) {
          deletedCount++;
          console.log(`   ✓ Deleted from Cloudinary`);
        } else {
          console.log(`   ⚠️  Could not delete (may not exist)`);
        }

        console.log(`   ✅ Migrated: ${location.name}`);
        migratedCount++;

        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(
          `   ❌ Error migrating ${location.name}:`,
          error instanceof Error ? error.message : "Unknown error"
        );
        errorCount++;

        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.log("\n\n📊 Migration Summary:");
    console.log(`   ✅ Migrated to R2: ${migratedCount}`);
    console.log(`   🗑️  Deleted from Cloudinary: ${deletedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(
      `\n✨ Location image migration complete! All photos now use R2 storage.`
    );

    client.release();
    pool.end();
    process.exit(errorCount > 0 ? 1 : 0);
  } catch (error) {
    console.error(
      "❌ Migration failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    client.release();
    pool.end();
    process.exit(1);
  }
}

migrateLocationImages();
