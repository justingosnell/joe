import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseBucket = process.env.SUPABASE_BUCKET;

console.log("🔑 Supabase initialization:", {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "MISSING",
  key: supabaseKey ? "✓ SET" : "MISSING",
  bucket: supabaseBucket || "MISSING",
});

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function uploadFileToSupabase(
  bucket: string,
  path: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string> {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, fileBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  return data.path;
}

export function getPublicUrl(bucket: string, path: string): string {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }
  
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  console.log("🔗 Public URL generated:", {
    input: { bucket, path: path.substring(0, 30) },
    output: data.publicUrl.substring(0, 50),
  });
  return data.publicUrl;
}
