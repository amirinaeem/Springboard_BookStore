//==============================================================
// FILE: src/app/import/page.tsx
// DESCRIPTION: Show Google Books results (metadata only).
//==============================================================

"use client"

import { useEffect, useState } from "react"
import Loading from "../components/Loading"
import BookCard from "../components/BookCard"

export default function ImportPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim() || ""
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<any[]>([])
  const [source, setSource] = useState<string>("")

  useEffect(() => {
    if (!q) return
    async function fetchBooks() {
      setLoading(true)
      try {
        const res = await fetch(`/api/books/search?q=${encodeURIComponent(q)}`, {
          cache: "no-store",
        })
        if (!res.ok) throw new Error("Search failed")
        const data = await res.json()
        setItems(data.items || [])
        setSource(data.source || "unknown")
      } catch (err) {
        console.error("Failed to load books", err)
        setItems([])
        setSource("error")
      } finally {
        setLoading(false)
      }
    }
    fetchBooks()
  }, [q])

  if (!q) return <p>No query provided.</p>
  if (loading) return <Loading />

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">
        {source === "google" ? "Google Results" : "Search Results"} for <em>{q}</em>
      </h1>

      {items.length === 0 && <p>No results found.</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((b: any) => (
          <BookCard
            key={b.id || b.googleVolumeId}
            book={b}
            fromGoogle={source === "google"}
          />
        ))}
      </div>
    </div>
  )
}

