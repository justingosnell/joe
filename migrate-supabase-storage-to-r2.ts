import "dotenv/config";
import postgres from "postgres";
import { uploadFileToR2 } from "./server/r2-client";

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

async function migrateSupabaseStorageToR2() {
  console.log("🚀 Starting migration from Supabase Storage to Cloudflare R2...\n");

  try {
    console.log("📦 Connecting to Supabase database...");
    
    const supabaseStorageMedia = await sql`
      SELECT id, url, original_name, mime_type
      FROM media
      WHERE url LIKE ${'%supabase.co%'}
      ORDER BY uploaded_at DESC
    `;

    console.log(`✅ Connected to Supabase\n`);
    console.log(`🔍 Found ${supabaseStorageMedia.length} Supabase Storage URLs\n`);

    if (supabaseStorageMedia.length === 0) {
      console.log("✨ No Supabase Storage URLs found. Migration complete!");
      await sql.end();
      process.exit(0);
    }

    let migratedCount = 0;
    let errorCount = 0;

    for (const mediaItem of supabaseStorageMedia) {
      try {
        console.log(`\n📥 Processing: ${mediaItem.original_name}`);

        console.log(`   Downloading from Supabase Storage...`);
        const response = await fetch(mediaItem.url);
        if (!response.ok) {
          throw new Error(`Failed to download: ${response.statusText}`);
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        console.log(`   Downloaded: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

        console.log(`   📤 Uploading to R2...`);
        const r2Result = await uploadFileToR2(
          buffer,
          mediaItem.original_name,
          mediaItem.mime_type || "image/jpeg"
        );

        console.log(`   🔗 Updating Supabase database...`);
        await sql`
          UPDATE media 
          SET url = ${r2Result.publicUrl}
          WHERE id = ${mediaItem.id}
        `;

        console.log(`   ✅ Migrated: ${mediaItem.original_name}`);
        migratedCount++;

        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(
          `   ❌ Error migrating ${mediaItem.original_name}:`,
          error instanceof Error ? error.message : "Unknown error"
        );
        errorCount++;

        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log("\n\n📊 Migration Summary:");
    console.log(`   ✅ Migrated to R2: ${migratedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(
      `\n✨ Migration complete! All Supabase Storage images have been moved to R2.`
    );

    await sql.end();
    process.exit(errorCount > 0 ? 1 : 0);
  } catch (error) {
    console.error(
      "❌ Migration failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    await sql.end();
    process.exit(1);
  }
}

migrateSupabaseStorageToR2();
