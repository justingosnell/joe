import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseBucket = process.env.SUPABASE_BUCKET;

console.log("🔑 Supabase initialization:", {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "MISSING",
  key: supabaseKey ? "✓ SET" : "MISSING",
  bucket: supabaseBucket || "MISSING",
});

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    `Missing SUPABASE_URL (${supabaseUrl ? "✓" : "✗"}) or SUPABASE_KEY (${supabaseKey ? "✓" : "✗"}) environment variables`
  );
}

if (!supabaseBucket) {
  throw new Error("Missing SUPABASE_BUCKET environment variable");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadFileToSupabase(
  bucket: string,
  path: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string> {
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
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  console.log("🔗 Public URL generated:", {
    input: { bucket, path: path.substring(0, 30) },
    output: data.publicUrl.substring(0, 50),
  });
  return data.publicUrl;
}
