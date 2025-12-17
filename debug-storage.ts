import { createClient } from "@supabase/supabase-js";
import * as cloudinary from "cloudinary";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabaseBucket = process.env.SUPABASE_BUCKET!;

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSupabase() {
  console.log("\n=== SUPABASE DEBUG ===");
  try {
    const { data, error } = await supabase.storage.from(supabaseBucket).list("", {
      limit: 100,
    });
    
    console.log(`Root level files: ${data?.length || 0}`);
    if (data) {
      data.slice(0, 10).forEach((f: any) => {
        console.log(`  - ${f.name} (id: ${f.id})`);
      });
    }

    // Try to find subdirectories
    const items = data || [];
    const folders = items.filter((f: any) => f.id === null);
    console.log(`\nFolders found: ${folders.length}`);
    folders.slice(0, 5).forEach((f: any) => console.log(`  - ${f.name}/`));

    // Count all files recursively
    let totalFiles = 0;
    for (const folder of folders) {
      const { data: subFiles, error: subError } = await supabase.storage
        .from(supabaseBucket)
        .list(folder.name, { limit: 1000 });
      if (subFiles) {
        totalFiles += subFiles.filter((f: any) => f.id !== null).length;
      }
    }

    console.log(`\nTotal files in subdirectories: ${totalFiles}`);
  } catch (error) {
    console.error("Supabase error:", error);
  }
}

async function debugCloudinary() {
  console.log("\n=== CLOUDINARY DEBUG ===");
  try {
    return new Promise((resolve) => {
      cloudinary.v2.api.resources(
        {
          type: "upload",
          max_results: 500,
        },
        (error: any, result: any) => {
          if (error) {
            console.error("Error:", error);
            resolve(null);
          } else {
            console.log(`Total resources: ${result.total_count || result.resources?.length || 0}`);
            if (result.resources) {
              console.log("Sample resources:");
              result.resources.slice(0, 10).forEach((r: any) => {
                console.log(`  - ${r.public_id} (type: ${r.type})`);
              });
            }
            resolve(result);
          }
        }
      );
    });
  } catch (error) {
    console.error("Cloudinary error:", error);
  }
}

async function main() {
  await debugSupabase();
  await debugCloudinary();
}

main();
