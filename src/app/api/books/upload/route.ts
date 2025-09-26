import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"
import { uploadBufferToCloudinary } from "../../../lib/cloudinary"

export async function POST(req: Request) {
  const form = await req.formData()
  const title = form.get("title") as string
  const author = form.get("author") as string
  const description = form.get("description") as string
  const publishedAt = form.get("publishedAt") as string | null
  const cover = form.get("cover") as File | null
  const file = form.get("file") as File | null

  if (!title || !author || !file) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  // --- Upload cover (optional) ---
  let coverUrl: string | null = null
  if (cover) {
    const coverBuffer = Buffer.from(await cover.arrayBuffer())
    const coverRes = await uploadBufferToCloudinary(coverBuffer, {
      resource_type: "image",
      folder: "books/covers",
      filename: cover.name,
    })
    coverUrl = coverRes.secure_url
  }

  // --- Upload book file (EPUB/PDF) ---
  const ext = file.name.split(".").pop()?.toLowerCase()
  const fileBuffer = Buffer.from(await file.arrayBuffer())
  const fileRes = await uploadBufferToCloudinary(fileBuffer, {
    resource_type: "raw",
    folder: "books/files",
    use_filename: true,
    unique_filename: true,
    format: ext,        // ensures Cloudinary URL ends with .pdf/.epub
    filename: file.name // helps Cloudinary guess format
  })
  const fileUrl = fileRes.secure_url

  // --- Save to DB ---
  const book = await prisma.book.create({
    data: {
      title,
      description,
      coverUrl,
      fileUrl,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
      priceCents: 0,
      currency: "USD",
      inventory: 100,
      authors: {
        connectOrCreate: {
          where: { name: author }, // assumes Author.name is unique
          create: { name: author },
        },
      },
    },
    include: { authors: true },
  })

  return NextResponse.json(book)
}
