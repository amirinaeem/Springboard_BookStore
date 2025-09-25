//==============================================================
// FILE: src/lib/ensureBookFile.ts
// DESCRIPTION: If book.fileUrl is empty, try to fetch from
//              Google Books API (using googleVolumeId), upload
//              to Cloudinary, and save the URL.
//==============================================================

import fs from "fs"
import path from "path"
import { prisma } from "../lib/prisma"
import { uploadRawFile } from "./cloudinary"

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

function tryFirstExisting(paths: string[]) {
  for (const p of paths) if (fs.existsSync(p)) return p
  return null
}

/** Returns a non-empty fileUrl after ensuring upload (or null). */
export async function ensureBookFileById(bookId: string) {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { id: true, title: true, googleVolumeId: true, fileUrl: true },
  })
  if (!book) return null
  if (book.fileUrl) return book.fileUrl

  const publicId = `book_${book.id}`

  // ------------------------------
  // 1. Try local files (for dev/test)
  // ------------------------------
  const booksDir = path.join(process.cwd(), "books")
  const candidates: string[] = []
  const nameSlug = book.title ? slug(book.title) : ""

  const add = (name: string | undefined | null) => {
    if (!name) return
    candidates.push(path.join(booksDir, `${name}.pdf`))
    candidates.push(path.join(booksDir, `${name}.epub`))
  }
  add(book.id)
  add(book.googleVolumeId || undefined)
  add(nameSlug)

  const found = tryFirstExisting(candidates)
  if (found) {
    const url = await uploadRawFile(found, publicId)
    await prisma.book.update({ where: { id: book.id }, data: { fileUrl: url } })
    return url
  }

  // ------------------------------
  // 2. Fallback: Google Books API
  // ------------------------------
  if (book.googleVolumeId) {
    try {
      const key = process.env.GOOGLE_BOOKS_API_KEY
      const apiUrl = new URL(
        `https://www.googleapis.com/books/v1/volumes/${book.googleVolumeId}`
      )
      if (key) apiUrl.searchParams.set("key", key)

      const res = await fetch(apiUrl.toString())
      if (!res.ok) throw new Error("Google Books API failed")
      const data = await res.json()

      // Prefer EPUB download, fallback to PDF
      const epubLink = data.accessInfo?.epub?.downloadLink
      const pdfLink = data.accessInfo?.pdf?.downloadLink
      const downloadUrl = epubLink || pdfLink

      if (downloadUrl) {
        const tmpFile = path.join(process.cwd(), "tmp_download")
        const tmpPath = path.join(tmpFile, `${book.id}.pdf`)
        fs.mkdirSync(tmpFile, { recursive: true })

        // Fetch & save temporarily
        const fileRes = await fetch(downloadUrl)
        if (!fileRes.ok) throw new Error("Book file download failed")
        const buffer = Buffer.from(await fileRes.arrayBuffer())
        fs.writeFileSync(tmpPath, buffer)

        // Upload to Cloudinary
        const url = await uploadRawFile(tmpPath, publicId)

        // Save URL in DB
        await prisma.book.update({
          where: { id: book.id },
          data: { fileUrl: url },
        })

        // Clean up
        fs.unlinkSync(tmpPath)

        return url
      }
    } catch (err) {
      console.error("Google Books fetch failed", err)
    }
  }

  // ------------------------------
  // 3. Nothing found
  // ------------------------------
  return null
}
