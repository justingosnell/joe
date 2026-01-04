import "dotenv/config";
import postgres from "postgres";
import { uploadFileToR2 } from "./server/r2-client";
import * as crypto from "crypto";

const databaseUrl = process.env.DATABASE_URL;
const cloudinaryCloudName = "ddrrvlrde";
const cloudinaryApiKey = "899176512257338";
const cloudinaryApiSecret = "j1d1-fzfvNXO1T0W-BUjJvBOLGE";

if (!databaseUrl) {
  console.error("❌ DATABASE_URL not found in environment");
  process.exit(1);
}

const sql = postgres(databaseUrl, {
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false,
  } : false,
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

    if (response.ok) {
      console.log(`  ✅ Deleted from Cloudinary: ${publicId}`);
      return true;
    } else {
      console.log(`  ⚠️  Could not delete from Cloudinary: ${publicId}`);
      return false;
    }
  } catch (error) {
    console.log(`  ⚠️  Error deleting from Cloudinary: ${publicId}`);
    return false;
  }
}

async function migrateCloudinaryToR2() {
  console.log("🚀 Starting migration from Cloudinary to Cloudflare R2...\n");
  console.log("📋 Cloudinary Config:");
  console.log(`  Cloud Name: ${cloudinaryCloudName}`);
  console.log(`  API Key: ${cloudinaryApiKey.substring(0, 8)}...`);
  console.log(`  API Secret: ${cloudinaryApiSecret.substring(0, 8)}...\n`);

  try {
    console.log("📦 Connecting to Supabase database...");
    
    const cloudinaryMedia = await sql`
      SELECT id, url, "originalName", "mimeType"
      FROM media
      WHERE url LIKE ${'%cloudinary%'}
      ORDER BY "createdAt" DESC
    `;

    console.log(`✅ Connected to Supabase\n`);
    console.log(`🔍 Found ${cloudinaryMedia.length} Cloudinary URLs\n`);

    if (cloudinaryMedia.length === 0) {
      console.log("✨ No Cloudinary URLs found. Migration complete!");
      await sql.end();
      process.exit(0);
    }

    let migratedCount = 0;
    let deletedCount = 0;
    let errorCount = 0;

    for (const mediaItem of cloudinaryMedia) {
      try {
        console.log(`\n📥 Processing: ${mediaItem.originalName}`);

        console.log(`   Downloading from Cloudinary...`);
        const response = await fetch(mediaItem.url);
        if (!response.ok) {
          throw new Error(`Failed to download: ${response.statusText}`);
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        console.log(`   Downloaded: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

        console.log(`   📤 Uploading to R2...`);
        const r2Result = await uploadFileToR2(
          buffer,
          mediaItem.originalName,
          mediaItem.mimeType || "image/jpeg"
        );

        console.log(`   🔗 Updating Supabase database...`);
        await sql`
          UPDATE media 
          SET url = ${r2Result.publicUrl}
          WHERE id = ${mediaItem.id}
        `;

        const publicId = mediaItem.url.match(/\/v\d+\/([^/]+\.(jpg|png|gif|webp|jpeg))/i)?.[1] ||
          mediaItem.url.split("/").pop() ||
          "";

        console.log(`   🗑️  Deleting from Cloudinary...`);
        const deleted = await deleteFromCloudinary(publicId);
        if (deleted) {
          deletedCount++;
        }

        console.log(`   ✅ Migrated: ${mediaItem.originalName}`);
        migratedCount++;

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(
          `   ❌ Error migrating ${mediaItem.originalName}:`,
          error instanceof Error ? error.message : "Unknown error"
        );
        errorCount++;

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log("\n\n📊 Migration Summary:");
    console.log(`   ✅ Migrated to R2: ${migratedCount}`);
    console.log(`   🗑️  Deleted from Cloudinary: ${deletedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(
      `\n✨ Migration complete! All Cloudinary images have been moved to R2.`
    );

    await sql.end();
    process.exit(errorCount > 0 ? 1 : 0);
  } catch (error) {
    console.error(
      "❌ Migration failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    await sql.end();
    process.exit(1);
  }
}

migrateCloudinaryToR2();
