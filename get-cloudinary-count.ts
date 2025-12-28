import * as cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

async function getTotal() {
  return new Promise((resolve) => {
    cloudinary.v2.api.resources(
      { type: "upload", max_results: 1 },
      (error: any, result: any) => {
        if (error) {
          console.error("Error:", error);
        } else {
          console.log(`Cloudinary total_count: ${result.total_count}`);
          console.log(`All resources:`);
          
          // Get all
          cloudinary.v2.api.resources(
            { type: "upload", max_results: 500 },
            (err: any, res: any) => {
              if (res.resources) {
                console.log(`  First batch: ${res.resources.length} files`);
                console.log(`  Next cursor: ${res.next_cursor || "none"}`);
              }
              resolve(null);
            }
          );
        }
      }
    );
  });
}

getTotal();
