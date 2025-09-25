//==============================================================
// FILE: src/app/api/orders/verify/route.ts
// DESCRIPTION: Verify Stripe order, return items, clear cart.
//==============================================================

import { NextResponse } from "next/server"
import { stripe } from "../../../lib/stripe"
import { prisma } from "../../../lib/prisma"

export async function POST(req: Request) {
  const { session_id } = await req.json()
  if (!session_id) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 })
  }

  try {
    // 1. Retrieve the checkout session
    const s = await stripe.checkout.sessions.retrieve(session_id)
    if (s.payment_status !== "paid") {
      return NextResponse.json({ ok: false })
    }

    // 2. Find related order and items
    const order = await prisma.order.findFirst({
      where: { stripeSession: session_id },
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { ok: false, error: "Order not found" },
        { status: 404 }
      )
    }

    // 3. Mark as paid + clear cart
    if (order.status !== "PAID") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      })
      await prisma.cart.deleteMany({ where: { userId: order.userId } })
    }

    // 4. Return purchased items
    return NextResponse.json({
      ok: true,
      items: order.items.map((i) => ({
        id: i.id, // order item id
        book: {
          id: i.book.id, // <-- ADD THIS
          title: i.book.title,
          fileUrl: i.book.fileUrl,
        },
      })),
    })
  } catch (err) {
    console.error("Verify error:", err)
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}
