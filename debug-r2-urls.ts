import "dotenv/config";
import { initializeDatabase } from "./server/db";
import { storage } from "./server/storage";

async function debugUrls() {
  await initializeDatabase();
  
  const allMedia = await storage.getAllMedia();
  const r2Media = allMedia.filter((m) => m.url.includes("r2.cloudflarestorage.com"));

  if (r2Media.length === 0) {
    console.log("No R2 URLs found");
    return;
  }

  console.log("Sample R2 URLs:");
  r2Media.slice(0, 5).forEach((m) => {
    console.log(`\n📄 ${m.originalName}`);
    console.log(`   URL: ${m.url}`);
  });
}

debugUrls().catch(console.error);
