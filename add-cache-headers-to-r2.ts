import { S3Client, ListObjectsV2Command, HeadObjectCommand, CopyObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET;

if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
  throw new Error("Missing R2 configuration");
}

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

async function addCacheHeadersToExisting() {
  console.log("🔄 Adding Cache-Control headers to existing R2 images...\n");

  let continuationToken: string | undefined;
  let processedCount = 0;
  let failedCount = 0;

  try {
    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: bucketName!,
        Prefix: "media/",
        ContinuationToken: continuationToken,
      });

      const listResponse = await s3Client.send(listCommand);
      const files = listResponse.Contents || [];

      console.log(`📋 Processing ${files.length} files...`);

      for (const file of files) {
        if (!file.Key) continue;

        try {
          const headCommand = new HeadObjectCommand({
            Bucket: bucketName!,
            Key: file.Key,
          });

          const headResponse = await s3Client.send(headCommand);

          if (headResponse.CacheControl?.includes("max-age=31536000")) {
            console.log(`✅ Already cached: ${file.Key.split("/").pop()}`);
            processedCount++;
            continue;
          }

          const copyCommand = new CopyObjectCommand({
            Bucket: bucketName!,
            Key: file.Key,
            CopySource: `${bucketName}/${file.Key}`,
            ContentType: headResponse.ContentType,
            CacheControl: "public, max-age=31536000, immutable",
            MetadataDirective: "REPLACE",
          });

          await s3Client.send(copyCommand);
          console.log(`🔄 Updated cache headers: ${file.Key.split("/").pop()}`);
          processedCount++;
        } catch (error) {
          console.error(`❌ Failed to update ${file.Key}:`, error);
          failedCount++;
        }
      }

      continuationToken = listResponse.NextContinuationToken;
    } while (continuationToken);

    console.log(`\n✨ Done! Updated ${processedCount} files, ${failedCount} failed`);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

addCacheHeadersToExisting().catch(console.error);
