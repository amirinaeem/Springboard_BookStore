//==============================================================
// FILE: src/lib/cloudinary.ts
// DESCRIPTION: Cloudinary v2 client + helpers for RAW + image uploads.
//==============================================================

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

/** Upload a file from disk (PDF/EPUB/etc) into Cloudinary RAW storage. */
export async function uploadRawFile(filePath: string, publicId?: string) {
  const res = await cloudinary.uploader.upload(filePath, {
    resource_type: "raw",
    folder: "books/files",
    public_id: publicId,
    use_filename: true,
    unique_filename: !publicId,
    overwrite: false,
  });
  return res.secure_url as string;
}

export function uploadBufferToCloudinary(
  buffer: Buffer,
  options: Record<string, any> & { filename?: string }
): Promise<{ secure_url: string }> {
  return new Promise((resolve, reject) => {
    // ✅ enforce correct format from filename (e.g., .epub / .pdf / .jpg)
    let format = options.format
    if (!format && options.filename) {
      format = options.filename.split(".").pop()?.toLowerCase()
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw", // needed for epub/pdf
        folder: "books/files",
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        format, // 👈 keep extension in URL
        ...options,
      },
      (err, result) => {
        if (err || !result) return reject(err)
        resolve(result as { secure_url: string })
      }
    )

    stream.end(buffer)
  })
}
