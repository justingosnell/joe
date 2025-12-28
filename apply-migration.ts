import postgres from "postgres";

async function applyMigration() {
  console.log("🔧 Applying storage_backend migration...");
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not set");
    process.exit(1);
  }

  const sql = postgres(databaseUrl);
  
  try {
    await sql`
      ALTER TABLE media ADD COLUMN storage_backend text NOT NULL DEFAULT 'supabase'
    `;
    
    console.log("✅ Migration applied successfully!");
  } catch (error: any) {
    if (error.message?.includes("already exists")) {
      console.log("✅ Column already exists, skipping...");
    } else {
      console.error("❌ Migration failed:", error.message);
      process.exit(1);
    }
  } finally {
    await sql.end();
  }
}

applyMigration();
