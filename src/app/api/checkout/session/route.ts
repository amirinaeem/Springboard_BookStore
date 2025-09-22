//==============================================================
// FILE: src/app/api/checkout/session/route.ts
// DESCRIPTION: Create Stripe Checkout Session for current cart (v4 session).
//==============================================================

import { NextResponse } from 'next/server'
import { stripe } from '../../../lib/stripe'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'

export async function POST() {
  const session = await getServerSession(authOptions)
  const user = session?.user
  if (!user?.id) return NextResponse.json({ error: "Sign in required" }, { status: 401 })

  const cart = await prisma.cart.findFirst({
    where: { userId: user.id },
    include: { items: { include: { book: true } } }
  })
  if (!cart || cart.items.length === 0) return NextResponse.json({ error: 'Cart empty' }, { status: 400 })

  const line_items = cart.items.map((ci) => ({
    quantity: ci.qty,
    price_data: {
      currency: ci.book.currency,
      unit_amount: ci.book.priceCents,
      product_data: { name: ci.book.title, images: ci.book.coverUrl ? [ci.book.coverUrl] : undefined },
    },
  }))

  const checkout = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items,
    success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/checkout/cancel`,
    customer_email: user.email || undefined,
  })

  const totalCents = cart.items.reduce((a, b) => a + b.qty * b.book.priceCents, 0)
  await prisma.order.create({
    data: {
      userId: user.id,
      email: user.email || 'guest@unknown',
      totalCents,
      stripeSession: checkout.id,
      items: {
        create: cart.items.map((ci) => ({
          bookId: ci.bookId,
          qty: ci.qty,
          unitCents: ci.book.priceCents,
        })),
      },
    },
  })

  return NextResponse.json({ id: checkout.id, url: checkout.url })
}
