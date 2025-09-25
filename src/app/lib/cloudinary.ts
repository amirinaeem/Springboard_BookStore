//==============================================================
// FILE: src/lib/cloudinary.ts
// DESCRIPTION: Cloudinary v2 client + raw upload helper.
//==============================================================

import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

/** Upload a file path as RAW (PDF/EPUB) into folder "books/". */
export async function uploadRawFile(filePath: string, publicId?: string) {
  const res = await cloudinary.uploader.upload(filePath, {
    resource_type: "raw",
    folder: "books",
    public_id: publicId, // optional
    use_filename: true,
    unique_filename: !publicId,
    overwrite: false,
  })
  return res.secure_url as string
}
