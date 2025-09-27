"use client"

import { useState } from "react"

export default function CollectionCard({ collection }: { collection: any }) {
  const [expanded, setExpanded] = useState(false)
  const items = expanded ? collection.items : collection.items.slice(0, 6)

  return (
    <div className="border rounded-2xl p-4">
      <div className="font-medium">{collection.name}</div>
      <div className="text-sm opacity-70">{collection.items.length} item(s)</div>

      <div className="flex gap-2 mt-3 overflow-x-auto">
        {items.map((it: any) => (
          <a key={it.id} href={`/books/${it.bookId}`}>
            <img
              src={it.book.coverUrl || ""}
              alt={it.book.title}
              title={it.book.title}
              className="w-12 h-16 rounded-md object-cover hover:opacity-80 transition"
            />
          </a>
        ))}
      </div>

      {collection.items.length > 6 && (
        <button
          onClick={() => setExpanded((x) => !x)}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          {expanded ? "Show less" : `Show all (${collection.items.length})`}
        </button>
      )}
    </div>
  )
}
