//==============================================================
// FILE: src/components/AddToCart.tsx
// DESCRIPTION: Client component for adding a book to cart.
//==============================================================

'use client'

import { useState } from "react"

export default function AddToCart({
  book,
  fromGoogle,
}: {
  book: any
  fromGoogle?: boolean
}) {
  const [busy, setBusy] = useState(false)

  async function add() {
    setBusy(true)
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          fromGoogle
            ? { book, fromGoogle: true } // pass full Google book data
            : { bookId: book.id, qty: 1 } // pass DB book id
        ),
      })
      if (!res.ok) throw new Error("Failed")
      alert("Added to cart")
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={add}
      disabled={busy}
      className="px-4 py-2 border rounded-xl"
    >
      {busy ? "Adding..." : "Add to Cart"}
    </button>
  )
}
