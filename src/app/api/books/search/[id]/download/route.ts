//==============================================================
// FILE: src/app/api/books/[id]/download/route.ts
// DESCRIPTION: Allow download if user owns a PAID order item for this book.
//==============================================================

import { NextResponse } from "next/server"
import { prisma } from "../../../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../../lib/auth"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id as string | undefined
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const book = await prisma.book.findUnique({ where: { id: params.id } })
  if (!book?.fileUrl) return NextResponse.json({ error: "No file" }, { status: 404 })

  const owned = await prisma.orderItem.findFirst({
    where: {
      bookId: params.id,
      order: { userId, status: "PAID" },
    },
  })
  if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // Simplest approach: redirect to fileUrl (could be signed URL in production)
  return NextResponse.redirect(book.fileUrl)
}
