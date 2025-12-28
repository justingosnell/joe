import { createClient } from "@supabase/supabase-js";
import * as cloudinary from "cloudinary";
import * as fs from "fs";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabaseBucket = process.env.SUPABASE_BUCKET!;

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const supabase = createClient(supabaseUrl, supabaseKey);
const logFile = "migration-progress.log";

function log(message: string) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${message}`;
  console.log(entry);
  fs.appendFileSync(logFile, entry + "\n");
}

async function getSupabaseFiles(): Promise<Map<string, string>> {
  log("📂 Fetching all files from Supabase...");
  const files = new Map<string, string>();

  async function listRecursive(path: string) {
    let offset = 0;
    const pageSize = 1000;

    while (true) {
      const { data, error } = await supabase.storage
        .from(supabaseBucket)
        .list(path, {
          limit: pageSize,
          offset,
          sortBy: { column: "name", order: "asc" },
        });

      if (error) {
        throw new Error(
          `Failed to list Supabase files at ${path}: ${error.message}`
        );
      }

      if (!data || data.length === 0) break;

      for (const item of data) {
        if (item.id) {
          const fullPath = path ? `${path}/${item.name}` : item.name;
          files.set(fullPath, item.name);
        } else {
          const subPath = path ? `${path}/${item.name}` : item.name;
          await listRecursive(subPath);
        }
      }

      offset += pageSize;
    }
  }

  await listRecursive("");

  log(`✓ Found ${files.size} files in Supabase`);
  return files;
}

async function getCloudinaryFiles(): Promise<Set<string>> {
  log("☁️ Fetching all files from Cloudinary...");
  const existingFiles = new Set<string>();

  try {
    let nextCursor: string | undefined = undefined;
    let pageCount = 0;

    while (true) {
      pageCount++;

      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.v2.api.resources(
          {
            type: "upload",
            prefix: "joe-app/media/",
            max_results: 500,
            next_cursor: nextCursor,
          },
          (error: any, result: any) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
      });

      if (result.resources) {
        for (const resource of result.resources) {
          const filename = resource.public_id.replace("joe-app/media/", "");
          existingFiles.add(filename);
        }
      }

      nextCursor = result.next_cursor;
      if (!nextCursor) break;
    }
  } catch (error) {
    log("⚠️ Could not fetch existing Cloudinary files");
  }

  log(`✓ Found ${existingFiles.size} files already in Cloudinary`);
  return existingFiles;
}

async function downloadFromSupabase(fullPath: string): Promise<Buffer> {
  const { data, error } = await supabase.storage
    .from(supabaseBucket)
    .download(fullPath);

  if (error) {
    throw new Error(`Failed to download ${fullPath}: ${error.message}`);
  }

  return Buffer.from(await data.arrayBuffer());
}

async function uploadToCloudinary(
  filename: string,
  fileBuffer: Buffer
): Promise<void> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      {
        resource_type: "auto",
        public_id: `media/${filename}`,
        folder: "joe-app",
      },
      (error: any, result: any) => {
        if (error) {
          reject(new Error(`Failed to upload ${filename}: ${error.message}`));
        } else {
          resolve();
        }
      }
    );

    stream.end(fileBuffer);
  });
}

async function main() {
  try {
    log("\n🚀 Starting Supabase to Cloudinary migration...\n");

    const supabaseFilesMap = await getSupabaseFiles();
    const cloudinaryFiles = await getCloudinaryFiles();

    const filesToUpload: Array<[string, string]> = [];
    const duplicates: string[] = [];

    for (const [fullPath, filename] of supabaseFilesMap.entries()) {
      if (cloudinaryFiles.has(filename)) {
        duplicates.push(fullPath);
      } else {
        filesToUpload.push([fullPath, filename]);
      }
    }

    log(`\n📊 Migration Summary:`);
    log(`   - Files in Supabase: ${supabaseFilesMap.size}`);
    log(`   - Files in Cloudinary: ${cloudinaryFiles.size}`);
    log(`   - Files to upload: ${filesToUpload.length}`);
    log(`   - Already in Cloudinary: ${duplicates.length}\n`);

    if (filesToUpload.length === 0) {
      log("✓ All files are already migrated!");
      return;
    }

    let uploaded = 0;
    let failed = 0;
    const failedFiles: Array<[string, string]> = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const [fullPath, filename] = filesToUpload[i];
      const progress = `[${i + 1}/${filesToUpload.length}]`;

      try {
        if ((i + 1) % 50 === 0 || i === 0) {
          log(`⏳ ${progress} Uploading ${filename}...`);
        }
        const fileBuffer = await downloadFromSupabase(fullPath);
        await uploadToCloudinary(filename, fileBuffer);
        uploaded++;
      } catch (error) {
        failed++;
        failedFiles.push([fullPath, String(error)]);
        log(`✗ ${progress} Failed: ${fullPath} - ${error}`);
      }
    }

    log(`\n📈 Migration Complete:`);
    log(`   - Successfully uploaded: ${uploaded}`);
    log(`   - Failed: ${failed}`);

    if (failedFiles.length > 0) {
      log(`\n❌ Failed files (${failedFiles.length}):`);
      failedFiles.slice(0, 20).forEach(([file]) => log(`   - ${file}`));
      if (failedFiles.length > 20) {
        log(`   ... and ${failedFiles.length - 20} more`);
      }
    }

    log("\n✓ Migration finished!\n");
  } catch (error) {
    log(`\n❌ Migration failed: ${error}`);
    process.exit(1);
  }
}

main();
