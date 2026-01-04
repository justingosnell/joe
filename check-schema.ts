import "dotenv/config";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

const sql = postgres(databaseUrl, {
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false,
  } : false,
});

async function checkSchema() {
  try {
    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'media'
      ORDER BY ordinal_position
    `;

    console.log("📋 Media Table Schema:\n");
    columns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });

    const sample = await sql`SELECT * FROM media LIMIT 1`;
    console.log("\n📌 Sample Record Keys:");
    if (sample.length > 0) {
      Object.keys(sample[0]).forEach(key => {
        console.log(`  - ${key}`);
      });
    }

    await sql.end();
  } catch (error) {
    console.error("❌ Error:", error);
    await sql.end();
  }
}

checkSchema();
