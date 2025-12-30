import "dotenv/config";
import { listR2Files } from "./server/r2-client";

async function verifyFiles() {
  console.log("📁 Checking files in R2 bucket...\n");

  try {
    const files = await listR2Files();
    console.log(`✅ Found ${files.length} files in R2\n`);

    console.log("Sample files:");
    files.slice(0, 10).forEach((key) => {
      const url = `https://joe-website-images.${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
      console.log(`  - ${key}`);
      console.log(`    URL: ${url}`);
    });
  } catch (error) {
    console.error("❌ Error listing R2 files:", error);
  }
}

verifyFiles();
