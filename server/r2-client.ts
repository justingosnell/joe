import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET;

console.log("🔑 Cloudflare R2 initialization:", {
  accountId: accountId ? `${accountId.substring(0, 8)}...` : "MISSING",
  accessKeyId: accessKeyId ? "✓ SET" : "MISSING",
  secretAccessKey: secretAccessKey ? "✓ SET" : "MISSING",
  bucket: bucketName || "MISSING",
});

if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
  throw new Error(
    `Missing R2 configuration: accountId (${accountId ? "✓" : "✗"}), accessKeyId (${accessKeyId ? "✓" : "✗"}), secretAccessKey (${secretAccessKey ? "✓" : "✗"}), bucket (${bucketName ? "✓" : "✗"})`
  );
}

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function uploadFileToR2(
  fileBuffer: Buffer,
  filename: string,
  contentType: string
): Promise<{ publicUrl: string; key: string }> {
  const key = `media/${Date.now()}-${filename}`;

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName!,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    });

    await s3Client.send(command);

    const publicUrl = `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${encodeURI(key)}`;

    console.log("✅ R2 upload successful:", {
      filename,
      key: key.substring(0, 50),
      url: publicUrl.substring(0, 60),
    });

    return { publicUrl, key };
  } catch (error) {
    console.error("❌ R2 upload failed:", error);
    throw new Error(`R2 upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function listR2Files(): Promise<string[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName!,
      Prefix: "media/",
    });

    const response = await s3Client.send(command);
    return (response.Contents || []).map((obj) => obj.Key || "");
  } catch (error) {
    console.error("❌ Failed to list R2 files:", error);
    throw new Error(`Failed to list R2 files: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export function isR2Configured(): boolean {
  return !!(accountId && accessKeyId && secretAccessKey && bucketName);
}
