//==============================================================
// FILE: src/lib/ensureBookFile.ts
// DESCRIPTION: Ensure book.fileUrl is set. If free (downloadLink),
//              upload to Cloudinary. Otherwise, use Google Books
//              preview (webReaderLink).
//==============================================================

import fs from "fs"
import path from "path"
import os from "os"
import { prisma } from "../lib/prisma"
import { uploadRawFile } from "./cloudinary"

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

function tryFirstExisting(paths: string[]) {
  for (const p of paths) if (fs.existsSync(p)) return p
  return null
}

export async function ensureBookFileById(bookId: string) {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { id: true, title: true, googleVolumeId: true, fileUrl: true },
  })
  if (!book) return null
  if (book.fileUrl) return book.fileUrl

  const publicId = `book_${book.id}`

  // ------------------------------
  // 1. Local dev/test
  // ------------------------------
  const booksDir = path.join(process.cwd(), "books")
  const candidates: string[] = []
  const nameSlug = book.title ? slug(book.title) : ""
  ;[book.id, book.googleVolumeId, nameSlug].forEach((n) => {
    if (!n) return
    candidates.push(path.join(booksDir, `${n}.pdf`))
    candidates.push(path.join(booksDir, `${n}.epub`))
  })
  const found = tryFirstExisting(candidates)
  if (found) {
    const url = await uploadRawFile(found, publicId)
    await prisma.book.update({ where: { id: book.id }, data: { fileUrl: url } })
    return url
  }

  // ------------------------------
  // 2. Google Books
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

      const epubLink = data.accessInfo?.epub?.downloadLink
      const pdfLink = data.accessInfo?.pdf?.downloadLink
      const downloadUrl = epubLink || pdfLink

      if (downloadUrl) {
        // ✅ Free book with real download
        const ext = epubLink ? ".epub" : ".pdf"
        const tmpDir = path.join(os.tmpdir(), "books_tmp")
        const tmpPath = path.join(tmpDir, `${book.id}${ext}`)
        fs.mkdirSync(tmpDir, { recursive: true })

        const fileRes = await fetch(downloadUrl)
        if (!fileRes.ok) throw new Error("Book file download failed")
        fs.writeFileSync(tmpPath, Buffer.from(await fileRes.arrayBuffer()))

        const url = await uploadRawFile(tmpPath, publicId)
        await prisma.book.update({ where: { id: book.id }, data: { fileUrl: url } })
        fs.unlinkSync(tmpPath)

        return url
      }

      // ❌ Not free → preview only
      const previewUrl =
        data.accessInfo?.webReaderLink || data.volumeInfo?.previewLink || null
      if (previewUrl) {
        await prisma.book.update({
          where: { id: book.id },
          data: { fileUrl: previewUrl },
        })
        return previewUrl
      }
    } catch (err) {
      console.error("Google Books fetch failed", err)
    }
  }

  return null
}
