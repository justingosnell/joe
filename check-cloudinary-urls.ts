import "dotenv/config";
import { initializeDatabase } from "./server/db";
import { storage } from "./server/storage";

async function checkUrls() {
  console.log("📦 Initializing database...");
  await initializeDatabase();
  
  const allMedia = await storage.getAllMedia();
  
  const cloudinaryUrls = allMedia.filter((m) => m.url.includes("cloudinary"));
  const r2Urls = allMedia.filter((m) => m.url.includes("r2.cloudflarestorage.com"));
  const otherUrls = allMedia.filter((m) => !m.url.includes("cloudinary") && !m.url.includes("r2.cloudflarestorage.com"));

  console.log("\n📊 Media URL Status:");
  console.log(`  Total media: ${allMedia.length}`);
  console.log(`  Cloudinary: ${cloudinaryUrls.length}`);
  console.log(`  R2: ${r2Urls.length}`);
  console.log(`  Other: ${otherUrls.length}\n`);

  if (cloudinaryUrls.length > 0) {
    console.log("🔗 Cloudinary URLs:");
    cloudinaryUrls.forEach((m) => {
      console.log(`  - ${m.originalName}: ${m.url.substring(0, 80)}...`);
    });
  }
}

checkUrls().catch(console.error);
