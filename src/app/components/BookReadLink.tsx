"use client"
//==============================================================
// COMPONENT: BookReadLink
// DESCRIPTION: If the user owns the book -> open reader.
//              Otherwise -> modal to buy (auto add to cart).
//==============================================================

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function BookReadLink({
  bookId,
  owned,
  children,
  className = "",
}: {
  bookId: string
  owned: boolean
  children?: React.ReactNode
  className?: string
}) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [busy, setBusy] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (owned) router.push(`/books/${bookId}/read`)
    else setShowModal(true)
  }

  return (
    <>
      <a
        href={owned ? `/books/${bookId}/read` : "#"}
        onClick={handleClick}
        className={
          className ||
          `px-4 py-2 text-sm rounded-lg border transition ${
            owned
              ? "text-blue-600 border-blue-600 hover:bg-blue-50"
              : "text-gray-600 border-gray-300 hover:bg-gray-50"
          }`
        }
      >
        {children ?? (owned ? "View Online" : "Read")}
      </a>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Purchase required</h2>
            <p className="text-sm text-gray-600 mb-4">
              You need to buy this book to read it online.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 rounded-md border hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    setBusy(true)
                    // auto add to cart
                    await fetch("/api/cart", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ bookId, qty: 1 }),
                    })
                    router.push("/checkout")
                  } finally {
                    setBusy(false)
                    setShowModal(false)
                  }
                }}
                disabled={busy}
                className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {busy ? "Adding..." : "Buy now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
