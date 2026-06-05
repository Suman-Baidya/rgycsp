"use server";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: string, folder: string = "RGYCSP/Uncategorized") {
  // Ensure the folder starts with RGYCSP for root organization
  const finalFolder = folder.startsWith("RGYCSP") ? folder : `RGYCSP/${folder}`;

  
  console.log("Attempting upload to Cloudinary, folder:", finalFolder);
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: finalFolder,
      resource_type: "auto",
    });
    console.log("Upload successful:", result.secure_url);
    return { success: true, url: result.secure_url };
  } catch (error: any) {
    console.error("Cloudinary upload error details:", error);
    return { success: false, error: error.message || "Failed to upload image" };
  }
}
