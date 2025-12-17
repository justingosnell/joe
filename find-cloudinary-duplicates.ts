import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import { db, initializeDatabase } from "./server/db";
import { media } from "@shared/schema";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function findDuplicates() {
  console.log("🔍 Starting duplicate search...");

  // Initialize DB
  await initializeDatabase();

  // 1. Fetch all media from DB
  console.log("📊 Fetching DB records...");
  const dbMedia = await db.select().from(media);
  const dbUrls = new Set(dbMedia.map((m) => m.url));
  console.log(`   Found ${dbMedia.length} records in DB.`);

  // 2. Fetch all resources from Cloudinary
  console.log("☁️  Fetching Cloudinary resources...");
  const resources: any[] = [];
  let nextCursor = null;

  try {
    do {
      const result: any = await cloudinary.api.resources({
        max_results: 500,
        next_cursor: nextCursor,
        metadata: true, 
        image_metadata: true,
        context: true
      });
      
      resources.push(...result.resources);
      nextCursor = result.next_cursor;
      process.stdout.write(`   Fetched ${resources.length} resources...\r`);
    } while (nextCursor);
    console.log(`\n   Total Cloudinary resources: ${resources.length}`);
  } catch (error) {
    console.error("❌ Error fetching from Cloudinary:", error);
    process.exit(1);
  }

  // 3. Group by ETag (MD5)
  console.log("dup Checking for duplicates (by content/etag)...");
  const byEtag = new Map<string, any[]>();
  
  for (const res of resources) {
    if (!res.etag) continue;
    if (!byEtag.has(res.etag)) {
      byEtag.set(res.etag, []);
    }
    byEtag.get(res.etag)!.push(res);
  }

  // Also group by size
  const bySize = new Map<number, any[]>();
  for (const res of resources) {
      if (!bySize.has(res.bytes)) {
          bySize.set(res.bytes, []);
      }
      bySize.get(res.bytes)!.push(res);
  }

  const sizeDuplicates = Array.from(bySize.entries()).filter(([_, items]) => items.length > 1);
  console.log(`⚠️  Found ${sizeDuplicates.length} groups of potential duplicates (by size).`);

  const duplicates = Array.from(byEtag.entries()).filter(([_, items]) => items.length > 1);
  
  if (duplicates.length > 0) {
    console.log(`⚠️  Found ${duplicates.length} groups of content duplicates (by ETag).`);
  } else {
    console.log("✅ No content duplicates found in Cloudinary (by ETag).");
  }

  // Let's focus on size duplicates for now since ETag failed
  let totalDeletable = 0;
  let totalBytesToFree = 0;
  const toDelete: any[] = [];

  for (const [size, items] of sizeDuplicates) {
      // Check usage
      const usage = items.map(item => {
        const isUsed = dbUrls.has(item.secure_url) || dbUrls.has(item.url);
        // Also check loose match
        let looseMatch = false;
        for (const url of dbUrls) {
            if (url && url.includes(item.public_id)) {
                looseMatch = true;
                break;
            }
        }
        return { ...item, isUsed: isUsed || looseMatch };
      });

      const usedItems = usage.filter(i => i.isUsed);
      const unusedItems = usage.filter(i => !i.isUsed);

      if (usedItems.length > 0 && unusedItems.length > 0) {
          // We have a used copy and unused copies of same size.
          // High chance unused ones are duplicates.
          console.log(`\nGroup (Size: ${size} bytes):`);
          console.log(`  Used: ${usedItems.length} (${usedItems[0].public_id})`);
          console.log(`  Unused: ${unusedItems.length}`);
          unusedItems.forEach(u => console.log(`    - ${u.public_id}`));
          
          toDelete.push(...unusedItems);
          totalDeletable += unusedItems.length;
          totalBytesToFree += unusedItems.reduce((acc, i) => acc + i.bytes, 0);
      } else if (usedItems.length === 0 && unusedItems.length > 1) {
          // All unused.
          console.log(`\nGroup (Size: ${size} bytes) - ALL UNUSED:`);
          unusedItems.forEach(u => console.log(`    - ${u.public_id}`));
          // Keep one, delete others?
          // toDelete.push(...unusedItems.slice(1));
          // totalDeletable += unusedItems.length - 1;
          // totalBytesToFree += unusedItems.slice(1).reduce((acc, i) => acc + i.bytes, 0);
      }
  }

  console.log("\nSummary of Deletable Duplicates (Same size as a used image, but unused):");
  console.log(`Files to delete: ${toDelete.length}`);
  console.log(`Space to free: ${(totalBytesToFree / 1024 / 1024).toFixed(2)} MB`);
  
  if (process.argv.includes("--delete") && toDelete.length > 0) {
      console.log("\n🗑️  Deleting files...");
      for (const item of toDelete) {
          try {
              await cloudinary.uploader.destroy(item.public_id);
              console.log(`  ✓ Deleted ${item.public_id}`);
          } catch (e) {
              console.error(`  ❌ Failed to delete ${item.public_id}:`, e);
          }
      }
      console.log("✅ Deletion complete.");
  } else if (toDelete.length > 0) {
      console.log("\n⚠️  Run with --delete to actually delete these files.");
  }

}

findDuplicates().catch(console.error);
