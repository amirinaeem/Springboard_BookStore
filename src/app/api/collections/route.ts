//==============================================================
// FILE: src/app/api/collections/route.ts
// DESCRIPTION: GET (list user collections), POST (create).
//==============================================================

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import { prisma } from '../../lib/prisma'
import { slugify } from '../../lib/slug'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ items: [] }, { status: 200 })

  const items = await prisma.collection.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true, slug: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  // make a unique slug per user
  const base = slugify(name)
  let unique = base
  let i = 1
  while (await prisma.collection.findFirst({ where: { userId: session.user.id, slug: unique } })) {
    unique = `${base}-${i++}`
  }

  const created = await prisma.collection.create({
    data: { userId: session.user.id, name: name.trim(), slug: unique },
    select: { id: true, name: true, slug: true },
  })

  return NextResponse.json(created)
}
