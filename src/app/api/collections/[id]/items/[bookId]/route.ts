//==============================================================
// FILE: src/app/api/collections/[id]/items/[bookId]/route.ts
// DESCRIPTION: DELETE remove a book from a collection.
//==============================================================

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'

export async function DELETE(_: Request, { params }: { params: { id: string, bookId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Ensure ownership
  const coll = await prisma.collection.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!coll) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.collectionItem.delete({
    where: { collectionId_bookId: { collectionId: params.id, bookId: params.bookId } },
  })

  return NextResponse.json({ ok: true })
}
