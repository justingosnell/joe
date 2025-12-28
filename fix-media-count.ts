import "dotenv/config";
import { db } from "./server/db";
import { media, locations } from "@shared/schema";
import { ne, notInArray, sql } from "drizzle-orm";

async function fixMediaCount() {
  try {
    console.log("🔍 Analyzing media count discrepancy...\n");

    // Get total media count
    const allMedia = await db.select({ count: sql<number>`count(*)` }).from(media);
    const totalMedia = parseInt(String(allMedia[0].count), 10);
    console.log(`📊 Total media records in DB: ${totalMedia}`);

    // Get locations with photos count
    const locationsWithPhotos = await db
      .select({ count: sql<number>`count(*)` })
      .from(locations)
      .where(ne(locations.photoUrl, ""));
    const photoCount = parseInt(String(locationsWithPhotos[0].count), 10);
    console.log(`📸 Locations with photos: ${photoCount}`);

    console.log(`\n❓ Difference: ${totalMedia - photoCount} extra media files\n`);

    // Get all media IDs
    const allMediaIds = await db.select({ id: media.id }).from(media);
    const allPhotoIds = await db.select({ photoId: locations.photoId }).from(locations).where(ne(locations.photoId, ""));

    // Find orphaned media (not referenced by any location)
    const orphanedMediaIds = allMediaIds
      .map((m) => m.id)
      .filter((id) => !allPhotoIds.some((p) => p.photoId === id));

    console.log(`🚨 Found ${orphanedMediaIds.length} orphaned media files not referenced by any location`);

    if (orphanedMediaIds.length > 0) {
      console.log("\n🗑️  Deleting orphaned media files...");

      // Delete orphaned media in batches
      const batchSize = 50;
      let deletedCount = 0;

      for (let i = 0; i < orphanedMediaIds.length; i += batchSize) {
        const batch = orphanedMediaIds.slice(i, i + batchSize);
        const result = await db.delete(media).where(notInArray(media.id, batch)).returning();
        deletedCount += batch.length;
        console.log(`  ✓ Deleted batch: ${deletedCount}/${orphanedMediaIds.length}`);
      }

      console.log(`\n✅ Successfully deleted ${deletedCount} orphaned media files`);

      // Re-verify count
      const updatedMedia = await db.select({ count: sql<number>`count(*)` }).from(media);
      const newTotal = parseInt(String(updatedMedia[0].count), 10);
      console.log(`\n📊 New total media count: ${newTotal}`);
      console.log(`📸 Expected count (locations with photos): ${photoCount}`);

      if (newTotal === photoCount) {
        console.log("\n✨ SUCCESS: Counts now match!");
      } else {
        console.log(`\n⚠️  Count still differs by: ${newTotal - photoCount}`);
      }
    } else {
      console.log("✅ No orphaned media found!");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Fix failed:", error);
    process.exit(1);
  }
}

fixMediaCount();
