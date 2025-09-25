//==============================================================
// API: /api/books/[id]/download
// DESCRIPTION: Auth + ownership check. If fileUrl missing,
//              try to fetch from Google Books (via ensureBookFileById),
//              upload to Cloudinary, and persist. Then stream.
//              Supports ?inline=1 for PDF viewer.
//==============================================================

import { NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../lib/auth"
import { ensureBookFileById } from "../../../../lib/ensureBookFile"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const url = new URL(req.url)
  const inline = url.searchParams.get("inline") === "1"

  // 1) Auth
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id as string | undefined
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 2) Load book
  const book = await prisma.book.findUnique({
    where: { id: params.id },
    select: { id: true, title: true, fileUrl: true },
  })
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 })
  }

  // 3) Ownership check
  const owned = await prisma.orderItem.findFirst({
    where: { bookId: book.id, order: { userId, status: "PAID" } },
    select: { id: true },
  })
  if (!owned) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // 4) Ensure fileUrl (on-demand fetch/upload)
  let fileUrl = book.fileUrl
  if (!fileUrl) {
    fileUrl = await ensureBookFileById(book.id)
    if (!fileUrl) {
      return NextResponse.json(
        { error: "File not available. (Google Books may not allow download)" },
        { status: 404 }
      )
    }
  }

  // 5) Fetch remote and stream back
  try {
    const upstream = await fetch(fileUrl, { headers: { Range: req.headers.get("Range") || "" } })
    if (!upstream.ok || !upstream.body) {
      throw new Error(`Upstream fetch failed: ${upstream.status}`)
    }

    // Detect content type
    let contentType = upstream.headers.get("content-type") || ""
    if (!contentType || contentType === "application/octet-stream") {
      if (fileUrl.endsWith(".pdf")) contentType = "application/pdf"
      else if (fileUrl.endsWith(".epub")) contentType = "application/epub+zip"
      else contentType = "application/octet-stream"
    }

    const disposition = inline ? "inline" : "attachment"
    const ext =
      fileUrl.endsWith(".epub") ? ".epub" :
      fileUrl.endsWith(".pdf") ? ".pdf" : ""
    const safeName = (book.title || "book").replace(/[^\w.-]+/g, "_") + ext

    // Prepare headers
    const headers = new Headers(upstream.headers)
    headers.set("Content-Type", contentType)
    headers.set("Content-Disposition", `${disposition}; filename="${safeName}"`)

    return new Response(upstream.body, { status: upstream.status, headers })
  } catch (err) {
    console.error("[download] upstream error", err)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}
