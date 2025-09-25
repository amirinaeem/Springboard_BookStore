//==============================================================
// FILE: src/app/api/books/[id]/download/route.ts
// DESCRIPTION: Allow download if user owns a PAID order item for this book.
// Streams file directly instead of buffering.
//==============================================================

import { NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../lib/auth"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  // 1. Ensure user is logged in
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id as string | undefined
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 2. Find book
  const book = await prisma.book.findUnique({
    where: { id: params.id },
  })
  if (!book?.fileUrl) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }

  // 3. Verify ownership (must have PAID order for this book)
  const owned = await prisma.orderItem.findFirst({
    where: {
      bookId: params.id,
      order: {
        userId,
        status: "PAID",
      },
    },
  })
  if (!owned) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    // 4. Fetch file from remote storage
    const res = await fetch(book.fileUrl)
    if (!res.ok || !res.body) {
      throw new Error("Failed to fetch book file")
    }

    // 5. Stream response directly
    const fileName = book.title?.replace(/\s+/g, "_") || "book.pdf"

    return new NextResponse(res.body, {
      headers: {
        "Content-Type":
          res.headers.get("content-type") || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}
