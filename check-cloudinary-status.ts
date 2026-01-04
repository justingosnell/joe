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

async function checkStatus() {
  try {
    console.log("📦 Connecting to Supabase database...");
    
    const cloudinaryCount = await sql`
      SELECT COUNT(*) as count
      FROM media
      WHERE url LIKE ${'%cloudinary%'}
    `;

    const r2Count = await sql`
      SELECT COUNT(*) as count
      FROM media
      WHERE url LIKE ${'%r2.cloudflarestorage.com%'}
    `;

    const totalCount = await sql`
      SELECT COUNT(*) as count
      FROM media
    `;

    console.log("\n📊 Media URL Status:");
    console.log(`  Total media items: ${totalCount[0].count}`);
    console.log(`  Cloudinary URLs: ${cloudinaryCount[0].count}`);
    console.log(`  R2 URLs: ${r2Count[0].count}`);
    console.log(`  Other: ${totalCount[0].count - cloudinaryCount[0].count - r2Count[0].count}\n`);

    if (cloudinaryCount[0].count > 0) {
      console.log("📋 Sample Cloudinary URLs:");
      const samples = await sql`
        SELECT id, "originalName", url
        FROM media
        WHERE url LIKE ${'%cloudinary%'}
        LIMIT 5
      `;
      
      samples.forEach(item => {
        console.log(`  - ${item.originalName}: ${item.url.substring(0, 80)}...`);
      });
    }

    await sql.end();
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : "Unknown error");
    await sql.end();
    process.exit(1);
  }
}

checkStatus();
