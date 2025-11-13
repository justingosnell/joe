import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listBuckets() {
  try {
    console.log("📦 Listing all buckets...\n");
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error("Error listing buckets:", error);
      return;
    }
    
    console.log(`Found ${buckets.length} buckets:`);
    for (const bucket of buckets) {
      console.log(`  - ${bucket.name} (id: ${bucket.id})`);
    }
    
    // List files in each bucket
    for (const bucket of buckets) {
      console.log(`\n📂 Files in "${bucket.name}":`);
      const { data: files, error: listError } = await supabase.storage
        .from(bucket.name)
        .list("", { limit: 100 });
      
      if (listError) {
        console.error(`  Error listing files:`, listError);
      } else {
        console.log(`  Total files: ${files.length}`);
        files.slice(0, 10).forEach(file => {
          console.log(`    - ${file.name}`);
        });
        if (files.length > 10) {
          console.log(`    ... and ${files.length - 10} more`);
        }
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

listBuckets();
