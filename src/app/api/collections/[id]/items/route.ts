//==============================================================
// FILE: src/app/api/collections/[id]/items/route.ts
// DESCRIPTION: POST add a book to the collection.
//==============================================================

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bookId, notes } = await req.json()
  if (!bookId) return NextResponse.json({ error: 'bookId required' }, { status: 400 })

  // Ensure collection belongs to user
  const coll = await prisma.collection.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!coll) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const added = await prisma.collectionItem.upsert({
    where: { collectionId_bookId: { collectionId: params.id, bookId } },
    update: { notes },
    create: { collectionId: params.id, bookId, notes },
    select: { id: true },
  })

  return NextResponse.json({ ok: true, itemId: added.id })
}
