//==============================================================
// FILE: src/app/api/collections/[id]/items/route.ts
// DESCRIPTION: POST add a book to a collection (handles DB + Google).
//==============================================================

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../lib/auth"
import { prisma } from "../../../../lib/prisma"
import { ensureBookSaved } from "../../../../lib/book"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  let bookId = body.bookId as string | undefined

  // 👇 Handle Google search results (not yet in DB)
  if (!bookId && body.fromGoogle && body.book) {
    const saved = await ensureBookSaved(body.book)
    bookId = saved.id
  }

  if (!bookId) {
    return NextResponse.json({ error: "bookId required" }, { status: 400 })
  }

  // Ensure collection belongs to the user
  const coll = await prisma.collection.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!coll) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const added = await prisma.collectionItem.upsert({
    where: { collectionId_bookId: { collectionId: params.id, bookId } },
    update: { notes: body.notes },
    create: { collectionId: params.id, bookId, notes: body.notes },
    select: { id: true },
  })

  return NextResponse.json({ ok: true, itemId: added.id })
}
