import "dotenv/config";
import { initializeDatabase } from "./server/db";
import { storage } from "./server/storage";

async function fixR2Urls() {
  console.log("🔧 Fixing R2 URLs with proper encoding...\n");

  await initializeDatabase();

  const allMedia = await storage.getAllMedia();
  const r2Media = allMedia.filter((m) => m.url.includes("r2.cloudflarestorage.com"));

  if (r2Media.length === 0) {
    console.log("✅ No R2 URLs found to fix");
    return;
  }

  console.log(`📋 Found ${r2Media.length} R2 media items to check/fix\n`);

  let fixedCount = 0;
  let skippedCount = 0;

  for (const media of r2Media) {
    const originalUrl = media.url;
    
    const urlParts = originalUrl.split("r2.cloudflarestorage.com/");
    if (urlParts.length !== 2) {
      console.log(`⚠️  Skipping: Invalid URL format: ${originalUrl}`);
      skippedCount++;
      continue;
    }

    const [domain, path] = urlParts;
    
    const fixedPath = encodeURI(decodeURI(path));
    
    if (fixedPath === path) {
      console.log(`✅ Already encoded: ${media.originalName}`);
      skippedCount++;
      continue;
    }

    const fixedUrl = `${domain}r2.cloudflarestorage.com/${fixedPath}`;

    console.log(`🔄 Fixing: ${media.originalName}`);
    console.log(`   Old: ${originalUrl}`);
    console.log(`   New: ${fixedUrl}\n`);

    try {
      await storage.updateMedia(media.id, {
        url: fixedUrl,
      });
      fixedCount++;
    } catch (error) {
      console.error(`❌ Failed to fix ${media.originalName}:`, error);
    }
  }

  console.log(`\n✨ Done! Fixed ${fixedCount} URLs, Skipped ${skippedCount} URLs`);
}

fixR2Urls().catch(console.error);
