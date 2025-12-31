let cloudinary: any = null;

async function initCloudinary() {
  if (cloudinary) return;
  
  try {
    const module = await import("cloudinary");
    cloudinary = module.v2;
    
    const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
    const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret) {
      cloudinary.config({
        cloud_name: cloudinaryCloudName,
        api_key: cloudinaryApiKey,
        api_secret: cloudinaryApiSecret,
      });
      console.log("✓ Cloudinary configured");
    } else {
      console.log("⚠ Cloudinary credentials not set");
    }
  } catch (error) {
    console.log("⚠ Cloudinary not available (npm install cloudinary to use fallback storage)");
    cloudinary = null;
  }
}

export async function uploadFileToCloudinary(
  fileBuffer: Buffer,
  filename: string
): Promise<{ publicUrl: string; publicId: string }> {
  await initCloudinary();
  
  if (!cloudinary) {
    throw new Error("Cloudinary not configured. Install cloudinary package and set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        public_id: `media/${filename}`,
        folder: "joe-app",
      },
      (error: any, result: any) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else if (result) {
          resolve({
            publicUrl: result.secure_url,
            publicId: result.public_id,
          });
        } else {
          reject(new Error("Cloudinary upload failed: no result"));
        }
      }
    );

    stream.end(fileBuffer);
  });
}

export async function isCloudinaryConfigured(): Promise<boolean> {
  await initCloudinary();
  return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && cloudinary);
}
