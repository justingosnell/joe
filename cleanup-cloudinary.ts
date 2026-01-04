import "dotenv/config";
import { Pool } from "pg";

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
    
    if (response.ok || data.result === "ok") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

async function cleanup() {
  console.log("🚀 Starting Cloudinary cleanup...\n");
  console.log("📋 This will:");
  console.log("  1. Update storage_backend from 'cloudinary' to 'r2'");
  console.log("  2. Delete images from Cloudinary\n");

  const client = await pool.connect();

  try {
    console.log("📦 Fetching images with cloudinary storage_backend...");
    
    const result = await client.query(`
      SELECT id, original_name, storage_backend
      FROM media
      WHERE storage_backend = 'cloudinary'
      ORDER BY uploaded_at DESC
    `);

    const cloudinaryMedia = result.rows;
    console.log(`✅ Found ${cloudinaryMedia.length} media items\n`);

    if (cloudinaryMedia.length === 0) {
      console.log("✨ No cloudinary storage_backend items found!");
      client.release();
      pool.end();
      process.exit(0);
    }

    let updatedCount = 0;
    let deletedCount = 0;
    let errorCount = 0;

    for (const mediaItem of cloudinaryMedia) {
      try {
        console.log(`\n📝 Processing: ${mediaItem.original_name}`);

        const publicId = `joe-app/media/${mediaItem.original_name}`;
        console.log(`   Cloudinary public_id: ${publicId}`);

        console.log(`   🗑️  Attempting to delete from Cloudinary...`);
        const deleted = await deleteFromCloudinary(publicId);
        
        if (deleted) {
          console.log(`   ✅ Deleted from Cloudinary`);
          deletedCount++;
        } else {
          console.log(`   ⚠️  Could not delete (may not exist or already deleted)`);
        }

        console.log(`   🔗 Updating storage_backend to 'r2'...`);
        await client.query(
          `UPDATE media SET storage_backend = 'r2' WHERE id = $1`,
          [mediaItem.id]
        );

        console.log(`   ✅ Updated in database`);
        updatedCount++;

        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(
          `   ❌ Error processing ${mediaItem.original_name}:`,
          error instanceof Error ? error.message : "Unknown error"
        );
        errorCount++;

        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.log("\n\n📊 Cleanup Summary:");
    console.log(`   ✅ Updated in database: ${updatedCount}`);
    console.log(`   🗑️  Deleted from Cloudinary: ${deletedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(
      `\n✨ Cleanup complete! All media items now use R2 storage.`
    );

    client.release();
    pool.end();
    process.exit(errorCount > 0 ? 1 : 0);
  } catch (error) {
    console.error(
      "❌ Cleanup failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    client.release();
    pool.end();
    process.exit(1);
  }
}

cleanup();
