import "dotenv/config";
import { db } from "./server/db";
import { media, locations } from "@shared/schema";
import { eq } from "drizzle-orm";

async function investigate() {
  try {
    console.log("🔍 Investigating media discrepancy...\n");

    // Get all media records
    const allMedia = await db.select().from(media);
    console.log(`📊 Total media records: ${allMedia.length}`);

    // Get all locations
    const allLocations = await db.select().from(locations);
    console.log(`📍 Total locations: ${allLocations.length}`);

    // Get locations with photos
    const locationsWithPhotos = allLocations.filter(
      (l) => l.photoUrl && l.photoUrl.trim() !== ""
    );
    console.log(`📸 Locations with photos: ${locationsWithPhotos.length}`);

    // Get media IDs referenced by locations
    const referencedMediaIds = new Set(allLocations.map((l) => l.photoId).filter(Boolean));
    console.log(`🔗 Media IDs referenced by locations: ${referencedMediaIds.size}`);

    // Find orphaned media (not referenced by any location)
    const orphanedMedia = allMedia.filter((m) => !referencedMediaIds.has(m.id));
    console.log(`\n🚨 Orphaned media (not referenced by locations): ${orphanedMedia.length}`);

    if (orphanedMedia.length > 0) {
      console.log("   Orphaned media details:");
      orphanedMedia.slice(0, 10).forEach((m) => {
        console.log(`   - ${m.id}: ${m.filename} (${m.url})`);
      });
      if (orphanedMedia.length > 10) {
        console.log(`   ... and ${orphanedMedia.length - 10} more`);
      }
    }

    // Find duplicate media (same URL)
    const urlMap = new Map<string, typeof allMedia>();
    for (const item of allMedia) {
      if (!urlMap.has(item.url)) {
        urlMap.set(item.url, []);
      }
      urlMap.get(item.url)!.push(item);
    }

    const duplicatesByUrl = Array.from(urlMap.entries())
      .filter(([_, items]) => items.length > 1)
      .map(([url, items]) => ({ url, count: items.length, ids: items.map((i) => i.id) }));

    console.log(`\n🔀 Duplicate media (same URL): ${duplicatesByUrl.length}`);
    if (duplicatesByUrl.length > 0) {
      duplicatesByUrl.slice(0, 5).forEach((dup) => {
        console.log(`   - URL appears ${dup.count} times: ${dup.url}`);
        console.log(`     IDs: ${dup.ids.join(", ")}`);
      });
      if (duplicatesByUrl.length > 5) {
        console.log(`   ... and ${duplicatesByUrl.length - 5} more duplicates`);
      }
    }

    // Check for media with same filename
    const filenameMap = new Map<string, typeof allMedia>();
    for (const item of allMedia) {
      if (!filenameMap.has(item.filename)) {
        filenameMap.set(item.filename, []);
      }
      filenameMap.get(item.filename)!.push(item);
    }

    const duplicatesByFilename = Array.from(filenameMap.entries())
      .filter(([_, items]) => items.length > 1)
      .map(([filename, items]) => ({ filename, count: items.length, ids: items.map((i) => i.id) }));

    console.log(`\n📝 Duplicate media (same filename): ${duplicatesByFilename.length}`);

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("SUMMARY:");
    console.log(`  Media count: ${allMedia.length}`);
    console.log(`  Locations with photos: ${locationsWithPhotos.length}`);
    console.log(`  Difference: ${allMedia.length - locationsWithPhotos.length}`);
    console.log(`  Orphaned media: ${orphanedMedia.length}`);
    console.log(`  Total duplicate URLs: ${duplicatesByUrl.length}`);
    console.log(`  Total duplicate filenames: ${duplicatesByFilename.length}`);
    console.log("=".repeat(60));

    process.exit(0);
  } catch (error) {
    console.error("❌ Investigation failed:", error);
    process.exit(1);
  }
}

investigate();
