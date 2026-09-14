import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const folder = (formData.get("folder") as string) || "RGYCSP/Uncategorized";
    const preserveQuality = formData.get("preserveQuality") === "true";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const finalFolder = folder.startsWith("RGYCSP") ? folder : `RGYCSP/${folder}`;

    let uploadResult: any;

    if (typeof file === "string") {
      // Base64 string from client-side compressed canvas
      uploadResult = await cloudinary.uploader.upload(file, {
        folder: finalFolder,
        resource_type: "auto",
      });
    } else if (file && typeof (file as any).arrayBuffer === "function") {
      // Native File / Blob binary stream (for full resolution raw templates)
      const bytes = await (file as any).arrayBuffer();
      const buffer = Buffer.from(bytes);

      uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: finalFolder,
            resource_type: "auto",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });
    } else {
      return NextResponse.json({ success: false, error: "Invalid file format" }, { status: 400 });
    }

    const shouldPreserve =
      preserveQuality ||
      finalFolder.toLowerCase().includes("documents") ||
      finalFolder.toLowerCase().includes("templates");

    const optimizedUrl = shouldPreserve
      ? uploadResult.secure_url
      : uploadResult.secure_url.replace("/upload/", "/upload/f_auto,q_auto/");

    return NextResponse.json({ success: true, url: optimizedUrl });
  } catch (error: any) {
    console.error("API Upload error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
