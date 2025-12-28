import { storage } from "./server/storage";
import { supabase } from "./server/supabase-client";
import { uploadFileToCloudinary } from "./server/cloudinary-client";
import { initializeDatabase } from "./server/db";

async function migrateImagesToCloudinary() {
  console.log("🚀 Starting migration to Cloudinary...");
  console.log("📌 Initializing database...");

  try {
    await initializeDatabase();
    console.log("✅ Database initialized");

    const allMedia = await storage.getAllMedia();
    console.log(`📊 Found ${allMedia.length} images to migrate`);

    let successful = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < allMedia.length; i++) {
      const media = allMedia[i];
      const progress = `[${i + 1}/${allMedia.length}]`;

      if (media.storageBackend === "cloudinary") {
        console.log(`⏭️  ${progress} Skipping ${media.filename} (already on Cloudinary)`);
        skipped++;
        continue;
      }

      if (!media.storagePath) {
        console.log(`⏭️  ${progress} Skipping ${media.filename} (no storage path)`);
        skipped++;
        continue;
      }

      try {
        console.log(`📥 ${progress} Downloading ${media.filename} from Supabase...`);

        const bucket = process.env.SUPABASE_BUCKET || "media";
        const { data, error } = await supabase.storage
          .from(bucket)
          .download(media.storagePath);

        if (error || !data) {
          throw new Error(`Failed to download: ${error?.message || "No data"}`);
        }

        const buffer = Buffer.from(await data.arrayBuffer());

        console.log(`📤 ${progress} Uploading ${media.filename} to Cloudinary...`);
        const { publicUrl: cloudinaryUrl } = await uploadFileToCloudinary(
          buffer,
          media.filename
        );

        console.log(`✅ ${progress} Migrated ${media.filename}`);
        console.log(`   Old: ${media.url}`);
        console.log(`   New: ${cloudinaryUrl}`);

        await storage.updateMedia(media.id, {
          url: cloudinaryUrl,
          storageBackend: "cloudinary",
        });

        successful++;
      } catch (error) {
        console.error(`❌ ${progress} Failed to migrate ${media.filename}:`, error instanceof Error ? error.message : error);
        failed++;
      }
    }

    console.log("\n📈 Migration Summary:");
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📊 Total: ${allMedia.length}`);

    if (failed === 0) {
      console.log("\n🎉 All images migrated successfully!");
    } else {
      console.log(`\n⚠️  ${failed} images failed. You can re-run this script to retry.`);
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateImagesToCloudinary();
