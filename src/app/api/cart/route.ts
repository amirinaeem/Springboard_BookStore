//==============================================================
// FILE: src/app/api/cart/route.ts
// DESCRIPTION: Cart endpoints using NextAuth. Supports Google-sourced books.
//==============================================================

import { NextResponse } from "next/server"
import { prisma } from "../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../lib/auth"
import { ensureBookSaved } from "../../lib/book"

// utility to get or create user cart
async function getOrCreateCart(userId: string) {
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

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const cart = await getOrCreateCart(session.user.id)
  return NextResponse.json(cart)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { bookId, qty, book, fromGoogle } = await req.json()

  // 1. Find or create book
  let dbBook
  if (fromGoogle && book) {
    dbBook = await ensureBookSaved(book) // saves from Google data
  } else if (bookId) {
    dbBook = await prisma.book.findUnique({ where: { id: bookId } })
  }

  if (!dbBook) return NextResponse.json({ error: "Book not found" }, { status: 404 })

  // 2. Add to cart
  const cart = await getOrCreateCart(session.user.id)
  await prisma.cartItem.upsert({
    where: { cartId_bookId: { cartId: cart.id, bookId: dbBook.id } },
    create: { cartId: cart.id, bookId: dbBook.id, qty: qty ?? 1 },
    update: { qty: { increment: qty ?? 1 } },
  })

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
