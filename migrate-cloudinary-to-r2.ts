import { storage } from "./server/storage";
import { uploadFileToR2 } from "./server/r2-client";
import { initializeDatabase } from "./server/db";

async function migrateCloudinaryToR2() {
  console.log("🚀 Starting migration from Cloudinary to Cloudflare R2...\n");

  try {
    await initializeDatabase();

    const allMedia = await storage.getAllMedia();
    console.log(`📊 Found ${allMedia.length} media items\n`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    const cloudinaryMedia = allMedia.filter(m => m.url && m.url.includes("cloudinary"));
    console.log(`🔍 Found ${cloudinaryMedia.length} Cloudinary URLs to migrate\n`);

    for (const mediaItem of allMedia) {
      try {
        if (!mediaItem.url) {
          skippedCount++;
          continue;
        }

        if (!mediaItem.url.includes("cloudinary")) {
          skippedCount++;
          continue;
        }

        console.log(`📥 Downloading from Cloudinary: ${mediaItem.originalName}`);

        const response = await fetch(mediaItem.url);
        if (!response.ok) {
          throw new Error(`Failed to download: ${response.statusText}`);
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        console.log(`   Downloaded: ${buffer.length} bytes`);

        console.log(`📤 Uploading to R2...`);
        const result = await uploadFileToR2(
          buffer,
          mediaItem.originalName,
          mediaItem.mimeType
        );

        console.log(`🔗 Updating database with new R2 URL`);
        await storage.updateMedia(mediaItem.id, {
          url: result.publicUrl,
        });

        console.log(`✅ Migrated: ${mediaItem.originalName}\n`);
        migratedCount++;
        
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(
          `❌ Error migrating ${mediaItem.originalName}:`,
          error instanceof Error ? error.message : "Unknown error"
        );
        errorCount++;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log("\n📊 Migration Summary:");
    console.log(`   ✅ Migrated: ${migratedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(
      `\n✨ Migration complete! All Cloudinary images have been moved to R2.`
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Migration failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    process.exit(1);
  }
}

migrateCloudinaryToR2();
