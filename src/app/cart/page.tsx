//==============================================================
// FILE: src/app/cart/page.tsx
// DESCRIPTION: Cart page with remove buttons and final total.
//==============================================================

import Link from "next/link"
import { prisma } from "../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../lib/auth"
import RemoveFromCart from "../components/RemoveFromCart"

export default async function CartPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id as string | undefined

  const cart = userId
    ? await prisma.cart.findFirst({
        where: { userId },
        include: { items: { include: { book: true } } },
      })
    : null

  const total = cart?.items.reduce((a, b) => a + b.qty * b.book.priceCents, 0) ?? 0

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Your Cart</h1>

      {!userId && (
        <p className="opacity-80">
          Please <Link className="underline" href="/signin">sign in</Link> to use the cart.
        </p>
      )}

      {userId && (!cart || cart.items.length === 0) && <p>Your cart is empty.</p>}

      {userId && cart && cart.items.length > 0 && (
        <>
          <ul className="space-y-2">
            {cart.items.map((ci) => (
              <li
                key={ci.id}
                className="border rounded-2xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {ci.book.coverUrl && (
                    <img
                      src={ci.book.coverUrl}
                      alt=""
                      className="w-12 h-16 rounded-md object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium">{ci.book.title}</div>
                    <div className="opacity-70 text-sm">Qty: {ci.qty}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="font-semibold">
                    ${((ci.book.priceCents * ci.qty) / 100).toFixed(2)}
                  </div>
                  <RemoveFromCart bookId={ci.bookId} />
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between border rounded-2xl p-4">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold">${(total / 100).toFixed(2)}</span>
          </div>

          <div className="flex gap-3">
            <Link href="/" className="flex-1 text-center border rounded-2xl py-3">
              Continue Shopping
            </Link>
            <form action="/checkout" method="get" className="flex-1">
              <button className="w-full border rounded-2xl py-3">Proceed to Checkout</button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
