import "dotenv/config";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL not found in environment");
  process.exit(1);
}

const sql = postgres(databaseUrl, {
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false,
  } : false,
});

async function checkAll() {
  try {
    console.log("📦 Connecting to Supabase database...");
    
    const mediaItems = await sql`
      SELECT DISTINCT url
      FROM media
      ORDER BY url
    `;

    console.log(`\n📋 Unique URLs (${mediaItems.length} total):\n`);

    const urlsByHost: { [key: string]: number } = {};
    
    mediaItems.forEach(item => {
      try {
        const url = new URL(item.url);
        const host = url.hostname;
        urlsByHost[host] = (urlsByHost[host] || 0) + 1;
      } catch {
        urlsByHost['[invalid-url]'] = (urlsByHost['[invalid-url]'] || 0) + 1;
      }
    });

    Object.entries(urlsByHost).forEach(([host, count]) => {
      console.log(`  ${host}: ${count}`);
    });

    console.log("\nSample URLs by host:");
    
    if (urlsByHost['cloudinary.com']) {
      const samples = await sql`
        SELECT url FROM media WHERE url LIKE ${'%cloudinary%'} LIMIT 3
      `;
      console.log("\n  Cloudinary:");
      samples.forEach(s => console.log(`    - ${s.url.substring(0, 100)}`));
    }

    const r2Samples = await sql`
      SELECT url FROM media WHERE url LIKE ${'%r2%'} LIMIT 3
    `;
    if (r2Samples.length > 0) {
      console.log("\n  R2:");
      r2Samples.forEach(s => console.log(`    - ${s.url.substring(0, 100)}`));
    }

    const otherSamples = await sql`
      SELECT url FROM media WHERE url NOT LIKE ${'%cloudinary%'} AND url NOT LIKE ${'%r2%'} LIMIT 5
    `;
    if (otherSamples.length > 0) {
      console.log("\n  Other:");
      otherSamples.forEach(s => console.log(`    - ${s.url.substring(0, 100)}`));
    }

    await sql.end();
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : "Unknown error");
    await sql.end();
    process.exit(1);
  }
}

checkAll();
