import "dotenv/config";
import { initializeDatabase } from "./server/db";
import { storage } from "./server/storage";
import { uploadFileToR2 } from "./server/r2-client";

async function migrateCloudinaryToR2() {
  console.log("🔄 Starting Cloudinary to R2 migration...\n");
  
  console.log("📦 Initializing database...");
  await initializeDatabase();
  console.log("✅ Database ready\n");

  const allMedia = await storage.getAllMedia();
  const cloudinaryMedia = allMedia.filter((m) => m.url.includes("cloudinary"));

  console.log(`📊 Stats:
  - Total media: ${allMedia.length}
  - Cloudinary URLs: ${cloudinaryMedia.length}
  - R2 URLs: ${allMedia.length - cloudinaryMedia.length}\n`);

  if (cloudinaryMedia.length === 0) {
    console.log("✅ No Cloudinary URLs found. Migration complete!");
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const media of cloudinaryMedia) {
    try {
      console.log(`📥 Downloading: ${media.originalName}`);

      const response = await fetch(media.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      console.log(`📤 Uploading to R2...`);
      const { publicUrl } = await uploadFileToR2(
        buffer,
        media.originalName,
        media.mimeType || "application/octet-stream"
      );

      console.log(`💾 Updating database...`);
      await storage.updateMedia(media.id, { url: publicUrl });

      console.log(`✅ Migrated: ${media.originalName} -> ${publicUrl.substring(0, 60)}...\n`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to migrate ${media.originalName}:`, error instanceof Error ? error.message : error);
      failCount++;
    }
  }

  console.log(`\n🎉 Migration complete!
  - Successful: ${successCount}
  - Failed: ${failCount}
  - Total migrated: ${successCount}/${cloudinaryMedia.length}`);
}

migrateCloudinaryToR2().catch(console.error);
