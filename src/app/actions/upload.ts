"use server";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: string, folder: string = "ABCDEdutHub/general") {
  console.log("Attempting upload to Cloudinary, folder:", folder);
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: folder,
      resource_type: "auto",
    });
    console.log("Upload successful:", result.secure_url);
    return { success: true, url: result.secure_url };
  } catch (error: any) {
    console.error("Cloudinary upload error details:", error);
    return { success: false, error: error.message || "Failed to upload image" };
  }
}
