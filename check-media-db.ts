import { initializeDatabase, db } from "./server/db";
import { media } from "@shared/schema";

async function checkMedia() {
  await initializeDatabase();
  
  const allMedia = await db.select().from(media);
  console.log(`Total media records: ${allMedia.length}\n`);
  
  console.log("First 5 media records:");
  allMedia.slice(0, 5).forEach((m, i) => {
    console.log(`\n${i + 1}. ${m.originalName || m.filename}`);
    console.log(`   URL: ${m.url}`);
    console.log(`   Size: ${m.size}`);
  });
  
  const validUrls = allMedia.filter(m => m.url && m.url.includes("supabase"));
  const invalidUrls = allMedia.filter(m => !m.url || !m.url.includes("supabase"));
  
  console.log(`\n\nSummary:`);
  console.log(`  Valid Supabase URLs: ${validUrls.length}`);
  console.log(`  Invalid/missing URLs: ${invalidUrls.length}`);
}

checkMedia();
