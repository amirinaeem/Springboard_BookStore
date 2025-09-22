//==============================================================
// FILE: src/app/checkout/page.tsx
// DESCRIPTION: Checkout summary, final total, Pay and Cancel.
//==============================================================

'use client'

import { useEffect, useState } from "react"
import Link from "next/link"

type CartItem = {
  id: string
  qty: number
  book?: { title: string; coverUrl?: string; priceCents: number }
}

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<CartItem[]>([])
  const total = items.reduce((a, b) => a + b.qty * (b.book?.priceCents ?? 0), 0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const res = await fetch('/api/cart', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      if (!cancelled) setItems(data.items || [])
    }
    load()
    return () => { cancelled = true }
  }, [])

  async function go() {
    setLoading(true)
    const res = await fetch("/api/checkout/session", { method: "POST" })
    const j = await res.json()
    setLoading(false)
    if (j.url) window.location.href = j.url
    else alert(j.error || "Failed to create session")
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Checkout</h1>

      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-2">
            {items.map((ci) => (
              <li key={ci.id} className="border rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {ci.book?.coverUrl && (
                    <img src={ci.book.coverUrl} alt="" className="w-10 h-14 rounded-md object-cover" />
                  )}
                  <div className="text-sm">
                    <div className="font-medium">{ci.book?.title ?? "Untitled"}</div>
                    <div className="opacity-70">Qty: {ci.qty}</div>
                  </div>
                </div>
                <div className="font-semibold">
                  ${(((ci.book?.priceCents ?? 0) * ci.qty) / 100).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between border rounded-2xl p-4">
            <span className="font-semibold">Final Total</span>
            <span className="text-xl font-bold">${(total / 100).toFixed(2)}</span>
          </div>

          <div className="flex gap-3">
            <Link href="/cart" className="flex-1 text-center border rounded-2xl py-3">
              Cancel
            </Link>
            <button
              onClick={go}
              disabled={loading}
              className="flex-1 border rounded-2xl py-3"
            >
              {loading ? "Creating session..." : "Pay with Stripe"}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
