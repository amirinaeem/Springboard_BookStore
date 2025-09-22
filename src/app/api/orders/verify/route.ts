

//==============================================================
// FILE: src/app/api/orders/verify/route.ts
// DESCRIPTION: Verify Stripe session on success page and mark order as PAID.
//==============================================================


import { NextResponse } from 'next/server'
import { stripe } from '../../../lib/stripe'
import { prisma } from '../../../lib/prisma'


export async function POST(req: Request) {
const { session_id } = await req.json()
if (!session_id) return NextResponse.json({ error: 'session_id required' }, { status: 400 })
const s = await stripe.checkout.sessions.retrieve(session_id)
if (s.payment_status === 'paid') {
await prisma.order.updateMany({ where: { stripeSession: session_id }, data: { status: 'PAID' } })
return NextResponse.json({ ok: true })
}
return NextResponse.json({ ok: false })
}

