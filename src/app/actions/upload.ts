"use server";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  file: string, 
  folder: string = "RGYCSP/Uncategorized",
  options?: { preserveQuality?: boolean }
) {
  // Ensure the folder starts with RGYCSP for root organization
  const finalFolder = folder.startsWith("RGYCSP") ? folder : `RGYCSP/${folder}`;

  console.log("Attempting upload to Cloudinary, folder:", finalFolder);
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: finalFolder,
      resource_type: "auto",
    });

    // If preserveQuality is requested or uploading document templates, preserve original uncompressed clarity
    const shouldPreserve = options?.preserveQuality || finalFolder.toLowerCase().includes("documents") || finalFolder.toLowerCase().includes("templates");
    const optimizedUrl = shouldPreserve
      ? result.secure_url
      : result.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
    
    console.log("Upload successful:", optimizedUrl);
    return { success: true, url: optimizedUrl };
  } catch (error: any) {
    console.error("Cloudinary upload error details:", error);
    return { success: false, error: error.message || "Failed to upload image" };
  }
}
