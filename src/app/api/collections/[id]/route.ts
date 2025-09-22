//==============================================================
// FILE: src/app/api/collections/[id]/route.ts
// DESCRIPTION: PATCH rename collection, DELETE remove collection.
//==============================================================

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'
import { slugify } from '../../../lib/slug'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const base = slugify(name)
  let unique = base
  let i = 1
  while (await prisma.collection.findFirst({ where: { userId: session.user.id, slug: unique, NOT: { id: params.id } } })) {
    unique = `${base}-${i++}`
  }

  const updated = await prisma.collection.update({
    where: { id: params.id },
    data: { name: name.trim(), slug: unique },
    select: { id: true, name: true, slug: true },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.collection.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
