import "dotenv/config";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL not found in environment");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
});

async function checkUrls() {
  const client = await pool.connect();

  try {
    console.log("📦 Checking location photo URLs...\n");

    const countResult = await client.query(`
      SELECT COUNT(*) as total FROM locations
    `);
    console.log(`Total locations: ${countResult.rows[0].total}`);

    const urlPatternResult = await client.query(`
      SELECT 
        CASE 
          WHEN photo_url LIKE '%cloudinary%' THEN 'Cloudinary'
          WHEN photo_url LIKE '%r2.cloudflarestorage.com%' THEN 'Cloudflare R2'
          WHEN photo_url LIKE '%supabase%' THEN 'Supabase'
          WHEN photo_url IS NULL OR photo_url = '' THEN 'NULL/Empty'
          ELSE 'Other'
        END as url_type,
        COUNT(*) as count
      FROM locations
      GROUP BY url_type
      ORDER BY count DESC
    `);

    console.log("\nLocation photo URLs by type:");
    urlPatternResult.rows.forEach((row) => {
      console.log(`  ${row.url_type}: ${row.count}`);
    });

    console.log("\n📋 Sample Cloudinary URLs:");
    const sampleResult = await client.query(`
      SELECT id, name, photo_url
      FROM locations
      WHERE photo_url LIKE '%cloudinary%'
      LIMIT 5
    `);

    sampleResult.rows.forEach((row) => {
      console.log(`  ${row.name}`);
      console.log(`    ${row.photo_url}`);
    });

    client.release();
    pool.end();
  } catch (error) {
    console.error("Error:", error);
    client.release();
    pool.end();
    process.exit(1);
  }
}

checkUrls();
