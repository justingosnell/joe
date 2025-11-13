import { initializeDatabase, db } from "./server/db";
import { media } from "@shared/schema";
import fetch from "node-fetch";

async function testImages() {
  await initializeDatabase();
  
  const allMedia = await db.select().from(media);
  
  console.log(`Testing ${Math.min(10, allMedia.length)} image URLs...\n`);
  
  for (let i = 0; i < Math.min(10, allMedia.length); i++) {
    const m = allMedia[i];
    try {
      const response = await fetch(m.url as any, { timeout: 5000 });
      const status = response.status;
      const size = response.headers.get('content-length');
      console.log(`${i + 1}. ${m.originalName}`);
      console.log(`   Status: ${status} ${status === 200 ? '✓' : '✗'}`);
      console.log(`   Size: ${size} bytes`);
    } catch (err) {
      console.log(`${i + 1}. ${m.originalName}`);
      console.log(`   Error: ${err instanceof Error ? err.message : err}`);
    }
  }
}

testImages();
