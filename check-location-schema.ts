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

async function checkSchema() {
  const client = await pool.connect();

  try {
    console.log("📋 Locations table schema:");
    const locationsSchema = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'locations'
      ORDER BY ordinal_position
    `);

    locationsSchema.rows.forEach((row) => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

    console.log("\n📦 Sample location with Cloudinary URL:");
    const locationResult = await client.query(`
      SELECT *
      FROM locations
      WHERE media_ids LIKE '%cloudinary%' OR image_url LIKE '%cloudinary%'
      LIMIT 1
    `);

    if (locationResult.rows.length > 0) {
      const loc = locationResult.rows[0];
      console.log(`\nLocation: ${loc.name}`);
      Object.entries(loc).forEach(([key, value]) => {
        if (typeof value === 'string' && value.length > 100) {
          console.log(`  ${key}: ${value.substring(0, 100)}...`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      });
    } else {
      console.log("Checking any location record...");
      const anyResult = await client.query(`
        SELECT id, name, media_ids, image_url
        FROM locations
        LIMIT 1
      `);
      
      if (anyResult.rows.length > 0) {
        const loc = anyResult.rows[0];
        console.log(`\nLocation: ${loc.name}`);
        console.log(`  id: ${loc.id}`);
        console.log(`  media_ids: ${loc.media_ids}`);
        console.log(`  image_url: ${loc.image_url}`);
      }
    }

    client.release();
    pool.end();
  } catch (error) {
    console.error("Error:", error);
    client.release();
    pool.end();
    process.exit(1);
  }
}

checkSchema();
