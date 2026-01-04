import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET;
const publicDomain = process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN;

console.log("🔑 Cloudflare R2 initialization:", {
  accountId: accountId ? `${accountId.substring(0, 8)}...` : "MISSING",
  accessKeyId: accessKeyId ? "✓ SET" : "MISSING",
  secretAccessKey: secretAccessKey ? "✓ SET" : "MISSING",
  bucket: bucketName || "MISSING",
  publicDomain: publicDomain || "MISSING (will use default domain)",
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
  contentType: string,
  retries = 3
): Promise<{ publicUrl: string; key: string }> {
  const key = `media/${Date.now()}-${filename}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName!,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      });

      await s3Client.send(command);

      const publicUrl = publicDomain 
        ? `https://${publicDomain}/${encodeURI(key)}`
        : `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${encodeURI(key)}`;

      console.log("✅ R2 upload successful:", {
        filename,
        key: key.substring(0, 50),
        url: publicUrl.substring(0, 60),
      });

      return { publicUrl, key };
    } catch (error) {
      if (attempt < retries) {
        const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.warn(`⚠️  Upload attempt ${attempt}/${retries} failed, retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        console.error("❌ R2 upload failed after retries:", error);
        throw new Error(`R2 upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  }

  throw new Error("R2 upload failed: unexpected end of retries");
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
