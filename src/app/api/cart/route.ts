//==============================================================
// FILE: src/app/api/cart/route.ts
// DESCRIPTION: Cart endpoints using NextAuth v4 getServerSession.
//==============================================================

import { NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'
import { getServerSession } from "next-auth"
import { authOptions } from "../../lib/auth"

async function getOrCreateCart(userId?: string) {
  if (userId) {
    const found = await prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { book: true } } },
    })
    if (found) return found
    return prisma.cart.create({
      data: { userId },
      include: { items: { include: { book: true } } },
    })
  }
  // If you want a guest cart, implement cookie/session storage.
  // For now we'll return an empty "shape" to avoid client crashes.
  return {
    id: 'guest',
    userId: null,
    items: [] as any[],
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const cart = await getOrCreateCart(session?.user?.id as string | undefined)
  return NextResponse.json(cart)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { bookId, qty } = await req.json()
  const cart = await getOrCreateCart(session.user.id)
  await prisma.cartItem.upsert({
    where: { cartId_bookId: { cartId: cart.id, bookId } },
    create: { cartId: cart.id, bookId, qty: qty ?? 1 },
    update: { qty: { increment: qty ?? 1 } },
  })
  // return fresh cart with books
  const fresh = await getOrCreateCart(session.user.id)
  return NextResponse.json(fresh)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { bookId, qty } = await req.json()
  const cart = await getOrCreateCart(session.user.id)
  await prisma.cartItem.update({
    where: { cartId_bookId: { cartId: cart.id, bookId } },
    data: { qty },
  })
  const fresh = await getOrCreateCart(session.user.id)
  return NextResponse.json(fresh)
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { bookId } = await req.json()
  const cart = await getOrCreateCart(session.user.id)
  await prisma.cartItem.delete({ where: { cartId_bookId: { cartId: cart.id, bookId } } })
  const fresh = await getOrCreateCart(session.user.id)
  return NextResponse.json(fresh)
}
