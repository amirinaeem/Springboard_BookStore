//==============================================================
// FILE: src/components/AddToCollection.tsx
// DESCRIPTION: Button + picker to add a book to an existing collection.
//==============================================================

'use client'

import { useEffect, useState } from "react"

type Collection = { id: string; name: string }

export default function AddToCollection({
  book,
  fromGoogle,
}: {
  book: any
  fromGoogle?: boolean
}) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    let cancelled = false
    async function load() {
      const res = await fetch("/api/collections", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      if (!cancelled) setCollections(data.items || [])
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  async function addTo(collectionId: string) {
    setLoading(true)
    setMsg("")
    try {
      const res = await fetch(`/api/collections/${collectionId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          fromGoogle ? { book, fromGoogle: true } : { bookId: book.id }
        ),
      })
      if (res.ok) {
        setMsg("Added!")
        setTimeout(() => {
          setOpen(false)
          setMsg("")
        }, 800)
      } else {
        const e = await res.json().catch(() => ({}))
        setMsg(e?.error || "Failed")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={!book}
        className="px-3 py-2 border rounded-xl hover:bg-gray-50 disabled:opacity-50"
      >
        Add to Collection
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 border rounded-2xl bg-white shadow p-2 z-20">
          <div className="text-sm font-medium mb-2">Pick a collection</div>
          {collections.length === 0 && (
            <div className="text-sm opacity-70">
              No collections yet. Create one in your Dashboard.
            </div>
          )}
          <ul className="max-h-64 overflow-auto">
            {collections.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => addTo(c.id)}
                  className="w-full text-left px-2 py-2 rounded-lg hover:bg-gray-100"
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-2 text-sm">
            {loading ? "Adding..." : msg}
          </div>
        </div>
      )}
    </div>
  )
}
